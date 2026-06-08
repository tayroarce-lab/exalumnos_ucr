'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PerfilEstudianteInput = {
  carrera?: string
  escuela_facultad?: string
  sede?: string
  proyecto_titulo?: string
  proyecto_descripcion?: string
  proyecto_area_tematica?: string
  proyecto_tipo?: string
  proyecto_porcentaje_avance?: number
  areas_de_interes?: string[]
  busca_financiamiento?: boolean
  busca_mentoria?: boolean
  busca_empleo?: boolean
  busca_pasantia?: boolean
  visible_en_directorio?: boolean
}

export async function actualizarPerfilEstudiante(datos: PerfilEstudianteInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('users')
    .update({ ...datos })
    .eq('id', user.id)
    .eq('rol', 'estudiante')

  if (error) throw new Error(error.message)

  revalidatePath('/mi-perfil')
  return { success: true }
}

export async function obtenerMiPerfilEstudiante() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .eq('rol', 'estudiante')
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function verificarPerfilCompleto(userId: string) {
  const supabase = await createClient()
  const { data: estudiante, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .eq('rol', 'estudiante')
    .single()

  if (error || !estudiante) return false

  const camposRequeridos = [
    'carrera', 'escuela_facultad', 'sede',
    'proyecto_titulo', 'proyecto_descripcion', 'proyecto_area_tematica',
    'proyecto_tipo', 'proyecto_porcentaje_avance', 'areas_de_interes'
  ]

  const estaCompleto = camposRequeridos.every(campo => {
    const val = (estudiante as any)[campo]
    if (Array.isArray(val)) return val.length > 0
    return val !== null && val !== undefined && val !== ''
  })

  return estaCompleto
}

export async function listarEstudiantes(
  filtros?: {
    carrera?: string[]
    proyecto_area_tematica?: string[]
    areas_de_interes?: string[]
    tipos_apoyo?: string[]
    proyecto_tipo?: string
    sede?: string
  },
  opciones?: {
    busqueda?: string
    page?: number
    limit?: number
  }
) {
  const supabase = await createClient()
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('rol', 'estudiante')
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (filtros) {
    if (filtros.carrera && filtros.carrera.length > 0) {
      query = query.in('carrera', filtros.carrera)
    }
    if (filtros.proyecto_area_tematica && filtros.proyecto_area_tematica.length > 0) {
      query = query.in('proyecto_area_tematica', filtros.proyecto_area_tematica)
    }
    if (filtros.areas_de_interes && filtros.areas_de_interes.length > 0) {
      query = query.contains('areas_de_interes', filtros.areas_de_interes)
    }
    if (filtros.proyecto_tipo) {
      query = query.eq('proyecto_tipo', filtros.proyecto_tipo)
    }
    if (filtros.sede) {
      query = query.eq('sede', filtros.sede)
    }
    if (filtros.tipos_apoyo && filtros.tipos_apoyo.length > 0) {
      filtros.tipos_apoyo.forEach(tipo => {
        if (tipo === 'financiamiento') query = query.eq('busca_financiamiento', true)
        if (tipo === 'mentoría') query = query.eq('busca_mentoria', true)
        if (tipo === 'empleo') query = query.eq('busca_empleo', true)
        if (tipo === 'pasantía') query = query.eq('busca_pasantia', true)
      })
    }
  }

  if (opciones?.busqueda) {
    query = query.ilike('nombre', `%${opciones.busqueda}%`)
  }

  if (opciones?.page && opciones?.limit) {
    const from = (opciones.page - 1) * opciones.limit
    const to = from + opciones.limit - 1
    query = query.range(from, to)
  } else if (opciones?.limit) {
    query = query.limit(opciones.limit)
  }

  const { data, count, error } = await query
  if (error) throw new Error(error.message)
  return { data, count: count || 0 }
}

export async function obtenerEstudiantePorId(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('rol', 'estudiante')
    .single()

  if (error) throw new Error(error.message)

  return data
}

export async function pausarPerfilEstudiante(pausar: boolean = true) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('users')
    .update({ visible_en_directorio: !pausar })
    .eq('id', user.id)
    .eq('rol', 'estudiante')

  if (error) throw new Error(error.message)
  revalidatePath('/mi-perfil')
  return { success: true }
}
