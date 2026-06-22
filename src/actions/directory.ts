'use server'

import { createClient } from '@/lib/supabase/server'
import { obtenerMiPerfil } from './users'
import { calcularMatchExalumno } from '@/lib/match'

export interface ExalumnoDirectorio {
  id: string;
  nombre: string;
  apellidos: string | null;
  foto_url: string | null;
  pais_ciudad: string | null;
  carrera_principal: string | null;
  escuela_principal: string | null;
  facultad_principal: string | null;
  anio_graduacion: number | null;
  empresa_actual: string | null;
  cargo_actual: string | null;
  sector_industria: string[] | null;
  areas_de_interes: string[] | null;
  ofrece_mentoria: boolean;
  ofrece_empleo: boolean;
  ofrece_pasantia: boolean;
  ofrece_proyecto: boolean;
  ofrece_donacion_dinero: boolean;
  score_match: number;
  created_at: string;
  total_count: number;
  banner_url?: string | null;
}

interface BuscarParams {
  search?: string
  facultad?: string
  escuela?: string
  carreras?: string[]
  sectores?: string[]
  areas?: string[]
  apoyos?: string[]
  pais_ciudad?: string
  limit?: number
  offset?: number
}

export async function buscarExalumnosDirectorio(params: BuscarParams): Promise<{
  data: ExalumnoDirectorio[]
  total: number
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const limit = params.limit || 20
    const offset = params.offset || 0

    // Consultamos la tabla users haciendo inner join con exalumnos
    let query = supabase.from('users').select('*, exalumnos!inner(*)', { count: 'exact' })
      .eq('rol', 'exalumno')
      .eq('visible_en_directorio', true)
      .eq('activo', true)

    // Aplicar filtros
    if (params.facultad) query = query.eq('exalumnos.escuela_facultad', params.facultad) // Nota: exalumnos usa escuela_facultad
    // if (params.escuela) // En la nueva BD escuela y facultad estan unidos en escuela_facultad
    if (params.pais_ciudad) query = query.ilike('exalumnos.pais_ciudad', `%${params.pais_ciudad}%`)

    if (params.search) {
      const terminos = params.search.trim().split(/\s+/);
      terminos.forEach(termino => {
        query = query.or(`nombre.ilike.%${termino}%,apellidos.ilike.%${termino}%`);
      });
    }

    if (params.carreras && params.carreras.length > 0) {
      query = query.in('exalumnos.carrera_ucr', params.carreras)
    }

    if (params.sectores && params.sectores.length > 0) {
      query = query.contains('exalumnos.sector_industria', params.sectores)
    }

    if (params.areas && params.areas.length > 0) {
      query = query.contains('exalumnos.areas_de_interes', params.areas)
    }

    if (params.apoyos && params.apoyos.length > 0) {
      if (params.apoyos.includes('ofrece_mentoria')) query = query.eq('exalumnos.ofrece_mentoria', true);
      if (params.apoyos.includes('ofrece_empleo')) query = query.eq('exalumnos.ofrece_empleo', true);
      if (params.apoyos.includes('ofrece_pasantia')) query = query.eq('exalumnos.ofrece_pasantia', true);
      if (params.apoyos.includes('ofrece_proyecto')) query = query.eq('exalumnos.ofrece_proyecto', true);
      if (params.apoyos.includes('ofrece_donacion_dinero')) query = query.eq('exalumnos.ofrece_donacion_dinero', true);
    }

    const { data: dbData, error: dbError, count } = await query.order('created_at', { ascending: false })

    if (dbError) {
      console.error('Query error:', dbError)
      return { data: [], total: 0, error: `Error DB: ${dbError.message}` }
    }

    // Cargar foto_url y banner_url personalizados desde profiles
    const userIds = dbData?.map(d => d.id) || [];
    let profilesData: any[] = [];
    if (userIds.length > 0) {
      try {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, foto_url, banner_url')
          .in('id', userIds);
        if (profs) profilesData = profs;
      } catch (err) {
        console.error('Error fetching batch profiles:', err);
      }
    }

    const perfilActual = await obtenerMiPerfil().catch(() => null);

    // Mapear para que cumpla con el tipo ExalumnoDirectorio esperado por la UI
    let mapped = (dbData || []).map((item: any) => {
      const ex = Array.isArray(item.exalumnos) ? item.exalumnos[0] : item.exalumnos;
      const prof = profilesData.find(p => p.id === item.id);
      
      const mappedExalumno = {
        id: item.id,
        nombre: item.nombre || 'Exalumno',
        apellidos: item.apellidos || null,
        foto_url: prof?.foto_url || item.foto_url || null,
        banner_url: prof?.banner_url || null,
        pais_ciudad: ex?.pais_ciudad || null,
        carrera_principal: ex?.carrera_ucr || null,
        escuela_principal: ex?.escuela_facultad || null,
        facultad_principal: ex?.escuela_facultad || null,
        anio_graduacion: ex?.anio_graduacion || null,
        empresa_actual: ex?.empresa_actual || null,
        cargo_actual: ex?.cargo_actual || null,
        sector_industria: ex?.sector_industria || null,
        areas_de_interes: ex?.areas_de_interes || null,
        ofrece_mentoria: ex?.ofrece_mentoria || false,
        ofrece_empleo: ex?.ofrece_empleo || false,
        ofrece_pasantia: ex?.ofrece_pasantia || false,
        ofrece_proyecto: ex?.ofrece_proyecto || false,
        ofrece_donacion_dinero: ex?.ofrece_donacion_dinero || false,
        score_match: 0,
        created_at: item.created_at || new Date().toISOString(),
        total_count: count || 0
      };
      
      if (perfilActual) {
        mappedExalumno.score_match = calcularMatchExalumno(mappedExalumno, perfilActual);
      } else {
        const nombreStr = mappedExalumno.nombre || mappedExalumno.apellidos 
          ? `${mappedExalumno.nombre || ''} ${mappedExalumno.apellidos || ''}`.trim()
          : 'Exalumno UCR';
        mappedExalumno.score_match = nombreStr.length % 2 === 0 ? 85 : 68;
      }
      
      return mappedExalumno;
    }) as ExalumnoDirectorio[]

    if (perfilActual) {
      mapped.sort((a, b) => (b.score_match || 0) - (a.score_match || 0));
    }

    // Aplicar paginación en memoria para mantener el orden correcto del match
    const from = offset;
    const to = offset + limit;
    mapped = mapped.slice(from, to);

    return { data: mapped, total: count || 0, error: null }
  } catch (err: any) {
    console.error('Excepción en buscarExalumnosDirectorio:', err)
    return { data: [], total: 0, error: err.message || 'Excepción interna del servidor' }
  }
}
