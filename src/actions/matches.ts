'use server';

import { createClient } from '@/lib/supabase/server';
import { MatchAdminView, MatchFilters } from '@/types/matches';

export async function getMatches(filters?: MatchFilters): Promise<{ data: MatchAdminView[] | null; error: string | null }> {
  const supabase = await createClient();

  // Obtenemos los matches.
  // Nota: Dado que la FK va hacia users y luego a estudiantes, hacemos los joins
  // asumiendo la nomenclatura estándar de Supabase para las FK.
  let query = supabase
    .from('matches')
    .select(`
      id,
      exalumno_id,
      estudiante_id,
      tipo_apoyo,
      score_match,
      estado,
      resultado,
      notas_admin,
      created_at,
      updated_at,
      exalumno:users!matches_exalumno_id_fkey(nombre),
      estudiante:users!matches_estudiante_id_fkey(nombre),
      perfil_estudiante:estudiantes!matches_estudiante_id_fkey(carrera)
    `).is('deleted_at', null);

  if (filters?.estado && filters.estado !== 'todos') {
    query = query.eq('estado', filters.estado);
  }

  if (filters?.tipo_apoyo && filters.tipo_apoyo !== 'todos') {
    query = query.eq('tipo_apoyo', filters.tipo_apoyo);
  }
  
  if (filters?.fecha_inicio) {
    query = query.gte('created_at', filters.fecha_inicio);
  }
  
  if (filters?.fecha_fin) {
    query = query.lte('created_at', filters.fecha_fin);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching matches:', error);
    return { data: null, error: error.message };
  }

  // Mapeamos a la interfaz que espera el frontend
  // Manejamos posilbes arrays (Supabase a veces retorna arrays de joins dependiendo de la cardinalidad definida).
  const formattedData: MatchAdminView[] = (data || []).map((match: any) => ({
    id: match.id,
    exalumno_id: match.exalumno_id,
    estudiante_id: match.estudiante_id,
    exalumno_nombre: Array.isArray(match.exalumno) ? match.exalumno[0]?.nombre || 'Desconocido' : match.exalumno?.nombre || 'Desconocido',
    estudiante_nombre: Array.isArray(match.estudiante) ? match.estudiante[0]?.nombre || 'Desconocido' : match.estudiante?.nombre || 'Desconocido',
    tipo_apoyo: match.tipo_apoyo,
    score_match: match.score_match,
    estado: match.estado,
    resultado: match.resultado,
    notas_admin: match.notas_admin,
    created_at: match.created_at,
    updated_at: match.updated_at,
    estudiante_carrera: Array.isArray(match.perfil_estudiante) ? match.perfil_estudiante[0]?.carrera || 'N/A' : match.perfil_estudiante?.carrera || 'N/A',
  }));

  // Filtrado por carrera en memoria ya que está anidado (si aplica)
  let finalData = formattedData;
  if (filters?.carrera && filters.carrera !== 'todas') {
    finalData = finalData.filter(m => m.estudiante_carrera.toLowerCase().includes(filters.carrera!.toLowerCase()));
  }

  return { data: finalData, error: null };
}

export async function updateMatch(
  id: string,
  estado: 'sugerido' | 'contactado' | 'activo' | 'cerrado',
  resultado: 'exitoso' | 'cancelado' | 'en_progreso' | null,
  notas_admin: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('matches')
    .update({
      estado,
      resultado,
      notas_admin,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating match:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
