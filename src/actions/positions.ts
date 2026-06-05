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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

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
