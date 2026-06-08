import { createClient } from '@/lib/supabase/client';

// =============================================================================
// SERVICIO: extendedMatchingService
// Descripción : Lógica de acceso a datos para el Matching Extendido.
//               Obtiene las posiciones recomendadas para un estudiante basado
//               en el score calculado por la vista `view_student_position_matches`.
// SCHEMA      : Opera sobre schema v20260608 (public.users con rol, curriculums)
// GUARDRAIL   : Sin exposición de datos sensibles. Todo anónimo de cara al front.
// =============================================================================

export interface PosicionRecomendada {
  posicion_id: string;
  empresa: string;
  titulo: string;
  descripcion_general: string;
  sector: string[];
  tipo_posicion: string | null;
  modalidad: string | null;
  lugar: string | null;
  score_match: number;
  created_at: string;
}

// =============================================================================
// FUNCIÓN: obtenerPosicionesCompatibles
// Consulta la vista `view_student_position_matches` (reescrita en migración 16)
// para obtener el feed de vacantes recomendadas del estudiante logueado.
// La vista ya filtra scores > 30 y solo posiciones con estado='activa'.
// =============================================================================
export async function obtenerPosicionesCompatibles(): Promise<PosicionRecomendada[]> {
  const supabase = createClient();

  // Obtener estudiante actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('[extendedMatchingService] Usuario no autenticado:', userError);
    return [];
  }

  // Consultar la vista con el schema actualizado
  const { data, error } = await supabase
    .from('view_student_position_matches')
    .select('*')
    .eq('estudiante_id', user.id)
    .order('score_match', { ascending: false });

  if (error) {
    console.error('[extendedMatchingService] Error obteniendo recomendaciones:', error.message);
    return [];
  }

  return (data || []).map(row => ({
    posicion_id:        row.posicion_id,
    empresa:            row.empresa,
    titulo:             row.titulo,
    descripcion_general: row.descripcion_general,
    sector:             row.sector || [],
    tipo_posicion:      row.tipo_posicion,
    modalidad:          row.modalidad,
    lugar:              row.lugar,
    score_match:        row.score_match,
    created_at:         row.created_at,
  }));
}
