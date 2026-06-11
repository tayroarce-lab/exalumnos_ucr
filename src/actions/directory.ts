'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type ExalumnoDirectorio = Database['public']['Functions']['buscar_directorio_exalumnos']['Returns'][number]

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

    // Ejecutar RPC con paginación
    const limit = params.limit || 20
    const offset = params.offset || 0

    // Llamada RPC
    const { data, error } = await supabase.rpc('buscar_directorio_exalumnos', {
      p_search: params.search || null,
      p_facultad: params.facultad || null,
      p_escuela: params.escuela || null,
      p_carreras: params.carreras && params.carreras.length > 0 ? params.carreras : null,
      p_sectores: params.sectores && params.sectores.length > 0 ? params.sectores : null,
      p_areas: params.areas && params.areas.length > 0 ? params.areas : null,
      p_apoyos: params.apoyos && params.apoyos.length > 0 ? params.apoyos : null,
      p_pais_ciudad: params.pais_ciudad || null,
      p_limit: limit,
      p_offset: offset,
    })

    if (!error && data) {
      const total = data && data.length > 0 ? data[0].total_count : 0
      return { data: data || [], total, error: null }
    }

    // FALLBACK DE EMERGENCIA: Si la RPC falla (por caché o porque no se ha corrido),
    // consultamos la tabla perfiles directamente para no bloquear la UI.
    console.warn('Error en buscar_directorio_exalumnos RPC, intentando fallback:', error?.message)
    
    let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('es_exalumno', true)
    
    // Aplicar filtros básicos al fallback
    if (params.facultad) query = query.eq('facultad_principal', params.facultad)
    if (params.escuela) query = query.eq('escuela_principal', params.escuela)
    if (params.pais_ciudad) query = query.ilike('pais_ciudad', `%${params.pais_ciudad}%`)
    if (params.search) {
       query = query.or(`nombre.ilike.%${params.search}%,apellidos.ilike.%${params.search}%,cargo_actual.ilike.%${params.search}%`)
    }
    
    const { data: fallbackData, error: fallbackError, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (fallbackError) {
      console.error('Fallback query error:', fallbackError)
      return { data: [], total: 0, error: `Error DB (Fallback): ${fallbackError.message}` }
    }

    // Mapear el fallback para que cumpla con el tipo ExalumnoDirectorio
    const mappedFallback = (fallbackData || []).map((item: any) => ({
       id: item.id,
       nombre: item.nombre || 'Exalumno',
       apellidos: item.apellidos || null,
       foto_url: item.foto_url || null,
       pais_ciudad: item.pais_ciudad || null,
       carrera_principal: item.carrera_principal || null,
       escuela_principal: item.escuela_principal || null,
       facultad_principal: item.facultad_principal || null,
       anio_graduacion: item.anio_graduacion || null,
       empresa_actual: item.empresa_actual || null,
       cargo_actual: item.cargo_actual || null,
       sector_industria: item.sector_industria || null,
       areas_de_interes: item.areas_de_interes || null,
       ofrece_mentoria: item.ofrece_mentoria || false,
       ofrece_empleo: item.ofrece_empleo || false,
       ofrece_pasantia: item.ofrece_pasantia || false,
       ofrece_proyecto: item.ofrece_proyecto || false,
       ofrece_donacion_dinero: item.ofrece_donacion_dinero || false,
       score_match: 0,
       created_at: item.created_at || new Date().toISOString(),
       total_count: count || 0
    })) as ExalumnoDirectorio[]

    return { data: mappedFallback, total: count || 0, error: null }
  } catch (err: any) {
    console.error('Excepción en buscarExalumnosDirectorio:', err)
    return { data: [], total: 0, error: err.message || 'Excepción interna del servidor' }
  }
}
