// =============================================================================
// SERVICIO: matchingService
// Descripción : Lógica de negocio para el sistema de matching alumni-estudiante.
//               Reescrito para operar sobre el schema v20260608:
//               - Tabla `public.users` con campo `rol` (no `tipo`)
//               - Los campos de perfil viven directamente en `users`
//               - Tabla `curriculums` (no `curriculum`)
// =============================================================================

import { createClient } from '@/lib/supabase/server';

export type EstadoMatch  = 'sugerido' | 'contactado' | 'activo' | 'cerrado';
export type ResultadoMatch = 'exitoso' | 'cancelado' | 'en_progreso' | null;

export interface MatchSugerido {
  id: string;
  score_match: number;
  estado: EstadoMatch;
  tipo_apoyo: string;
  created_at: string;
  estudiante: {
    id: string;
    nombre: string;
    foto_url: string | null;
    areas_de_interes: string[];
    busca_mentoria: boolean;
    busca_empleo: boolean;
    busca_pasantia: boolean;
    carrera?: string | null;
    proyecto_titulo?: string | null;
    proyecto_area_tematica?: string | null;
  };
  exalumno: {
    id: string;
    nombre: string;
    foto_url: string | null;
    sector_industria: string[];
    areas_de_interes: string[];
    ofrece_mentoria: boolean;
    ofrece_empleo: boolean;
    ofrece_pasantia: boolean;
    cargo_actual?: string | null;
    carrera_ucr?: string | null;
    empresa_actual?: string | null;
  };
  desglosePuntaje: {
    mismaCarrera: boolean;
    areasEnComun: string[];
    sectorCoincide: boolean;
    apoyoCoincide: boolean;
  };
}

export interface RespuestaServicio {
  exito: boolean;
  mensaje: string;
  datos?: unknown;
}

// =============================================================================
// FUNCIÓN: obtenerMatchesSugeridos
// Retorna los matches del usuario con score > 0, ordenados de mayor a menor.
// Lee directamente de public.users para cada parte del match.
// =============================================================================
export async function obtenerMatchesSugeridos(userId: string): Promise<MatchSugerido[]> {
  const supabase = await createClient();

  // Query limpia: join directo a users para cada lado del match
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id, score_match, estado, tipo_apoyo, created_at,
      estudiante:users!matches_estudiante_id_fkey (
        id, nombre, foto_url,
        areas_de_interes, busca_mentoria, busca_empleo, busca_pasantia
      ),
      exalumno:users!matches_exalumno_id_fkey (
        id, nombre, foto_url,
        sector_industria, areas_de_interes,
        ofrece_mentoria, ofrece_empleo, ofrece_pasantia
      )
    `)
    .is('deleted_at', null)
    .or(`estudiante_id.eq.${userId},exalumno_id.eq.${userId}`)
    .gt('score_match', 0)
    .order('score_match', { ascending: false });

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(construirMatchSugerido);
}

// =============================================================================
// FUNCIÓN: iniciarConexionMatch
// Calcula el score vía RPC (calcular_score_matching) y persiste si score > 0.
// La función SQL ya opera sobre el nuevo schema (migración 16).
// =============================================================================
export async function iniciarConexionMatch(
  estudianteId: string,
  exalumnoId: string,
  tipoApoyo: string
): Promise<RespuestaServicio> {
  const supabase = await createClient();

  const { data: score, error: errScore } = await supabase.rpc(
    'calcular_score_matching',
    { p_estudiante_id: estudianteId, p_exalumno_id: exalumnoId }
  );

  if (errScore) return { exito: false, mensaje: errScore.message };
  if ((score as number) === 0) {
    return { exito: false, mensaje: 'Sin compatibilidad suficiente para crear el match.' };
  }

  const { data, error } = await supabase
    .from('matches')
    .upsert(
      {
        estudiante_id: estudianteId,
        exalumno_id:   exalumnoId,
        score_match:   score as number,
        estado:        'sugerido',
        tipo_apoyo:    tipoApoyo,
        iniciado_por:  'plataforma',
      },
      { onConflict: 'estudiante_id,exalumno_id' }
    )
    .select('id, score_match')
    .single();

  if (error) return { exito: false, mensaje: error.message };
  return { exito: true, mensaje: `Match creado con score ${score}.`, datos: data };
}

// =============================================================================
// FUNCIÓN: cambiarEstadoMatch
// Actualiza el estado del ciclo de vida del match. Al cerrar, registra resultado.
// =============================================================================
export async function cambiarEstadoMatch(
  matchId: string,
  nuevoEstado: EstadoMatch,
  resultado?: ResultadoMatch
): Promise<RespuestaServicio> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    estado:     nuevoEstado,
    updated_at: new Date().toISOString(),
  };
  if (nuevoEstado === 'cerrado' && resultado) payload.resultado = resultado;

  const { error } = await supabase.from('matches').update(payload).eq('id', matchId);
  if (error) return { exito: false, mensaje: error.message };
  return { exito: true, mensaje: `Estado actualizado a "${nuevoEstado}".` };
}

// =============================================================================
// FUNCIÓN: aceptarMatch
// Mueve el match a estado 'contactado' (exalumno aceptó la sugerencia).
// =============================================================================
export async function aceptarMatch(matchId: string): Promise<RespuestaServicio> {
  return cambiarEstadoMatch(matchId, 'contactado');
}

// =============================================================================
// FUNCIÓN: rechazarMatch
// Cierra el match con resultado 'cancelado'.
// =============================================================================
export async function rechazarMatch(matchId: string): Promise<RespuestaServicio> {
  return cambiarEstadoMatch(matchId, 'cerrado', 'cancelado');
}

// ─── HELPER INTERNO ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function construirMatchSugerido(raw: any): MatchSugerido {
  const areasEst:  string[] = raw.estudiante?.areas_de_interes ?? [];
  const areasExal: string[] = raw.exalumno?.areas_de_interes ?? [];
  const sectores:  string[] = raw.exalumno?.sector_industria ?? [];

  const areasEnComun  = areasEst.filter((a: string) =>
    areasExal.map((x: string) => x.toLowerCase()).includes(a.toLowerCase())
  );
  const sectorCoincide = sectores.some((s: string) =>
    areasEst.map((a: string) => a.toLowerCase()).includes(s.toLowerCase())
  );

  return {
    id:           raw.id,
    score_match:  raw.score_match,
    estado:       raw.estado as EstadoMatch,
    tipo_apoyo:   raw.tipo_apoyo,
    created_at:   raw.created_at,
    estudiante: {
      id:              raw.estudiante?.id ?? '',
      nombre:          raw.estudiante?.nombre ?? '',
      foto_url:        raw.estudiante?.foto_url ?? null,
      areas_de_interes: areasEst,
      busca_mentoria:  raw.estudiante?.busca_mentoria ?? false,
      busca_empleo:    raw.estudiante?.busca_empleo ?? false,
      busca_pasantia:  raw.estudiante?.busca_pasantia ?? false,
    },
    exalumno: {
      id:               raw.exalumno?.id ?? '',
      nombre:           raw.exalumno?.nombre ?? '',
      foto_url:         raw.exalumno?.foto_url ?? null,
      sector_industria: sectores,
      areas_de_interes: areasExal,
      ofrece_mentoria:  raw.exalumno?.ofrece_mentoria ?? false,
      ofrece_empleo:    raw.exalumno?.ofrece_empleo ?? false,
      ofrece_pasantia:  raw.exalumno?.ofrece_pasantia ?? false,
    },
    desglosePuntaje: {
      mismaCarrera: false, // La comparación exacta se hace por carrera_principal_id (entero), no texto
      areasEnComun,
      sectorCoincide,
      apoyoCoincide: raw.score_match > 0,
    },
  };
}
