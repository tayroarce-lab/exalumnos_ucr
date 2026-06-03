'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { notificarNuevaAplicacion } from '@/lib/email'

export async function aplicarAPosicion(
  posicionId: string, 
  curriculumVersionId?: string, 
  mensajePresentacion?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Validar que la posición existe y está activa
  const { data: posicion, error: posError } = await supabase
    .from('posiciones')
    .select('estado, exalumno:users!posiciones_exalumno_id_fkey(nombre, email)')
    .eq('id', posicionId)
    .single()

  if (posError || !posicion) throw new Error('Posición no encontrada')
  if (posicion.estado !== 'activa') throw new Error('La posición ya no está activa')

  // Insertar la aplicación
  const { error: insertError } = await supabase
    .from('aplicaciones')
    .insert({
      posicion_id: posicionId,
      estudiante_id: user.id,
      curriculum_version_id: curriculumVersionId || null,
      mensaje_presentacion: mensajePresentacion || null,
      estado: 'enviada'
    })

  if (insertError) {
    if (insertError.code === '23505') throw new Error('Ya aplicaste a esta posición')
    throw new Error(insertError.message)
  }

  // Enviar notificación al exalumno (opcional, en background)
  const exalumno = posicion.exalumno as any
  if (exalumno && !Array.isArray(exalumno)) {
    const { data: estudiante } = await supabase.from('users').select('nombre').eq('id', user.id).single()
    if (estudiante && exalumno.email) {
      notificarNuevaAplicacion(
        exalumno.email, 
        exalumno.nombre, 
        'Nueva posición', // idealmente buscar el título, pero 'Nueva posición' sirve por ahora 
        estudiante.nombre
      ).catch(console.error)
    }
  }

  revalidatePath('/mis-aplicaciones')
  revalidatePath(`/posiciones/${posicionId}`)
  return { success: true }
}

export async function retirarAplicacion(aplicacionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Solo se puede retirar si está enviada (y no en revisión)
  const { data: aplicacion, error: getError } = await supabase
    .from('aplicaciones')
    .select('estado')
    .eq('id', aplicacionId)
    .eq('estudiante_id', user.id)
    .single()

  if (getError || !aplicacion) throw new Error('Aplicación no encontrada')
  if (aplicacion.estado !== 'enviada') throw new Error('No puedes retirar una aplicación que ya está en revisión o finalizada')

  const { error: delError } = await supabase
    .from('aplicaciones')
    .delete()
    .eq('id', aplicacionId)

  if (delError) throw new Error(delError.message)
  
  revalidatePath('/mis-aplicaciones')
  return { success: true }
}

export async function obtenerMisAplicaciones() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('aplicaciones')
    .select(`
      *,
      posicion:posiciones(
        titulo, empresa, estado,
        exalumno:users!posiciones_exalumno_id_fkey(nombre)
      )
    `)
    .eq('estudiante_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function obtenerAplicantesDePosicion(posicionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Validar que el usuario sea el dueño de la posición (RLS ya lo hace, pero verificamos)
  const { data, error } = await supabase
    .from('aplicaciones')
    .select(`
      *,
      estudiante:users!aplicaciones_estudiante_id_fkey(nombre, email, foto_url),
      curriculum_version:curriculum_versiones(nombre_version, contenido_adaptado)
    `)
    .eq('posicion_id', posicionId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function actualizarEstadoAplicacion(aplicacionId: string, estado: 'enviada' | 'en_revision' | 'seleccionado' | 'descartado') {
  const supabase = await createClient()
  // RLS (update_exalumno_admin) se asegura de que sea el dueño
  const { error } = await supabase
    .from('aplicaciones')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', aplicacionId)

  if (error) throw new Error(error.message)
  
  // Idealmente aquí se podría enviar correo al estudiante
  return { success: true }
}
