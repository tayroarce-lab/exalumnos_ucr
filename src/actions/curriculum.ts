'use server'

/**
 * actions/curriculum.ts
 *
 * Server Actions para operaciones CRUD del Curriculum Vitae.
 *
 * Reglas de negocio críticas aplicadas en esta capa:
 *   1. bullets por experiencia: máximo 5 viñetas, máximo 120 caracteres cada una.
 *   2. versiones de CV por cuenta: máximo 10. Al alcanzar el tope, se bloquea la inserción.
 *
 * Toda operación verifica la autenticación y la propiedad del recurso
 * antes de mutar la base de datos.
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ─── Constantes de Negocio ───────────────────────────────────────────────────

/** Máximo de viñetas (bullets) permitidas por entrada de experiencia. */
const MAX_BULLETS_POR_EXPERIENCIA = 5

/** Máximo de caracteres permitidos por viñeta (bullet). */
const MAX_CARACTERES_POR_BULLET = 120

/** Máximo de versiones de CV que un estudiante puede guardar en total. */
const MAX_VERSIONES_POR_CURRICULUM = 10

// ─── Schemas de Validación (Zod) ─────────────────────────────────────────────

const ExperienciaSchema = z.object({
  curriculum_id: z.string().uuid({ message: 'curriculum_id debe ser un UUID válido.' }),
  tipo: z.enum(
    ['empleo', 'voluntariado', 'proyecto_universitario', 'asistencia', 'investigacion'],
    { errorMap: () => ({ message: 'Tipo de experiencia no válido.' }) }
  ),
  titulo: z
    .string()
    .min(1, { message: 'El título de la experiencia es requerido.' })
    .max(200, { message: 'El título no puede superar los 200 caracteres.' }),
  organizacion: z
    .string()
    .min(1, { message: 'El nombre de la organización es requerido.' })
    .max(200, { message: 'La organización no puede superar los 200 caracteres.' }),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha_inicio debe tener formato YYYY-MM-DD.',
  }),
  fecha_fin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'fecha_fin debe tener formato YYYY-MM-DD.',
    })
    .nullable()
    .optional(),
  bullets: z.array(z.string()),
  orden: z.number().int().nonnegative().optional().default(0),
})

export type ExperienciaInput = z.infer<typeof ExperienciaSchema>
export type ExperienciaPartialInput = Partial<ExperienciaInput>

const CertificacionSchema = z.object({
  curriculum_id: z.string().uuid({ message: 'curriculum_id debe ser un UUID válido.' }),
  nombre: z
    .string()
    .min(1, { message: 'El nombre de la certificación es requerido.' })
    .max(200),
  institucion: z
    .string()
    .min(1, { message: 'El nombre de la institución es requerido.' })
    .max(200),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe tener formato YYYY-MM-DD.' })
    .nullable()
    .optional(),
  url_verificacion: z
    .string()
    .url({ message: 'url_verificacion debe ser una URL válida.' })
    .nullable()
    .optional(),
  orden: z.number().int().nonnegative().optional().default(0),
})

export type CertificacionInput = z.infer<typeof CertificacionSchema>

const VersionCurriculumSchema = z.object({
  curriculum_id: z.string().uuid({ message: 'curriculum_id debe ser un UUID válido.' }),
  posicion_id: z.string().uuid({ message: 'posicion_id debe ser un UUID válido.' }),
  nombre_version: z
    .string()
    .min(1, { message: 'El nombre de la versión es requerido.' })
    .max(150, { message: 'El nombre de la versión no puede superar 150 caracteres.' }),
  contenido_adaptado: z.record(z.unknown()),
  sugerencias_ia: z.array(z.unknown()).optional().default([]),
})

export type VersionCurriculumInput = z.infer<typeof VersionCurriculumSchema>

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface CurriculumBase {
  id: string
  user_id: string
  cursos_relevantes: string[]
  proyecto_graduacion_resumen: string | null
  habilidades_tecnicas: Record<string, unknown>
  habilidades_blandas: string[]
  idiomas: unknown[]
  created_at: string
  updated_at: string
}

export interface VersionCurriculumRow {
  id: string
  posicion_id: string
  nombre_version: string
  contenido_adaptado: Record<string, unknown>
  sugerencias_ia: unknown[]
  created_at: string
}

// ─── Validador de Reglas de Negocio ──────────────────────────────────────────

/**
 * Valida las reglas de negocio sobre el array de bullets de una experiencia.
 *
 * Regla 1: No se permiten más de MAX_BULLETS_POR_EXPERIENCIA elementos.
 * Regla 2: Ningún bullet puede superar MAX_CARACTERES_POR_BULLET caracteres.
 *
 * @throws Error con mensaje descriptivo si alguna validación falla.
 */
function validarBullets(bullets: string[]): void {
  if (bullets.length > MAX_BULLETS_POR_EXPERIENCIA) {
    throw new Error(
      `Límite de viñetas excedido: se permiten máximo ${MAX_BULLETS_POR_EXPERIENCIA} ` +
        `viñetas por experiencia, pero se proporcionaron ${bullets.length}.`
    )
  }

  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i]
    if (bullet.length > MAX_CARACTERES_POR_BULLET) {
      throw new Error(
        `La viñeta #${i + 1} supera el límite de ${MAX_CARACTERES_POR_BULLET} caracteres. ` +
          `Tiene ${bullet.length} caracteres: "${bullet.slice(0, 50)}${bullet.length > 50 ? '...' : ''}"`
      )
    }
  }
}

// ─── Helpers de autenticación ─────────────────────────────────────────────────

/**
 * Obtiene el usuario autenticado de la sesión actual.
 * Lanza un error controlado si la sesión es inválida.
 */
async function obtenerUsuarioAutenticado() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Sesión no válida. Inicia sesión para continuar.')
  }

  return { supabase, user }
}

// ─── Curriculum Base ──────────────────────────────────────────────────────────

/**
 * Obtiene el curriculum del estudiante autenticado.
 * Si no existe, lo crea con valores vacíos.
 * Un estudiante tiene exactamente un registro de curriculum (UNIQUE).
 *
 * @returns El curriculum del estudiante (nuevo o existente).
 */
export async function obtenerOCrearCurriculum(): Promise<CurriculumBase> {
  const { supabase, user } = await obtenerUsuarioAutenticado()

  const { data: existente, error: errSelect } = await supabase
    .from('curriculums')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (errSelect) {
    throw new Error(`Error al buscar curriculum: ${errSelect.message}`)
  }

  if (existente) {
    return {
      ...existente,
      habilidades_tecnicas:
        (existente.habilidades_tecnicas as Record<string, unknown>) ?? {},
      idiomas: (existente.idiomas as unknown[]) ?? [],
    }
  }

  // Crear nuevo curriculum con valores vacíos
  const { data: nuevo, error: errInsert } = await supabase
    .from('curriculums')
    .insert({
      user_id: user.id,
      cursos_relevantes: [],
      proyecto_graduacion_resumen: null,
      habilidades_tecnicas: {},
      habilidades_blandas: [],
      idiomas: [],
    })
    .select('*')
    .single()

  if (errInsert || !nuevo) {
    throw new Error(
      `Error al crear curriculum: ${errInsert?.message ?? 'La base de datos no retornó datos.'}`
    )
  }

  revalidatePath('/dashboard/estudiante/curriculum')

  return {
    ...nuevo,
    habilidades_tecnicas: (nuevo.habilidades_tecnicas as Record<string, unknown>) ?? {},
    idiomas: (nuevo.idiomas as unknown[]) ?? [],
  }
}

/**
 * Actualiza los campos principales del curriculum del estudiante autenticado.
 *
 * @param datos - Campos a actualizar (parcial, solo los provistos se modifican).
 */
export async function actualizarCurriculumPrincipal(datos: {
  cursos_relevantes?: string[]
  proyecto_graduacion_resumen?: string | null
  habilidades_tecnicas?: Record<string, unknown>
  habilidades_blandas?: string[]
  idiomas?: unknown[]
}): Promise<void> {
  const { supabase, user } = await obtenerUsuarioAutenticado()

  const { error } = await supabase
    .from('curriculums')
    .update({
      ...datos,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Error al actualizar curriculum: ${error.message}`)
  }

  revalidatePath('/dashboard/estudiante/curriculum')
}

// ─── Experiencia ──────────────────────────────────────────────────────────────

/**
 * Inserta una nueva entrada de experiencia en el curriculum.
 * Valida las reglas de negocio sobre bullets antes de persistir.
 *
 * @param input - Datos completos de la experiencia a insertar.
 * @returns El ID de la experiencia creada.
 */
export async function insertarExperiencia(
  input: ExperienciaInput
): Promise<{ id: string }> {
  // Validación de schema
  const parsed = ExperienciaSchema.safeParse(input)
  if (!parsed.success) {
    const mensajes = parsed.error.errors.map((e) => e.message).join('; ')
    throw new Error(`Datos de experiencia inválidos: ${mensajes}`)
  }

  const datos = parsed.data

  // ── Validación de reglas de negocio sobre bullets ─────────────────────
  validarBullets(datos.bullets)

  const { supabase } = await obtenerUsuarioAutenticado()

  const { data, error } = await supabase
    .from('curriculum_experiencia')
    .insert({
      curriculum_id: datos.curriculum_id,
      tipo: datos.tipo,
      titulo: datos.titulo,
      organizacion: datos.organizacion,
      fecha_inicio: datos.fecha_inicio,
      fecha_fin: datos.fecha_fin ?? null,
      bullets: datos.bullets,
      orden: datos.orden ?? 0,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(
      `Error al insertar experiencia: ${error?.message ?? 'Sin respuesta de la base de datos.'}`
    )
  }

  revalidatePath('/dashboard/estudiante/curriculum')
  return { id: data.id }
}

/**
 * Actualiza una entrada de experiencia existente.
 * Verifica que la experiencia pertenezca al curriculum del usuario autenticado.
 * Si se proporcionan bullets nuevos, se aplican las reglas de negocio.
 *
 * @param experienciaId - UUID de la experiencia a actualizar.
 * @param input         - Campos a actualizar (solo los provistos se modifican).
 */
export async function actualizarExperiencia(
  experienciaId: string,
  input: ExperienciaPartialInput
): Promise<void> {
  if (!experienciaId) {
    throw new Error('El ID de la experiencia es requerido para actualizar.')
  }

  // Si se proporcionan bullets, aplicar validación de negocio
  if (input.bullets !== undefined) {
    validarBullets(input.bullets)
  }

  const { supabase, user } = await obtenerUsuarioAutenticado()

  // Verificar propiedad: la experiencia debe pertenecer al curriculum del usuario
  const { data: expExistente, error: errCheck } = await supabase
    .from('curriculum_experiencia')
    .select('id, curriculum:curriculum_id(user_id)')
    .eq('id', experienciaId)
    .single()

  if (errCheck || !expExistente) {
    throw new Error(
      'Experiencia no encontrada o no tienes permisos para modificarla.'
    )
  }

  const currRelacion = expExistente.curriculum as
    | { user_id: string }
    | { user_id: string }[]
    | null
  const estudianteId = Array.isArray(currRelacion)
    ? currRelacion[0]?.user_id
    : currRelacion?.user_id

  if (estudianteId !== user.id) {
    throw new Error('No tienes permisos para modificar esta experiencia.')
  }

  // Construir el objeto de actualización con solo los campos provistos
  const updatePayload: Record<string, unknown> = {}
  if (input.tipo !== undefined) updatePayload.tipo = input.tipo
  if (input.titulo !== undefined) updatePayload.titulo = input.titulo
  if (input.organizacion !== undefined) updatePayload.organizacion = input.organizacion
  if (input.fecha_inicio !== undefined) updatePayload.fecha_inicio = input.fecha_inicio
  if ('fecha_fin' in input) updatePayload.fecha_fin = input.fecha_fin ?? null
  if (input.bullets !== undefined) updatePayload.bullets = input.bullets
  if (input.orden !== undefined) updatePayload.orden = input.orden

  const { error } = await supabase
    .from('curriculum_experiencia')
    .update(updatePayload)
    .eq('id', experienciaId)

  if (error) {
    throw new Error(`Error al actualizar experiencia: ${error.message}`)
  }

  revalidatePath('/dashboard/estudiante/curriculum')
}

/**
 * Elimina una entrada de experiencia del curriculum.
 * Verifica que la experiencia pertenezca al curriculum del usuario autenticado.
 *
 * @param experienciaId - UUID de la experiencia a eliminar.
 */
export async function eliminarExperiencia(experienciaId: string): Promise<void> {
  if (!experienciaId) {
    throw new Error('El ID de la experiencia es requerido para eliminar.')
  }

  const { supabase, user } = await obtenerUsuarioAutenticado()

  const { data: expExistente, error: errCheck } = await supabase
    .from('curriculum_experiencia')
    .select('id, curriculum:curriculum_id(user_id)')
    .eq('id', experienciaId)
    .single()

  if (errCheck || !expExistente) {
    throw new Error(
      'Experiencia no encontrada o no tienes permisos para eliminarla.'
    )
  }

  const currRelacion = expExistente.curriculum as
    | { user_id: string }
    | { user_id: string }[]
    | null
  const estudianteId = Array.isArray(currRelacion)
    ? currRelacion[0]?.user_id
    : currRelacion?.user_id

  if (estudianteId !== user.id) {
    throw new Error('No tienes permisos para eliminar esta experiencia.')
  }

  const { error } = await supabase
    .from('curriculum_experiencia')
    .delete()
    .eq('id', experienciaId)

  if (error) {
    throw new Error(`Error al eliminar experiencia: ${error.message}`)
  }

  revalidatePath('/dashboard/estudiante/curriculum')
}

// ─── Certificaciones ──────────────────────────────────────────────────────────

/**
 * Inserta una nueva certificación en el curriculum del estudiante autenticado.
 *
 * @param input - Datos completos de la certificación a insertar.
 * @returns El ID de la certificación creada.
 */
export async function insertarCertificacion(
  input: CertificacionInput
): Promise<{ id: string }> {
  const parsed = CertificacionSchema.safeParse(input)
  if (!parsed.success) {
    const mensajes = parsed.error.errors.map((e) => e.message).join('; ')
    throw new Error(`Datos de certificación inválidos: ${mensajes}`)
  }

  const datos = parsed.data
  const { supabase } = await obtenerUsuarioAutenticado()

  const { data, error } = await supabase
    .from('curriculum_certificaciones')
    .insert({
      curriculum_id: datos.curriculum_id,
      nombre: datos.nombre,
      institucion: datos.institucion,
      fecha: datos.fecha ?? null,
      url_verificacion: datos.url_verificacion ?? null,
      orden: datos.orden ?? 0,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(
      `Error al insertar certificación: ${error?.message ?? 'Sin respuesta de la base de datos.'}`
    )
  }

  revalidatePath('/dashboard/estudiante/curriculum')
  return { id: data.id }
}

/**
 * Elimina una certificación del curriculum.
 * Verifica que la certificación pertenezca al curriculum del usuario autenticado.
 *
 * @param certificacionId - UUID de la certificación a eliminar.
 */
export async function eliminarCertificacion(certificacionId: string): Promise<void> {
  if (!certificacionId) {
    throw new Error('El ID de la certificación es requerido para eliminar.')
  }

  const { supabase, user } = await obtenerUsuarioAutenticado()

  const { data: certExistente, error: errCheck } = await supabase
    .from('curriculum_certificaciones')
    .select('id, curriculum:curriculum_id(user_id)')
    .eq('id', certificacionId)
    .single()

  if (errCheck || !certExistente) {
    throw new Error(
      'Certificación no encontrada o no tienes permisos para eliminarla.'
    )
  }

  const currRelacion = certExistente.curriculum as
    | { user_id: string }
    | { user_id: string }[]
    | null
  const estudianteId = Array.isArray(currRelacion)
    ? currRelacion[0]?.user_id
    : currRelacion?.user_id

  if (estudianteId !== user.id) {
    throw new Error('No tienes permisos para eliminar esta certificación.')
  }

  const { error } = await supabase
    .from('curriculum_certificaciones')
    .delete()
    .eq('id', certificacionId)

  if (error) {
    throw new Error(`Error al eliminar certificación: ${error.message}`)
  }

  revalidatePath('/dashboard/estudiante/curriculum')
}

// ─── Versiones de Curriculum ──────────────────────────────────────────────────

/**
 * Guarda una nueva versión adaptada del CV para una posición específica.
 *
 * ── REGLA DE NEGOCIO CRÍTICA ──────────────────────────────────────────────
 * Un estudiante puede tener un máximo de MAX_VERSIONES_POR_CURRICULUM (10)
 * versiones de CV guardadas en total para su curriculum.
 * Si ya llegó al tope, se bloquea la inserción y se lanza un error controlado.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * @param input - Datos de la versión adaptada a guardar.
 * @returns El ID de la versión creada.
 */
export async function guardarVersionCurriculum(
  input: VersionCurriculumInput
): Promise<{ id: string }> {
  // Validación de schema
  const parsed = VersionCurriculumSchema.safeParse(input)
  if (!parsed.success) {
    const mensajes = parsed.error.errors.map((e) => e.message).join('; ')
    throw new Error(`Datos de versión de CV inválidos: ${mensajes}`)
  }

  const datos = parsed.data
  const { supabase, user } = await obtenerUsuarioAutenticado()

  // Verificar que el curriculum_id le pertenece al usuario autenticado
  const { data: curriculum, error: errCurr } = await supabase
    .from('curriculums')
    .select('id, user_id')
    .eq('id', datos.curriculum_id)
    .eq('user_id', user.id)
    .single()

  if (errCurr || !curriculum) {
    throw new Error(
      'El curriculum especificado no existe o no pertenece a tu cuenta.'
    )
  }

  // ── Verificar el límite de versiones ANTES de insertar ────────────────
  const { count, error: errCount } = await supabase
    .from('curriculum_versiones')
    .select('id', { count: 'exact', head: true })
    .eq('curriculum_id', datos.curriculum_id)

  if (errCount) {
    throw new Error(
      `Error al verificar el número de versiones guardadas: ${errCount.message}`
    )
  }

  const totalVersionesActuales = count ?? 0

  if (totalVersionesActuales >= MAX_VERSIONES_POR_CURRICULUM) {
    throw new Error(
      `Has alcanzado el límite máximo de ${MAX_VERSIONES_POR_CURRICULUM} versiones de CV. ` +
        `Elimina al menos una versión existente antes de guardar una nueva.`
    )
  }

  // Insertar la nueva versión
  const { data: nuevaVersion, error: errInsert } = await supabase
    .from('curriculum_versiones')
    .insert({
      curriculum_id: datos.curriculum_id,
      posicion_id: datos.posicion_id,
      nombre_version: datos.nombre_version,
      contenido_adaptado: datos.contenido_adaptado,
      sugerencias_ia: datos.sugerencias_ia ?? [],
    })
    .select('id')
    .single()

  if (errInsert || !nuevaVersion) {
    // Violación del constraint UNIQUE(curriculum_id, posicion_id)
    if (errInsert?.code === '23505') {
      throw new Error(
        'Ya existe una versión de CV guardada para esta posición. ' +
          'Elimina la versión existente o selecciona otra posición antes de guardar.'
      )
    }
    throw new Error(
      `Error al guardar versión de CV: ${errInsert?.message ?? 'Sin respuesta de la base de datos.'}`
    )
  }

  revalidatePath('/dashboard/estudiante/curriculum')
  revalidatePath('/dashboard/estudiante/empleabilidad')
  return { id: nuevaVersion.id }
}

/**
 * Lista todas las versiones de CV del curriculum indicado,
 * ordenadas de más reciente a más antigua.
 * Verifica que el curriculum pertenezca al usuario autenticado.
 *
 * @param curriculumId - UUID del curriculum del estudiante.
 * @returns Array de versiones de CV.
 */
export async function listarVersionesCurriculum(
  curriculumId: string
): Promise<VersionCurriculumRow[]> {
  if (!curriculumId) {
    throw new Error('El ID del curriculum es requerido.')
  }

  const { supabase, user } = await obtenerUsuarioAutenticado()

  // Verificar propiedad del curriculum
  const { data: curriculum, error: errCurr } = await supabase
    .from('curriculums')
    .select('id')
    .eq('id', curriculumId)
    .eq('user_id', user.id)
    .single()

  if (errCurr || !curriculum) {
    throw new Error(
      'El curriculum especificado no existe o no pertenece a tu cuenta.'
    )
  }

  const { data, error } = await supabase
    .from('curriculum_versiones')
    .select(
      'id, posicion_id, nombre_version, contenido_adaptado, sugerencias_ia, created_at'
    )
    .eq('curriculum_id', curriculumId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error al listar versiones de CV: ${error.message}`)
  }

  return (data ?? []).map((v) => ({
    id: v.id,
    posicion_id: v.posicion_id,
    nombre_version: v.nombre_version,
    contenido_adaptado: (v.contenido_adaptado as Record<string, unknown>) ?? {},
    sugerencias_ia: (v.sugerencias_ia as unknown[]) ?? [],
    created_at: v.created_at,
  }))
}

/**
 * Elimina una versión de CV por su ID.
 * Verifica que la versión pertenezca al curriculum del usuario autenticado.
 *
 * @param versionId - UUID de la versión de CV a eliminar.
 */
export async function eliminarVersionCurriculum(versionId: string): Promise<void> {
  if (!versionId) {
    throw new Error('El ID de la versión de CV es requerido para eliminar.')
  }

  const { supabase, user } = await obtenerUsuarioAutenticado()

  // Verificar propiedad a través del curriculum relacionado
  const { data: version, error: errCheck } = await supabase
    .from('curriculum_versiones')
    .select('id, curriculum:curriculum_id(user_id)')
    .eq('id', versionId)
    .single()

  if (errCheck || !version) {
    throw new Error(
      'Versión de CV no encontrada o no tienes permisos para eliminarla.'
    )
  }

  const currRelacion = version.curriculum as
    | { user_id: string }
    | { user_id: string }[]
    | null
  const estudianteId = Array.isArray(currRelacion)
    ? currRelacion[0]?.user_id
    : currRelacion?.user_id

  if (estudianteId !== user.id) {
    throw new Error('No tienes permisos para eliminar esta versión de CV.')
  }

  const { error } = await supabase
    .from('curriculum_versiones')
    .delete()
    .eq('id', versionId)

  if (error) {
    throw new Error(`Error al eliminar versión de CV: ${error.message}`)
  }

  revalidatePath('/dashboard/estudiante/curriculum')
  revalidatePath('/dashboard/estudiante/empleabilidad')
}
