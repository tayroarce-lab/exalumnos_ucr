'use server'

/**
 * actions/matching.ts
 *
 * Server Actions para el cálculo y generación de scores de compatibilidad.
 *
 * Algoritmos implementados:
 *   1. calcularScoreMentoria()   — Score Estudiante ↔ Exalumno (máx. 100 pts)
 *   2. generarMatchesMentoria()  — Genera todos los matches de mentoría en lote
 *   3. calcularScorePuesto()     — Score Estudiante ↔ Posición (máx. 100 pts)
 *   4. generarScoresPuestos()    — Calcula scores para todos los pares activos
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface DesgloseMentoria {
  carrera: number       // 0 | 30
  areasInteres: number  // 0..30
  sectorVsArea: number  // 0 | 20
  tipoApoyo: number     // 0 | 20
}

export interface MatchMentoriaResult {
  score: number
  desglose: DesgloseMentoria
}

export interface DesglosePuesto {
  carreraVsSector: number  // 0 | 35
  habilidades: number      // 0..35
  areasInteres: number     // 0..20
  tipoApoyo: number        // 0 | 10
}

export interface MatchPuestoResult {
  score: number
  desglose: DesglosePuesto
}

export interface ResultadoLote {
  insertados: number
  errores: string[]
}

export interface ResultadoScoresPuestos {
  procesados: number
  errores: string[]
}

// ─── Funciones auxiliares de cálculo ────────────────────────────────────────

/**
 * Calcula qué proporción de los elementos de `referencia` están contenidos
 * en `comparado`. Normaliza a minúsculas para comparación sin diferenciación.
 *
 * @returns Número entre 0.0 y 1.0
 */
function interseccionProporcional(
  referencia: string[],
  comparado: string[]
): number {
  if (referencia.length === 0) return 0

  const refNorm = referencia.map((s) => s.toLowerCase().trim())
  const cmpNorm = comparado.map((s) => s.toLowerCase().trim())
  const coincidencias = refNorm.filter((item) => cmpNorm.includes(item))

  return coincidencias.length / refNorm.length
}

/**
 * Compara dos strings ignorando mayúsculas y espacios laterales.
 */
function coincideCadena(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false
  return a.toLowerCase().trim() === b.toLowerCase().trim()
}

/**
 * Verifica si `valor` está incluido dentro del array `arr`,
 * normalizando ambos a minúsculas.
 */
function incluidoEnArray(
  valor: string | null | undefined,
  arr: string[]
): boolean {
  if (!valor) return false
  const valorNorm = valor.toLowerCase().trim()
  return arr.map((s) => s.toLowerCase().trim()).includes(valorNorm)
}

// ─── Algoritmo 1: Mentoría (Estudiante ↔ Exalumno) ───────────────────────────

/**
 * Calcula el score de compatibilidad de mentoría entre un estudiante y un exalumno.
 *
 * Criterios de puntuación (total máximo: 100 puntos):
 *   - Misma carrera UCR                                    = 30 pts
 *   - Intersección proporcional de áreas de interés        = máx. 30 pts
 *   - Sector exalumno ⊇ área temática del proyecto         = 20 pts
 *   - Al menos un tipo de apoyo coincide (ofrece ↔ busca)  = 20 pts
 *
 * @param estudianteId - UUID del usuario estudiante.
 * @param exalumnoId   - UUID del usuario exalumno.
 * @returns Score total y desglose por criterio.
 */
export async function calcularScoreMentoria(
  estudianteId: string,
  exalumnoId: string
): Promise<MatchMentoriaResult> {
  const supabase = await createClient()

  const [{ data: estudiante, error: errEst }, { data: exalumno, error: errEx }] =
    await Promise.all([
      supabase
        .from('estudiantes')
        .select(
          'carrera, areas_de_interes, proyecto_area_tematica, busca_mentoria, busca_financiamiento, busca_empleo, busca_pasantia'
        )
        .eq('user_id', estudianteId)
        .single(),
      supabase
        .from('exalumnos')
        .select(
          'carrera_ucr, areas_de_interes, sector_industria, ofrece_mentoria, ofrece_donacion_dinero, ofrece_empleo, ofrece_pasantia'
        )
        .eq('user_id', exalumnoId)
        .single(),
    ])

  if (errEst) {
    throw new Error(`Error al obtener datos del estudiante: ${errEst.message}`)
  }
  if (errEx) {
    throw new Error(`Error al obtener datos del exalumno: ${errEx.message}`)
  }
  if (!estudiante) {
    throw new Error(`Estudiante con ID "${estudianteId}" no encontrado.`)
  }
  if (!exalumno) {
    throw new Error(`Exalumno con ID "${exalumnoId}" no encontrado.`)
  }

  // ── Criterio 1: Misma carrera UCR — 30 puntos ───────────────────────────
  const puntosCarrera = coincideCadena(estudiante.carrera, exalumno.carrera_ucr)
    ? 30
    : 0

  // ── Criterio 2: Intersección proporcional de áreas de interés — máx. 30 pts
  const areasEstudiante: string[] = estudiante.areas_de_interes ?? []
  const areasExalumno: string[] = exalumno.areas_de_interes ?? []
  const ratioAreas = interseccionProporcional(areasEstudiante, areasExalumno)
  const puntosAreas = Math.round(ratioAreas * 30)

  // ── Criterio 3: Sector del exalumno ⊇ área temática del proyecto — 20 pts
  const sectorExalumno: string[] = exalumno.sector_industria ?? []
  const areaTematica = estudiante.proyecto_area_tematica ?? ''
  const puntosSector = incluidoEnArray(areaTematica, sectorExalumno) ? 20 : 0

  // ── Criterio 4: Al menos un tipo de apoyo coincide — 20 puntos ──────────
  const paresApoyo: Array<[boolean | null, boolean | null]> = [
    [exalumno.ofrece_mentoria, estudiante.busca_mentoria],
    [exalumno.ofrece_donacion_dinero, estudiante.busca_financiamiento],
    [exalumno.ofrece_empleo, estudiante.busca_empleo],
    [exalumno.ofrece_pasantia, estudiante.busca_pasantia],
  ]
  const hayCoincidenciaApoyo = paresApoyo.some(
    ([ofrece, busca]) => ofrece === true && busca === true
  )
  const puntosTipoApoyo = hayCoincidenciaApoyo ? 20 : 0

  const scoreTotal =
    puntosCarrera + puntosAreas + puntosSector + puntosTipoApoyo

  return {
    score: Math.min(scoreTotal, 100),
    desglose: {
      carrera: puntosCarrera,
      areasInteres: puntosAreas,
      sectorVsArea: puntosSector,
      tipoApoyo: puntosTipoApoyo,
    },
  }
}

/**
 * Genera y persiste en la tabla `matches` todos los pares Estudiante ↔ Exalumno
 * cuyo score de mentoría supere el `umbralMinimo`. Evita duplicados.
 *
 * @param umbralMinimo - Score mínimo para crear el match (default: 40).
 * @returns Número de matches insertados y lista de errores parciales.
 */
export async function generarMatchesMentoria(
  umbralMinimo: number = 40
): Promise<ResultadoLote> {
  const supabase = await createClient()

  const [{ data: estudiantes, error: errEst }, { data: exalumnos, error: errEx }] =
    await Promise.all([
      supabase
        .from('estudiantes')
        .select('user_id')
        .eq('busca_mentoria', true)
        .eq('visible_en_directorio', true),
      supabase
        .from('exalumnos')
        .select('user_id')
        .eq('ofrece_mentoria', true)
        .eq('visible_en_directorio', true),
    ])

  if (errEst) {
    throw new Error(`Error al obtener lista de estudiantes: ${errEst.message}`)
  }
  if (errEx) {
    throw new Error(`Error al obtener lista de exalumnos: ${errEx.message}`)
  }

  const estudiantesList = estudiantes ?? []
  const exalumnosList = exalumnos ?? []
  const errores: string[] = []
  let insertados = 0

  for (const est of estudiantesList) {
    for (const ex of exalumnosList) {
      try {
        const resultado = await calcularScoreMentoria(est.user_id, ex.user_id)

        if (resultado.score < umbralMinimo) continue

        // Verificar si ya existe un match de mentoría entre este par
        const { data: matchExistente } = await supabase
          .from('matches')
          .select('id').is('deleted_at', null)
          .eq('estudiante_id', est.user_id)
          .eq('exalumno_id', ex.user_id)
          .eq('tipo_apoyo', 'mentoria')
          .maybeSingle()

        if (matchExistente) continue

        const { error: errInsert } = await supabase.from('matches').insert({
          exalumno_id: ex.user_id,
          estudiante_id: est.user_id,
          tipo_apoyo: 'mentoria',
          score_match: resultado.score,
          estado: 'sugerido',
          iniciado_por: 'plataforma',
        })

        if (errInsert) {
          errores.push(
            `Error insertando match ${est.user_id} ↔ ${ex.user_id}: ${errInsert.message}`
          )
        } else {
          insertados++
        }
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : String(err)
        errores.push(
          `Error calculando score ${est.user_id} ↔ ${ex.user_id}: ${mensaje}`
        )
      }
    }
  }

  revalidatePath('/dashboard/admin')
  return { insertados, errores }
}

// ─── Algoritmo 2: Compatibilidad de Puestos (Estudiante ↔ Posición) ──────────

/**
 * Calcula el score de compatibilidad entre un estudiante y una posición publicada.
 *
 * Criterios de puntuación (total máximo: 100 puntos):
 *   - Carrera del estudiante ⊆ sector de la posición             = 35 pts
 *   - Habilidades técnicas CV ∩ habilidades requeridas (prop.)   = máx. 35 pts
 *   - Áreas de interés del estudiante ∩ sector de la posición     = máx. 20 pts
 *   - Tipo de apoyo buscado coincide con el tipo de posición      = 10 pts
 *
 * @param estudianteId - UUID del usuario estudiante.
 * @param posicionId   - UUID de la posición publicada.
 * @returns Score total y desglose por criterio.
 */
export async function calcularScorePuesto(
  estudianteId: string,
  posicionId: string
): Promise<MatchPuestoResult> {
  const supabase = await createClient()

  const [
    { data: estudiante, error: errEst },
    { data: posicion, error: errPos },
    { data: curriculumData, error: errCv },
  ] = await Promise.all([
    supabase
      .from('estudiantes')
      .select('carrera, areas_de_interes, busca_empleo, busca_pasantia')
      .eq('user_id', estudianteId)
      .single(),
    supabase
      .from('posiciones')
      .select('sector, habilidades_requeridas, estado').is('deleted_at', null)
      .eq('id', posicionId)
      .single(),
    supabase
      .from('curriculum')
      .select('habilidades_tecnicas')
      .eq('estudiante_id', estudianteId)
      .maybeSingle(),
  ])

  if (errEst) {
    throw new Error(`Error al obtener datos del estudiante: ${errEst.message}`)
  }
  if (errPos) {
    throw new Error(`Error al obtener datos de la posición: ${errPos.message}`)
  }
  if (errCv) {
    throw new Error(`Error al obtener curriculum del estudiante: ${errCv.message}`)
  }
  if (!estudiante) {
    throw new Error(`Estudiante con ID "${estudianteId}" no encontrado.`)
  }
  if (!posicion) {
    throw new Error(`Posición con ID "${posicionId}" no encontrada.`)
  }

  // Si la posición no está activa, el score es 0
  if (posicion.estado !== 'activa') {
    return {
      score: 0,
      desglose: { carreraVsSector: 0, habilidades: 0, areasInteres: 0, tipoApoyo: 0 },
    }
  }

  // ── Criterio 1: Carrera del estudiante ⊆ sector de la posición — 35 pts ─
  const sectorPosicion: string[] = posicion.sector ?? []
  const puntosCarreraSector = incluidoEnArray(estudiante.carrera, sectorPosicion)
    ? 35
    : 0

  // ── Criterio 2: Habilidades CV ∩ habilidades requeridas — máx. 35 pts ───
  const habilidadesRequeridas: string[] = posicion.habilidades_requeridas ?? []

  // habilidades_tecnicas es JSONB: puede ser objeto { habilidad: nivel } o array
  // Se normaliza a un array de strings (claves del objeto o valores del array)
  const habilidadesCvRaw: unknown = curriculumData?.habilidades_tecnicas ?? {}
  let habilidadesCvArray: string[] = []

  if (Array.isArray(habilidadesCvRaw)) {
    habilidadesCvArray = (habilidadesCvRaw as unknown[]).map(String)
  } else if (
    typeof habilidadesCvRaw === 'object' &&
    habilidadesCvRaw !== null
  ) {
    habilidadesCvArray = Object.keys(
      habilidadesCvRaw as Record<string, unknown>
    )
  }

  const ratioHabilidades = interseccionProporcional(
    habilidadesRequeridas,
    habilidadesCvArray
  )
  const puntosHabilidades = Math.round(ratioHabilidades * 35)

  // ── Criterio 3: Áreas de interés ∩ sector de la posición — máx. 20 pts ──
  const areasEstudiante: string[] = estudiante.areas_de_interes ?? []
  const ratioAreas = interseccionProporcional(areasEstudiante, sectorPosicion)
  const puntosAreas = Math.round(ratioAreas * 20)

  // ── Criterio 4: Tipo de apoyo buscado coincide con el puesto — 10 pts ───
  const estudianteBuscaEmpleo: boolean = estudiante.busca_empleo ?? false
  const estudianteBuscaPasantia: boolean = estudiante.busca_pasantia ?? false
  const puntosTipoApoyo =
    estudianteBuscaEmpleo || estudianteBuscaPasantia ? 10 : 0

  const scoreTotal =
    puntosCarreraSector + puntosHabilidades + puntosAreas + puntosTipoApoyo

  return {
    score: Math.min(scoreTotal, 100),
    desglose: {
      carreraVsSector: puntosCarreraSector,
      habilidades: puntosHabilidades,
      areasInteres: puntosAreas,
      tipoApoyo: puntosTipoApoyo,
    },
  }
}

/**
 * Calcula los scores de compatibilidad para todos los pares
 * Estudiante activo ↔ Posición activa y retorna el conteo de pares
 * que superan el `umbralMinimo`. El resultado es utilizado por el sistema
 * de recomendaciones del dashboard de empleabilidad.
 *
 * @param umbralMinimo - Score mínimo de relevancia (default: 50).
 * @returns Total de pares relevantes y lista de errores parciales.
 */
export async function generarScoresPuestos(
  umbralMinimo: number = 50
): Promise<ResultadoScoresPuestos> {
  const supabase = await createClient()

  const [{ data: estudiantes, error: errEst }, { data: posiciones, error: errPos }] =
    await Promise.all([
      supabase
        .from('estudiantes')
        .select('user_id')
        .eq('visible_en_directorio', true)
        .or('busca_empleo.eq.true,busca_pasantia.eq.true'),
      supabase
        .from('posiciones')
        .select('id').is('deleted_at', null)
        .eq('estado', 'activa'),
    ])

  if (errEst) {
    throw new Error(`Error al obtener lista de estudiantes: ${errEst.message}`)
  }
  if (errPos) {
    throw new Error(`Error al obtener lista de posiciones: ${errPos.message}`)
  }

  const estudiantesList = estudiantes ?? []
  const posicionesList = posiciones ?? []
  const errores: string[] = []
  let procesados = 0

  for (const est of estudiantesList) {
    for (const pos of posicionesList) {
      try {
        const resultado = await calcularScorePuesto(est.user_id, pos.id)

        if (resultado.score >= umbralMinimo) {
          procesados++
        }
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : String(err)
        errores.push(
          `Error en par estudiante:${est.user_id} ↔ posición:${pos.id}: ${mensaje}`
        )
      }
    }
  }

  return { procesados, errores }
}
