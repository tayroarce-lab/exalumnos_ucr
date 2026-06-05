'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PerfilEstudianteInput = {
  carnet_ucr?: string
  carrera?: string
  escuela_facultad?: string
  sede?: string
  anio_ingreso?: number
  nivel_academico?: 'bachillerato' | 'licenciatura' | 'maestria' | 'doctorado'
  promedio_ponderado?: number
  beca_socioeconomica?: 'ninguna' | 'nivel1' | 'nivel2' | 'nivel3' | 'nivel4' | 'nivel5'
  proyecto_titulo?: string
  proyecto_descripcion?: string
  proyecto_area_tematica?: string
  proyecto_tipo?: 'tfg' | 'tesis' | 'practica_dirigida' | 'seminario'
  proyecto_porcentaje_avance?: number
  proyecto_necesidades?: string[]
  areas_de_interes?: string[]
  habilidades?: string[]
  busca_financiamiento?: boolean
  busca_mentoria?: boolean
  busca_empleo?: boolean
  busca_pasantia?: boolean
  proyecto_activo?: boolean
  visible_en_directorio?: boolean
}

export async function actualizarPerfilEstudiante(datos: PerfilEstudianteInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Validaciones
  if (datos.carnet_ucr && !/^[A-Z0-9]+$/.test(datos.carnet_ucr)) {
    throw new Error('Formato de carné inválido')
  }

  const { error } = await supabase
    .from('estudiantes')
    .upsert({ user_id: user.id, ...datos })

  if (error) throw new Error(error.message)

  // Verificar si el perfil está completo
  await verificarPerfilCompleto(user.id)

  revalidatePath('/mi-perfil')
  return { success: true }
}

export async function obtenerMiPerfilEstudiante() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('estudiantes')
    .select('*, users(nombre, email, foto_url)')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function verificarPerfilCompleto(userId: string) {
  const supabase = await createClient()
  const { data: estudiante, error } = await supabase
    .from('estudiantes')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !estudiante) return false

  const camposRequeridos = [
    'carnet_ucr', 'carrera', 'escuela_facultad', 'sede', 
    'anio_ingreso', 'nivel_academico', 'beca_socioeconomica',
    'proyecto_titulo', 'proyecto_descripcion', 'proyecto_area_tematica',
    'proyecto_tipo', 'proyecto_porcentaje_avance', 'proyecto_necesidades',
    'areas_de_interes'
  ]

  const estaCompleto = camposRequeridos.every(campo => {
    const val = estudiante[campo as keyof typeof estudiante]
    if (Array.isArray(val)) return val.length > 0
    return val !== null && val !== undefined && val !== ''
  })

  if (estaCompleto !== estudiante.perfil_completo) {
    await supabase.from('estudiantes').update({ perfil_completo: estaCompleto }).eq('user_id', userId)
  }

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
  let query = supabase.from('estudiantes')
    .select('*, users!inner(nombre, foto_url, activo)', { count: 'exact' })
    .eq('visible_en_directorio', true)
    .eq('perfil_completo', true)
    .eq('proyecto_activo', true)
    .eq('users.activo', true)
    .order('proyecto_porcentaje_avance', { ascending: false })

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
    query = query.ilike('users.nombre', `%${opciones.busqueda}%`)
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
    .from('estudiantes')
    .select('*, users(nombre, foto_url, activo)')
    .eq('user_id', id)
    .single()

  if (error) throw new Error(error.message)

  // RLS ya protege la beca para usuarios no autorizados, pero nos aseguramos
  const perfilSeguro = { ...data }
  
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id !== id) {
    // Si no es el propio usuario, verificamos si hay match activo o si es admin
    let puedeVerSensible = false
    const { data: adminCheck } = await supabase.from('users').select('tipo').eq('id', user?.id || '').single()
    if (adminCheck?.tipo === 'admin') puedeVerSensible = true

    if (!puedeVerSensible && user) {
      const { data: match } = await supabase.from('matches')
        .select('id')
        .eq('estudiante_id', id)
        .eq('exalumno_id', user.id)
        .eq('estado', 'activo')
        .single()
      if (match) puedeVerSensible = true
    }

    if (!puedeVerSensible) {
      delete perfilSeguro.beca_socioeconomica
      delete perfilSeguro.promedio_ponderado
    }
  }

  return perfilSeguro
}

export async function pausarPerfilEstudiante(pausar: boolean = true) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('estudiantes')
    .update({ visible_en_directorio: !pausar })
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/mi-perfil')
  return { success: true }
}
