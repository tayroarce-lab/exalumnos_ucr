'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Helper para verificar autenticación y rol de administrador
async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .is('deleted_at', null)
    .eq('id', user.id)
    .single();

  if (profile?.tipo !== 'admin') {
    throw new Error('Solo los administradores tienen acceso a esta acción');
  }

  return { user, adminClient };
}

export interface RF10Filtros {
  search?: string;
  tipo?: string;
  carrera?: string;
  modalidad?: string;
  estado?: string;
}

export interface RF10Vacante {
  id: string;
  titulo: string;
  tipo: 'empleo' | 'pasantia';
  modalidad: string;
  empresa: string;
  lugar: string;
  estado: 'activa' | 'pausada' | 'cerrada' | 'cubierta';
  fecha_limite: string | null;
  created_at: string;
  carrera: string | null;
  exalumno: {
    nombre: string;
    email: string;
  } | null;
}

// =============================================================================
// FUNCIÓN: listarVacantesConFiltrosRF10
// Descripción: Obtiene posiciones aplicando filtros directamente en Supabase.
// =============================================================================
export async function listarVacantesConFiltrosRF10(filtros?: RF10Filtros): Promise<RF10Vacante[]> {
  try {
    const { adminClient } = await checkAdminAuth();

    // 1. Filtrar por carrera en la tabla profiles para obtener exalumno_ids compatibles
    let exalumnoIdsFiltered: string[] | null = null;
    if (filtros?.carrera && filtros.carrera !== 'all') {
      const { data: profilesFiltered, error: profError } = await adminClient
        .from('profiles')
        .select('id')
        .eq('carrera_principal', filtros.carrera);

      if (profError) {
        console.error('Error filtrando perfiles por carrera:', profError.message);
      }
      exalumnoIdsFiltered = (profilesFiltered || []).map((p) => p.id);
      
      // Si la carrera no tiene exalumnos asociados, retornamos vacío de una vez
      if (exalumnoIdsFiltered.length === 0) {
        return [];
      }
    }

    // 2. Si hay texto de búsqueda, buscamos usuarios cuyo nombre/apellido coincida
    let matchedUserIds: string[] = [];
    const searchVal = filtros?.search?.trim();
    if (searchVal && searchVal.length >= 2) {
      const { data: matchedProfiles } = await adminClient
        .from('profiles')
        .select('id')
        .or(`nombre.ilike.%${searchVal}%,apellidos.ilike.%${searchVal}%`);
      matchedUserIds = (matchedProfiles || []).map((p) => p.id);
    }

    // 3. Consulta de posiciones en Supabase
    let query = adminClient
      .from('posiciones')
      .select(`
        *,
        exalumno:users!posiciones_exalumno_id_fkey(
          id,
          nombre,
          email
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Aplicación de filtros de tipo, modalidad y estado
    if (filtros?.tipo && filtros.tipo !== 'all') {
      query = query.eq('tipo', filtros.tipo);
    }
    if (filtros?.modalidad && filtros.modalidad !== 'all') {
      query = query.eq('modalidad', filtros.modalidad);
    }
    if (filtros?.estado && filtros.estado !== 'all') {
      query = query.eq('estado', filtros.estado);
    }

    // Aplicación del filtro de carrera
    if (exalumnoIdsFiltered !== null) {
      query = query.in('exalumno_id', exalumnoIdsFiltered);
    }

    // Búsqueda de texto (título, empresa, o exalumno coincidente)
    if (searchVal && searchVal.length >= 2) {
      let filterStr = `titulo.ilike.%${searchVal}%,empresa.ilike.%${searchVal}%`;
      if (matchedUserIds.length > 0) {
        filterStr += `,exalumno_id.in.(${matchedUserIds.join(',')})`;
      }
      query = query.or(filterStr);
    }

    const { data: positions, error: errorPos } = await query;
    if (errorPos) throw new Error(errorPos.message);

    const positionsData = positions ?? [];
    if (positionsData.length === 0) return [];

    // 4. Consultar carrera_principal de los exalumnos para adjuntarla
    const exalumnoIds = positionsData.map((p) => p.exalumno_id).filter(Boolean);
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, carrera_principal')
      .in('id', exalumnoIds);

    // 5. Mapeo final a interfaz limpia de retorno
    return (positionsData as any[]).map((pos) => {
      const profile = profiles?.find((p) => p.id === pos.exalumno_id);
      
      let exalumnoData = null;
      if (pos.exalumno) {
        if (Array.isArray(pos.exalumno)) {
          if (pos.exalumno.length > 0) {
            exalumnoData = {
              nombre: pos.exalumno[0].nombre || '',
              email: pos.exalumno[0].email || '',
            };
          }
        } else {
          exalumnoData = {
            nombre: pos.exalumno.nombre || '',
            email: pos.exalumno.email || '',
          };
        }
      }

      return {
        id: pos.id,
        titulo: pos.titulo,
        tipo: pos.tipo as 'empleo' | 'pasantia',
        modalidad: pos.modalidad || '',
        empresa: pos.empresa,
        lugar: pos.lugar || '',
        estado: pos.estado as 'activa' | 'pausada' | 'cerrada' | 'cubierta',
        fecha_limite: pos.fecha_limite,
        created_at: pos.created_at,
        carrera: profile?.carrera_principal || null,
        exalumno: exalumnoData,
      };
    });
  } catch (err: any) {
    console.error('Error en listarVacantesConFiltrosRF10:', err.message);
    throw err;
  }
}

// =============================================================================
// FUNCIÓN: actualizarEstadoVacanteAdminRF10
// Descripción: Permite al administrador cambiar el estado de la vacante.
// =============================================================================
export async function actualizarEstadoVacanteAdminRF10(
  id: string,
  estado: 'activa' | 'pausada' | 'cerrada' | 'cubierta'
) {
  try {
    const { adminClient } = await checkAdminAuth();

    const { error } = await adminClient
      .from('posiciones')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    console.error('Error en actualizarEstadoVacanteAdminRF10:', err.message);
    throw err;
  }
}
