'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PerfilExalumnoInput = {
  carrera_ucr?: string
  escuela_facultad?: string
  anio_graduacion?: number
  empresa_actual?: string
  cargo_actual?: string
  sector_industria?: string[]
  areas_de_interes?: string[]
  pais_ciudad?: string
  anos_experiencia?: number
  linkedin_url?: string
  bio?: string
  ofrece_mentoria?: boolean
  horas_mes_mentoria?: number
  ofrece_empleo?: boolean
  ofrece_pasantia?: boolean
  ofrece_proyecto?: boolean
  ofrece_donacion_dinero?: boolean
  monto_maximo_donacion?: number
  moneda_donacion?: 'CRC' | 'USD'
  visible_en_directorio?: boolean
}

export async function actualizarPerfilExalumno(datos: PerfilExalumnoInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { areas_de_interes, ...restDatos } = datos

  const { error } = await supabase
    .from('exalumnos')
    .upsert({ user_id: user.id, ...restDatos })

  if (error) throw new Error(error.message)

  if (areas_de_interes) {
    const { data: areasData } = await supabase
      .from('catalogo_areas_interes')
      .select('id')
      .in('nombre', areas_de_interes)
    
    if (areasData) {
      await supabase.from('users_areas_interes').delete().eq('user_id', user.id)
      const inserts = areasData.map(a => ({ user_id: user.id, area_id: a.id }))
      if (inserts.length > 0) {
        await supabase.from('users_areas_interes').insert(inserts)
      }
    }
  }

  // Verificar si el perfil está completo
  await verificarPerfilCompleto(user.id)

  revalidatePath('/mi-perfil')
  return { success: true }
}

export async function obtenerMiPerfilExalumno() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('exalumnos')
    .select('*, users(nombre, email, foto_url, users_areas_interes(catalogo_areas_interes(nombre)))')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  
  if (data) {
    const areas = (data as any).users?.users_areas_interes?.map((ua: any) => ua.catalogo_areas_interes?.nombre).filter(Boolean) || []
    return { ...data, areas_de_interes: areas }
  }
  return data
}

export async function verificarPerfilCompleto(userId: string) {
  const supabase = await createClient()
  const { data: exalumno, error } = await supabase
    .from('exalumnos')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !exalumno) return false

  const camposRequeridos = [
    'carrera_ucr', 'escuela_facultad', 'anio_graduacion', 
    'empresa_actual', 'cargo_actual', 'sector_industria', 
    'areas_de_interes', 'pais_ciudad', 'anos_experiencia', 
    'linkedin_url', 'bio'
  ]

  const estaCompleto = camposRequeridos.every(campo => {
    const val = exalumno[campo as keyof typeof exalumno]
    if (Array.isArray(val)) return val.length > 0
    return val !== null && val !== undefined && val !== ''
  })

  if (estaCompleto !== exalumno.perfil_completo) {
    await supabase.from('exalumnos').update({ perfil_completo: estaCompleto }).eq('user_id', userId)
  }

  return estaCompleto
}

export async function listarExalumnos(filtros?: {
  carrera_ucr?: string[]
  sector_industria?: string[]
  areas_de_interes?: string[]
  tipos_apoyo?: string[]
  pais_ciudad?: string
}) {
  const supabase = await createClient()
  let query = supabase.from('exalumnos')
    .select('*, users!inner(nombre, foto_url, activo, users_areas_interes(catalogo_areas_interes(nombre)))')
    .eq('visible_en_directorio', true)
    .eq('perfil_completo', true)
    .eq('users.activo', true)

  if (filtros) {
    if (filtros.carrera_ucr && filtros.carrera_ucr.length > 0) {
      query = query.in('carrera_ucr', filtros.carrera_ucr)
    }
    if (filtros.sector_industria && filtros.sector_industria.length > 0) {
      query = query.contains('sector_industria', filtros.sector_industria)
    }
    if (filtros.areas_de_interes && filtros.areas_de_interes.length > 0) {
      // Nota: Si el filtro de frontend lo requiere desde users, esto asume que query lo soporta
      // o deberíamos filtrar post-query o hacer inner join
    }
    if (filtros.pais_ciudad) {
      query = query.ilike('pais_ciudad', `%${filtros.pais_ciudad}%`)
    }
    if (filtros.tipos_apoyo && filtros.tipos_apoyo.length > 0) {
      filtros.tipos_apoyo.forEach(tipo => {
        if (tipo === 'mentoría') query = query.eq('ofrece_mentoria', true)
        if (tipo === 'empleo') query = query.eq('ofrece_empleo', true)
        if (tipo === 'pasantía') query = query.eq('ofrece_pasantia', true)
        if (tipo === 'proyecto') query = query.eq('ofrece_proyecto', true)
        if (tipo === 'donación') query = query.eq('ofrece_donacion_dinero', true)
      })
    }
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const mappedData = data?.map(d => ({
    ...d,
    areas_de_interes: (d as any).users?.users_areas_interes?.map((ua: any) => ua.catalogo_areas_interes?.nombre).filter(Boolean) || []
  }))

  return mappedData
}

export async function obtenerExalumnoPorId(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exalumnos')
    .select('*, users(nombre, foto_url, activo, users_areas_interes(catalogo_areas_interes(nombre)))')
    .eq('user_id', id)
    .single()

  if (error) throw new Error(error.message)
  
  // Ocultar campos privados en perfil público
  const perfilSeguro = { ...data }
  delete perfilSeguro.monto_maximo_donacion
  delete perfilSeguro.moneda_donacion
  
  perfilSeguro.areas_de_interes = (perfilSeguro as any).users?.users_areas_interes?.map((ua: any) => ua.catalogo_areas_interes?.nombre).filter(Boolean) || []

  return perfilSeguro
}
