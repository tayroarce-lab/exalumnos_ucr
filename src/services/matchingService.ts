// =============================================================================
// SERVICIO: matchingService
// Descripción : Lógica de negocio para el sistema de matching alumni-estudiante.
// =============================================================================

import { createClient } from '@/lib/supabase/server';

export type EstadoMatch = 'sugerido' | 'contactado' | 'activo' | 'cerrado';
export type ResultadoMatch = 'exitoso' | 'cancelado' | 'en_progreso' | null;

// GUARDRAIL: Sin promedio_ponderado ni beca_socioeconomica en este tipo
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
    carrera: string;
    sede: string;
    proyecto_titulo: string | null;
    proyecto_area_tematica: string | null;
    areas_de_interes: string[];
    proyecto_necesidades: string[];
  };
  exalumno: {
    id: string;
    nombre: string;
    foto_url: string | null;
    carrera_ucr: string;
    cargo_actual: string | null;
    empresa_actual: string | null;
    sector_industria: string[];
    areas_de_interes: string[];
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

// [VERDE - FUNCION: obtenerMatchesSugeridos]
// Retorna los matches del usuario con score > 0, ordenados de mayor a menor.
export async function obtenerMatchesSugeridos(userId: string): Promise<MatchSugerido[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(`
      id, score_match, estado, tipo_apoyo, created_at,
      est:estudiante_id ( id, nombre:users(nombre), foto_url:users(foto_url),
        carrera:estudiantes(carrera), sede:estudiantes(sede),
        proyecto_titulo:estudiantes(proyecto_titulo),
        proyecto_area_tematica:estudiantes(proyecto_area_tematica),
        areas_de_interes:estudiantes(areas_de_interes),
        proyecto_necesidades:estudiantes(proyecto_necesidades)
      ),
      exal:exalumno_id ( id, nombre:users(nombre), foto_url:users(foto_url),
        carrera_ucr:exalumnos(carrera_ucr),
        cargo_actual:exalumnos(cargo_actual),
        empresa_actual:exalumnos(empresa_actual),
        sector_industria:exalumnos(sector_industria),
        areas_de_interes:exalumnos(areas_de_interes)
      )
    `)
    .or(`estudiante_id.eq.${userId},exalumno_id.eq.${userId}`)
    .gt('score_match', 0)
    .order('score_match', { ascending: false });

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(construirMatchSugerido);
}

// [VERDE - FUNCION: iniciarConexionMatch]
// Calcula el score vía RPC y persiste el match si score > 0.
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
  if ((score as number) === 0) return { exito: false, mensaje: 'Sin compatibilidad suficiente.' };

  const { data, error } = await supabase
    .from('matches')
    .upsert(
      { estudiante_id: estudianteId, exalumno_id: exalumnoId,
        score_match: score as number, estado: 'sugerido',
        tipo_apoyo: tipoApoyo, iniciado_por: 'sistema' },
      { onConflict: 'estudiante_id,exalumno_id' }
    )
    .select('id, score_match')
    .single();

  if (error) return { exito: false, mensaje: error.message };
  return { exito: true, mensaje: `Match creado con score ${score}.`, datos: data };
}

// [VERDE - FUNCION: cambiarEstadoMatch]
// Actualiza el estado del ciclo de vida del match. Al cerrar, registra resultado.
export async function cambiarEstadoMatch(
  matchId: string,
  nuevoEstado: EstadoMatch,
  resultado?: ResultadoMatch
): Promise<RespuestaServicio> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    estado: nuevoEstado,
    updated_at: new Date().toISOString(),
  };
  if (nuevoEstado === 'cerrado' && resultado) payload.resultado = resultado;

  const { error } = await supabase.from('matches').update(payload).eq('id', matchId);
  if (error) return { exito: false, mensaje: error.message };
  return { exito: true, mensaje: `Estado actualizado a "${nuevoEstado}".` };
}

// [VERDE - FUNCION: aceptarMatch]
// Mueve el match a estado 'contactado' (exalumno aceptó la sugerencia).
export async function aceptarMatch(matchId: string): Promise<RespuestaServicio> {
  return cambiarEstadoMatch(matchId, 'contactado');
}

// [VERDE - FUNCION: rechazarMatch]
// Cierra el match con resultado 'cancelado'.
export async function rechazarMatch(matchId: string): Promise<RespuestaServicio> {
  return cambiarEstadoMatch(matchId, 'cerrado', 'cancelado');
}

// ─── HELPER INTERNO ──────────────────────────────────────────────────────────

// [VERDE - FUNCION: construirMatchSugerido]
// Transforma el objeto crudo de Supabase al tipo MatchSugerido con desglose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function construirMatchSugerido(raw: any): MatchSugerido {
  const areasEst: string[]  = raw.est?.areas_de_interes ?? [];
  const areasExal: string[] = raw.exal?.areas_de_interes ?? [];
  const sectores: string[]  = raw.exal?.sector_industria ?? [];
  const areaTematica        = raw.est?.proyecto_area_tematica ?? '';
  const areasEnComun        = areasEst.filter((a: string) => areasExal.includes(a));
  const sectorCoincide      = sectores.some(
    (s: string) => s.toLowerCase() === areaTematica.toLowerCase()
  );

  return {
    id: raw.id, score_match: raw.score_match,
    estado: raw.estado as EstadoMatch,
    tipo_apoyo: raw.tipo_apoyo, created_at: raw.created_at,
    estudiante: {
      id: raw.est?.id ?? '', nombre: raw.est?.nombre ?? '',
      foto_url: raw.est?.foto_url ?? null,
      carrera: raw.est?.carrera ?? '', sede: raw.est?.sede ?? '',
      proyecto_titulo: raw.est?.proyecto_titulo ?? null,
      proyecto_area_tematica: areaTematica,
      areas_de_interes: areasEst,
      proyecto_necesidades: raw.est?.proyecto_necesidades ?? [],
    },
    exalumno: {
      id: raw.exal?.id ?? '', nombre: raw.exal?.nombre ?? '',
      foto_url: raw.exal?.foto_url ?? null,
      carrera_ucr: raw.exal?.carrera_ucr ?? '',
      cargo_actual: raw.exal?.cargo_actual ?? null,
      empresa_actual: raw.exal?.empresa_actual ?? null,
      sector_industria: sectores, areas_de_interes: areasExal,
    },
    desglosePuntaje: {
      mismaCarrera: raw.est?.carrera?.toLowerCase() === raw.exal?.carrera_ucr?.toLowerCase(),
      areasEnComun, sectorCoincide, apoyoCoincide: raw.score_match > 0,
    },
  };
}
