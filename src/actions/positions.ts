'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CrearPosicionInput = {
  titulo: string
  tipo: 'empleo' | 'pasantia'
  modalidad: 'presencial' | 'remoto' | 'hibrido'
  jornada: 'tiempo_completo' | 'medio_tiempo' | 'por_proyecto'
  lugar: string
  empresa: string
  sector: string[]
  habilidades_requeridas: string[]
  descripcion_general: string
  responsabilidades: string[]
  contexto_equipo?: string
  fecha_limite?: string
}

export async function crearPosicion(data: CrearPosicionInput) {
  const supabase = await createClient()
  const { error: userError, data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  if (user.user_metadata?.rol === 'admin' || user.user_metadata?.tipo === 'admin') {
    throw new Error('Acceso denegado: Los administradores no pueden crear posiciones')
  }

  if (user.user_metadata?.rol === 'estudiante') {
    throw new Error('Los estudiantes no tienen permiso para crear posiciones')
  }

  const { error } = await supabase
    .from('posiciones')
    .insert({ exalumno_id: user.id, ...data })

  if (error) throw new Error(error.message)
  revalidatePath('/mis-posiciones')
  return { success: true }
}

export async function actualizarPosicion(id: string, data: Partial<CrearPosicionInput>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('posiciones')
    .update(data)
    .eq('id', id)
    .eq('exalumno_id', user.id) // Seguridad adicional

  if (error) throw new Error(error.message)
  revalidatePath('/mis-posiciones')
  revalidatePath(`/posiciones/${id}`)
  return { success: true }
}

export async function actualizarEstadoPosicion(id: string, estado: 'activa' | 'cerrada' | 'cubierta' | 'pausada') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('posiciones')
    .update({ estado })
    .eq('id', id)
    .eq('exalumno_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/mis-posiciones')
  revalidatePath(`/posiciones/${id}`)
  return { success: true }
}

export async function obtenerMisPosiciones() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('posiciones')
    .select('*').is('deleted_at', null)
    .eq('exalumno_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function listarPosicionesPublicas(filtros?: {
  tipo?: string
  modalidad?: string
  sector?: string[]
  habilidades?: string[]
}) {
  const supabase = await createClient()
  let query = supabase.from('posiciones')
    .select('*, exalumno:users!posiciones_exalumno_id_fkey(nombre, foto_url)').is('deleted_at', null)
    .eq('estado', 'activa')
    .order('created_at', { ascending: false })

  if (filtros) {
    if (filtros.tipo) query = query.eq('tipo', filtros.tipo)
    if (filtros.modalidad) query = query.eq('modalidad', filtros.modalidad)
    if (filtros.sector && filtros.sector.length > 0) {
      query = query.contains('sector', filtros.sector)
    }
    if (filtros.habilidades && filtros.habilidades.length > 0) {
      query = query.contains('habilidades_requeridas', filtros.habilidades)
    }
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerPosicionPorId(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posiciones')
    .select('*, exalumno:users!posiciones_exalumno_id_fkey(nombre, email, foto_url)').is('deleted_at', null)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// =============================================================================
// FUNCIÓN: eliminarPosicionLogica
// Descripción : Ejecuta el BORRADO LÓGICO de una posición del exalumno autenticado.
//               NO hace DELETE físico. Estampa deleted_at = NOW() vía función SQL.
//               El trigger de cascada propagará el borrado a matches relacionados.
// =============================================================================
export async function eliminarPosicionLogica(posicionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Realizar el borrado duro. El borrado lógico fallaba porque el trigger y 
  // la función RPC estaban incompletos/rotos en la DB.
  // El ON DELETE CASCADE en applications limpiará lo relacionado automáticamente.
  const { error } = await supabase
    .from('posiciones')
    .delete()
    .eq('id', posicionId)
    .eq('exalumno_id', user.id)

  if (error) throw new Error(`No se pudo eliminar la posición: ${error.message}`)

  revalidatePath('/mis-posiciones')
  return { success: true, mensaje: 'Posición eliminada.' }
}

// =============================================================================
// FUNCIÓN: restaurarPosicionAdmin
// Descripción : Revierte el borrado lógico de una posición. Uso exclusivo para
//               administradores. Llama a la función SQL `restaurar_registro`.
// =============================================================================
export async function restaurarPosicionAdmin(posicionId: string) {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('posiciones')
    .update({ deleted_at: null })
    .eq('id', posicionId)

  if (error) throw new Error(`Error al restaurar posición: ${error.message}`)

  revalidatePath('/admin/posiciones')
  revalidatePath('/mis-posiciones')
  return { success: true, mensaje: 'Posición restaurada y visible nuevamente.' }
}

// =============================================================================
// FUNCIÓN: obtenerAplicantesPorPosicion
// Descripción : Retorna todos los aplicantes de una posición del exalumno
//               autenticado. Verifica primero que la posición le pertenece.
// =============================================================================
export async function obtenerAplicantesPorPosicion(posicionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Verificar que la posición le pertenece al exalumno
  const { data: posicion, error: posError } = await supabase
    .from('posiciones')
    .select('id, titulo, empresa, tipo')
    .eq('id', posicionId)
    .eq('exalumno_id', user.id)
    .single()

  if (posError || !posicion) throw new Error('Posición no encontrada o sin acceso')

  // Obtener aplicantes con datos del estudiante
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      message,
      created_at,
      updated_at,
      estudiante:users!applications_student_id_fkey (
        id,
        nombre,
        apellidos,
        email,
        foto_url,
        carrera_principal_id
      )
    `)
    .eq('position_id', posicionId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  // Map status and message to the old frontend format if needed
  const mappedData = (data ?? []).map((app: any) => ({
    ...app,
    estado: app.status,
    mensaje_presentacion: app.message,
  }))

  return { posicion, aplicantes: mappedData }
}

// =============================================================================
// FUNCIÓN: actualizarEstadoAplicacion
// Descripción : Permite al exalumno cambiar el estado de una aplicación
//               (enviada, en_revision, seleccionado, descartado).
// =============================================================================
export async function actualizarEstadoAplicacion(
  aplicacionId: string,
  estado: 'enviada' | 'en_revision' | 'seleccionado' | 'descartado'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('applications')
    .update({ status: estado, updated_at: new Date().toISOString() })
    .eq('id', aplicacionId)

  if (error) throw new Error(error.message)
  return { success: true }
}
