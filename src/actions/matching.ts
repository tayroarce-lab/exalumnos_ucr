'use server'

/**
 * actions/matching.ts
 *
 * Server Actions para el cálculo y generación de scores de compatibilidad.
 * REESCRITO para schema v20260608: usa public.users (con campo `rol`) y
 * public.curriculums (renombrada). Las tablas `estudiantes` y `exalumnos`
 * ya no existen.
 *
 * Algoritmos implementados:
 *   1. calcularScoreMentoria()   — Score Estudiante ↔ Exalumno (máx. 100 pts)
 *   2. generarMatchesMentoria()  — Genera todos los matches de mentoría en lote
 *   3. calcularScorePuesto()     — Score Estudiante ↔ Posición (máx. 100 pts)
 *   4. generarScoresPuestos()    — Persiste scores para todos los pares activos
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface DesgloseMentoria {
  carrera: number       // 0 | 25
  areasInteres: number  // 0..25
  sectorVsAreas: number // 0 | 20
  tipoApoyo: number     // 0 | 20
  hobbies: number       // 0..10
}

export interface MatchMentoriaResult {
  score: number
  desglose: DesgloseMentoria
}

export interface DesglosePuesto {
  areaSector: number    // 0 | 35
  habilidades: number   // 0..35
  areasInteres: number  // 0..20
  tipoApoyo: number     // 0 | 10
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

// ─── Tipo de perfil del usuario desde public.users ───────────────────────────

interface PerfilUsuario {
  id: string
  rol: string
  carrera_principal_id: number | null
  areas_de_interes: string[] | null
  sector_industria: string[] | null
  hobbies: string[] | null
  proyecto_area_tematica: string | null
  busca_mentoria: boolean
  busca_empleo: boolean
  busca_pasantia: boolean
  busca_financiamiento: boolean
  ofrece_mentoria: boolean
  ofrece_empleo: boolean
  ofrece_pasantia: boolean
  ofrece_donacion_dinero: boolean
  visible_en_directorio: boolean
}

// ─── Algoritmo 1: Mentoría (Estudiante ↔ Exalumno) ───────────────────────────

/**
 * Calcula el score de compatibilidad de mentoría entre un estudiante y un exalumno.
 * Lee de public.users (schema v20260608).
 *
 * Criterios de puntuación (total máximo: 100 puntos):
 *   - Misma carrera principal (carrera_principal_id)    = 25 pts
 *   - Intersección proporcional de áreas de interés     = máx. 25 pts
 *   - Sector exalumno ∩ área proyecto estudiante        = 20 pts
 *   - Al menos un tipo de apoyo coincide                = 20 pts
 *   - Hobbies en común                                  = máx. 10 pts
 */
export async function calcularScoreMentoria(
  estudianteId: string,
  exalumnoId: string
): Promise<MatchMentoriaResult> {
  const supabase = await createClient()

  const camposRequeridos = `
    id, rol, carrera_principal_id, hobbies,
    busca_mentoria, busca_empleo, busca_pasantia, busca_financiamiento,
    ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_donacion_dinero,
    visible_en_directorio,
    users_areas_interes(catalogo_areas_interes(nombre)),
    exalumnos(sector_industria),
    estudiantes(proyecto_area_tematica)
  `

  const [{ data: estudiante, error: errEst }, { data: exalumno, error: errEx }] =
    await Promise.all([
      supabase
        .from('users')
        .select(camposRequeridos)
        .eq('id', estudianteId)
        .eq('rol', 'estudiante')
        .is('deleted_at', null)
        .single(),
      supabase
        .from('users')
        .select(camposRequeridos)
        .eq('id', exalumnoId)
        .eq('rol', 'exalumno')
        .is('deleted_at', null)
        .single(),
    ])

  if (errEst) throw new Error(`Error al obtener estudiante: ${errEst.message}`)
  if (errEx)  throw new Error(`Error al obtener exalumno: ${errEx.message}`)
  if (!estudiante) throw new Error(`Estudiante "${estudianteId}" no encontrado.`)
  if (!exalumno)   throw new Error(`Exalumno "${exalumnoId}" no encontrado.`)

  const mapAreas = (u: any) => {
    const arr = u.users_areas_interes?.map((ua: any) => ua.catalogo_areas_interes?.nombre).filter(Boolean) || []
    return { 
      ...u, 
      areas_de_interes: arr,
      sector_industria: Array.isArray(u.exalumnos) ? u.exalumnos[0]?.sector_industria : u.exalumnos?.sector_industria,
      proyecto_area_tematica: Array.isArray(u.estudiantes) ? u.estudiantes[0]?.proyecto_area_tematica : u.estudiantes?.proyecto_area_tematica
    }
  }

  const est = mapAreas(estudiante) as PerfilUsuario
  const exal = mapAreas(exalumno) as PerfilUsuario

  // ── Criterio 1: Misma carrera principal — 25 puntos ─────────────────────
  const puntosCarrera =
    est.carrera_principal_id !== null &&
    exal.carrera_principal_id !== null &&
    est.carrera_principal_id === exal.carrera_principal_id
      ? 25 : 0

  // ── Criterio 2: Intersección proporcional de áreas de interés — máx. 25 pts
  const areasEst:  string[] = est.areas_de_interes ?? []
  const areasExal: string[] = exal.areas_de_interes ?? []
  const ratioAreas = interseccionProporcional(areasEst, areasExal)
  const puntosAreas = Math.round(ratioAreas * 25)

  // ── Criterio 3: Sector exalumno ∩ área proyecto estudiante — 20 pts ─────
  const sectoresExal: string[] = exal.sector_industria ?? []
  const proyectoAreaEst: string | null = est.proyecto_area_tematica
  let puntosSector = 0
  if (proyectoAreaEst) {
    puntosSector = incluidoEnArray(proyectoAreaEst, sectoresExal) ? 20 : 0
  }

  // ── Criterio 4: Al menos un tipo de apoyo coincide — 20 puntos ──────────
  const hayCoincidenciaApoyo =
    (exal.ofrece_mentoria       && est.busca_mentoria)      ||
    (exal.ofrece_empleo         && est.busca_empleo)        ||
    (exal.ofrece_pasantia       && est.busca_pasantia)      ||
    (exal.ofrece_donacion_dinero && est.busca_financiamiento)
  const puntosTipoApoyo = hayCoincidenciaApoyo ? 20 : 0

  // ── Criterio 5: Hobbies en común — máx. 10 puntos ──────────
  const hobbiesEst: string[] = est.hobbies ?? []
  const hobbiesExal: string[] = exal.hobbies ?? []
  const ratioHobbies = interseccionProporcional(hobbiesEst, hobbiesExal)
  const puntosHobbies = Math.round(ratioHobbies * 10)

  const scoreTotal = puntosCarrera + puntosAreas + puntosSector + puntosTipoApoyo + puntosHobbies

  return {
    score: Math.min(scoreTotal, 100),
    desglose: {
      carrera:       puntosCarrera,
      areasInteres:  puntosAreas,
      sectorVsAreas: puntosSector,
      tipoApoyo:     puntosTipoApoyo,
      hobbies:       puntosHobbies,
    },
  }
}

/**
 * Genera y persiste en la tabla `matches` todos los pares Estudiante ↔ Exalumno
 * cuyo score de mentoría supere el `umbralMinimo`. Evita duplicados.
 * Lee directamente de public.users filtrando por rol y deleted_at.
 */
export async function generarMatchesMentoria(
  umbralMinimo: number = 1,
  estudianteId?: string
): Promise<ResultadoLote> {
  const adminClient = createAdminClient()

  let queryEstudiantes = adminClient
    .from('users')
    .select('id')
    .eq('rol', 'estudiante')
    .eq('busca_mentoria', true)
    .eq('visible_en_directorio', true)
    .is('deleted_at', null)

  if (estudianteId) {
    queryEstudiantes = queryEstudiantes.eq('id', estudianteId)
  }

  const [{ data: estudiantes, error: errEst }, { data: exalumnos, error: errEx }] =
    await Promise.all([
      queryEstudiantes,
      adminClient
        .from('users')
        .select('id')
        .eq('rol', 'exalumno')
        .eq('ofrece_mentoria', true)
        .eq('visible_en_directorio', true)
        .is('deleted_at', null),
    ])

  if (errEst) throw new Error(`Error al obtener estudiantes: ${errEst.message}`)
  if (errEx)  throw new Error(`Error al obtener exalumnos: ${errEx.message}`)

  const estudiantesList = estudiantes ?? []
  const exalumnosList   = exalumnos ?? []
  const errores: string[] = []
  let insertados = 0

  for (const est of estudiantesList) {
    for (const ex of exalumnosList) {
      try {
        const resultado = await calcularScoreMentoria(est.id, ex.id)
        if (resultado.score < umbralMinimo) continue

        // Verificar si ya existe un match de mentoría entre este par
        // Si existe, lo ignoramos, incluso si fue rechazado (estado 'cerrado', resultado 'cancelado')
        const { data: matchExistente } = await adminClient
          .from('matches')
          .select('id')
          .is('deleted_at', null)
          .eq('estudiante_id', est.id)
          .eq('exalumno_id', ex.id)
          .eq('tipo_apoyo', 'mentoria')
          .maybeSingle()

        if (matchExistente) continue

        const { error: errInsert } = await adminClient.from('matches').insert({
          exalumno_id:  ex.id,
          estudiante_id: est.id,
          tipo_apoyo:   'mentoria',
          score_match:  resultado.score,
          estado:       'sugerido',
          iniciado_por: 'plataforma',
        })

        if (errInsert) {
          errores.push(`Error insertando ${est.id} ↔ ${ex.id}: ${errInsert.message}`)
        } else {
          insertados++
        }
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : String(err)
        errores.push(`Error calculando score ${est.id} ↔ ${ex.id}: ${mensaje}`)
      }
    }
  }

  revalidatePath('/dashboard/admin')
  return { insertados, errores }
}

// ─── Algoritmo 2: Compatibilidad de Puestos (Estudiante ↔ Posición) ──────────

/**
 * Calcula el score de compatibilidad entre un estudiante y una posición publicada.
 * Lee de public.users + public.curriculums (tabla renombrada en migración 20260608).
 *
 * Criterios de puntuación (total máximo: 100 puntos):
 *   - Área de interés estudiante ⊆ sector de la posición     = 35 pts
 *   - Habilidades técnicas CV ∩ habilidades requeridas (prop) = máx. 35 pts
 *   - Áreas de interés ∩ sector de la posición (proporcional) = máx. 20 pts
 *   - Tipo de apoyo buscado coincide con tipo de posición     = 10 pts
 */
export async function calcularScorePuesto(
  estudianteId: string,
  posicionId: string
): Promise<MatchPuestoResult> {
  const supabase = await createClient()

  const [
    { data: estudiante, error: errEst },
    { data: posicion,   error: errPos },
    { data: cvData,     error: errCv  },
  ] = await Promise.all([
    supabase
      .from('users')
      .select(`
          busca_empleo, 
          busca_pasantia,
          users_areas_interes(catalogo_areas_interes(nombre))
        `)
      .eq('id', estudianteId)
      .eq('rol', 'estudiante')
      .is('deleted_at', null)
      .single(),
    supabase
      .from('posiciones')
      .select('sector, habilidades_requeridas, estado, tipo')
      .is('deleted_at', null)
      .eq('id', posicionId)
      .single(),
    // curriculums = nombre correcto tras migración 20260608
    supabase
      .from('curriculums')
      .select('habilidades_tecnicas')
      .eq('user_id', estudianteId)
      .maybeSingle(),
  ])

  if (errEst) throw new Error(`Error al obtener estudiante: ${errEst.message}`)
  if (errPos) throw new Error(`Error al obtener posición: ${errPos.message}`)
  if (errCv)  throw new Error(`Error al obtener curriculum: ${errCv.message}`)
  if (!estudiante) throw new Error(`Estudiante "${estudianteId}" no encontrado.`)
  if (!posicion)   throw new Error(`Posición "${posicionId}" no encontrada.`)

  const mapAreas = (u: any) => {
    return u.users_areas_interes?.map((ua: any) => ua.catalogo_areas_interes?.nombre).filter(Boolean) || []
  }

  // Si la posición no está activa (usa 'activa', no 'abierta'), score = 0
  if (posicion.estado !== 'activa') {
    return { score: 0, desglose: { areaSector: 0, habilidades: 0, areasInteres: 0, tipoApoyo: 0 } }
  }

  const areasEst: string[]        = mapAreas(estudiante)
  const sectorPos: string[]        = posicion.sector ?? []
  const habilidadesReq: string[]   = posicion.habilidades_requeridas ?? []

  // Extraer claves del JSONB { "React": "avanzado", ... } → ["React", ...]
  const habilidadesCvRaw: unknown = cvData?.habilidades_tecnicas ?? {}
  let habilidadesCvArray: string[] = []
  if (Array.isArray(habilidadesCvRaw)) {
    habilidadesCvArray = (habilidadesCvRaw as unknown[]).map(String)
  } else if (typeof habilidadesCvRaw === 'object' && habilidadesCvRaw !== null) {
    habilidadesCvArray = Object.keys(habilidadesCvRaw as Record<string, unknown>)
  }

  // ── Criterio 1: Área de interés estudiante ⊆ sector posición — 35 pts ───
  const puntosAreaSector = areasEst.some((a) => incluidoEnArray(a, sectorPos)) ? 35 : 0

  // ── Criterio 2: Habilidades CV ∩ habilidades requeridas — máx. 35 pts ───
  const ratioHabilidades = interseccionProporcional(habilidadesReq, habilidadesCvArray)
  const puntosHabilidades = Math.round(ratioHabilidades * 35)

  // ── Criterio 3: Áreas de interés ∩ sector posición — máx. 20 pts ────────
  const ratioAreas = interseccionProporcional(areasEst, sectorPos)
  const puntosAreas = Math.round(ratioAreas * 20)

  // ── Criterio 4: Tipo de apoyo buscado coincide — 10 pts ─────────────────
  const puntosTipoApoyo =
    (posicion.tipo === 'empleo'   && estudiante.busca_empleo) ||
    (posicion.tipo === 'pasantia' && estudiante.busca_pasantia)
      ? 10 : 0

  const scoreTotal = puntosAreaSector + puntosHabilidades + puntosAreas + puntosTipoApoyo

  return {
    score: Math.min(scoreTotal, 100),
    desglose: {
      areaSector:  puntosAreaSector,
      habilidades: puntosHabilidades,
      areasInteres: puntosAreas,
      tipoApoyo:   puntosTipoApoyo,
    },
  }
}

/**
 * Calcula y PERSISTE los scores de compatibilidad para todos los pares
 * Estudiante activo ↔ Posición activa que superen el `umbralMinimo`.
 * CORREGIDO: ahora sí inserta en la tabla `matches` (a diferencia de la
 * versión anterior que solo contaba sin persistir).
 */
export async function generarScoresPuestos(
  umbralMinimo: number = 50
): Promise<ResultadoScoresPuestos> {
  const adminClient = createAdminClient()

  const [{ data: estudiantes, error: errEst }, { data: posiciones, error: errPos }] =
    await Promise.all([
      adminClient
        .from('users')
        .select('id')
        .eq('rol', 'estudiante')
        .eq('visible_en_directorio', true)
        .is('deleted_at', null)
        .or('busca_empleo.eq.true,busca_pasantia.eq.true'),
      adminClient
        .from('posiciones')
        .select('id, exalumno_id')
        .is('deleted_at', null)
        .eq('estado', 'activa'),
    ])

  if (errEst) throw new Error(`Error al obtener estudiantes: ${errEst.message}`)
  if (errPos) throw new Error(`Error al obtener posiciones: ${errPos.message}`)

  const estudiantesList = estudiantes ?? []
  const posicionesList  = posiciones ?? []
  const errores: string[] = []
  let procesados = 0

  for (const est of estudiantesList) {
    for (const pos of posicionesList) {
      try {
        const resultado = await calcularScorePuesto(est.id, pos.id)
        if (resultado.score < umbralMinimo) continue

        // PERSISTE el match en la tabla matches (corrección de bug)
        const { error: errUpsert } = await adminClient
          .from('matches')
          .upsert(
            {
              estudiante_id: est.id,
              exalumno_id:   pos.exalumno_id,
              tipo_apoyo:    'puesto',
              score_match:   resultado.score,
              estado:        'sugerido',
              iniciado_por:  'plataforma',
            },
            { onConflict: 'estudiante_id,exalumno_id' }
          )

        if (errUpsert) {
          errores.push(`Error persistiendo ${est.id} ↔ ${pos.id}: ${errUpsert.message}`)
        } else {
          procesados++
        }
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : String(err)
        errores.push(`Error en par estudiante:${est.id} ↔ posición:${pos.id}: ${mensaje}`)
      }
    }
  }

  revalidatePath('/dashboard/admin')
  return { procesados, errores }
}
