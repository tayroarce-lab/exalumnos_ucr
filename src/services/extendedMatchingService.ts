import { createClient } from '@/lib/supabase/client';

// =============================================================================
// SERVICIO: extendedMatchingService
// Descripción : Lógica de acceso a datos para el Matching Extendido.
//               Obtiene las posiciones recomendadas para un estudiante basado
//               en el cálculo de score_match proveniente de la BD.
// GUARDRAIL   : Sin exposición de datos sensibles. Todo anónimo de cara al front.
// =============================================================================

export interface PosicionRecomendada {
  posicion_id: string;
  empresa: string;
  descripcion_general: string;
  sector: string[];
  carrera_requerida: string | null;
  sede_requerida: string | null;
  tipo_posicion: string | null;
  score_match: number;
  created_at: string;
}

// [VERDE - FUNCION: obtenerPosicionesCompatibles]
// Consulta la vista `view_student_position_matches` para obtener el feed de
// vacantes recomendadas, acotadas al estudiante logueado y ordenadas por score.
export async function obtenerPosicionesCompatibles(): Promise<PosicionRecomendada[]> {
  const supabase = createClient();

  // 1. Obtener estudiante actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('[extendedMatchingService] Usuario no autenticado:', userError);
    return [];
  }

  // 2. Consultar la vista que ya filtra scores > 30 (Regla de Exclusión)
  const { data, error } = await supabase
    .from('view_student_position_matches')
    .select('*')
    .eq('estudiante_id', user.id)
    .order('score_match', { ascending: false }); // Orden principal: Mayor compatibilidad
    // .order('created_at', { ascending: false }); // Descomentar para desempatar por recientes

  if (error) {
    console.error('[extendedMatchingService] Error obteniendo recomendaciones:', error.message);
    return [];
  }

  // Transformación segura y tipada
  return (data || []).map(row => ({
    posicion_id: row.posicion_id,
    empresa: row.empresa,
    descripcion_general: row.descripcion_general,
    sector: row.sector || [],
    carrera_requerida: row.carrera_requerida,
    sede_requerida: row.sede_requerida,
    tipo_posicion: row.tipo_posicion,
    score_match: row.score_match,
    created_at: row.created_at
  }));
}
