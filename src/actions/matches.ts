'use server';

import { createClient } from '@/lib/supabase/server';
import { MatchAdminView, MatchFilters } from '@/types/matches';
import { sendMatchStatusUpdateEmail } from '@/services/email-service';

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

  // Si el estado pasa a "activo" o "cerrado", enviamos notificaciones
  if (estado === 'activo' || estado === 'cerrado') {
    // Obtenemos los correos del exalumno y estudiante
    const { data } = await supabase
      .from('matches')
      .select(`
        exalumno:users!matches_exalumno_id_fkey(nombre, email),
        estudiante:users!matches_estudiante_id_fkey(nombre, email)
      `)
      .eq('id', id)
      .single();
    const matchDetails = data as any;

    if (matchDetails) {
      const exNombre = Array.isArray(matchDetails.exalumno) ? matchDetails.exalumno[0]?.nombre : matchDetails.exalumno?.nombre;
      const exEmail = Array.isArray(matchDetails.exalumno) ? matchDetails.exalumno[0]?.email : matchDetails.exalumno?.email;
      const estNombre = Array.isArray(matchDetails.estudiante) ? matchDetails.estudiante[0]?.nombre : matchDetails.estudiante?.nombre;
      const estEmail = Array.isArray(matchDetails.estudiante) ? matchDetails.estudiante[0]?.email : matchDetails.estudiante?.email;

      if (exEmail && exNombre) await sendMatchStatusUpdateEmail(exEmail, exNombre, estado, resultado);
      if (estEmail && estNombre) await sendMatchStatusUpdateEmail(estEmail, estNombre, estado, resultado);
    }
  }

  return { success: true };
}

export async function getMyMatches() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'No autorizado' };
  }

  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      exalumno_id,
      estudiante_id,
      tipo_apoyo,
      score_match,
      estado,
      resultado,
      iniciado_por,
      created_at,
      exalumno:users!matches_exalumno_id_fkey(nombre, foto_url, carrera_principal_id, sector_industria, hobbies),
      estudiante:users!matches_estudiante_id_fkey(nombre, foto_url, carrera_principal_id, proyecto_area_tematica, hobbies)
    `)
    .is('deleted_at', null)
    .or(`estudiante_id.eq.${user.id},exalumno_id.eq.${user.id}`)
    .order('score_match', { ascending: false });

  if (error) {
    console.error('Error fetching user matches:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function requestConnection(matchId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  // Marcar como contactado e iniciado por el usuario actual
  const { error } = await supabase
    .from('matches')
    .update({
      estado: 'contactado',
      iniciado_por: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId)
    .or(`estudiante_id.eq.${user.id},exalumno_id.eq.${user.id}`);

  if (error) {
    console.error('Error requesting connection:', error);
    return { success: false, error: error.message };
  }

  // Notificar al otro usuario (se encarga updateMatch logic, pero como hicimos update directo aquí,
  // reutilizamos updateMatch para que envíe el correo, o mejor llamamos a updateMatch)
  // Como ya lo actualizamos, enviamos el email manualmente o refactorizamos. 
  // Mejor usamos updateMatch para la notificación.
  await updateMatch(matchId, 'contactado', null, null);

  return { success: true };
}

export async function respondToConnection(matchId: string, accept: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const estado = accept ? 'activo' : 'cerrado';
  const resultado = accept ? 'en_progreso' : 'cancelado';

  // Usamos updateMatch para que también envíe las notificaciones y admin notes (nulo de momento)
  const result = await updateMatch(matchId, estado, resultado, null);

  return result;
}
