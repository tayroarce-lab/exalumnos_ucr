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

  const { areas_de_interes, busca_mentoria, busca_empleo, busca_pasantia, visible_en_directorio, ...restDatos } = datos

  // Actualizar users
  const { error: usersError } = await supabase
    .from('users')
    .update({ 
      busca_mentoria, 
      busca_empleo, 
      busca_pasantia, 
      visible_en_directorio 
    })
    .eq('id', user.id)
    .eq('rol', 'estudiante')

  if (usersError) throw new Error(usersError.message)

  // Actualizar estudiantes
  const { error: estError } = await supabase
    .from('estudiantes')
    .update({ ...restDatos, areas_de_interes })
    .eq('user_id', user.id)

  if (estError) throw new Error(estError.message)

  revalidatePath('/mi-perfil')
  return { success: true }
}

export async function obtenerMiPerfilEstudiante() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      estudiantes (*)
    `)
    .eq('id', user.id)
    .eq('rol', 'estudiante')
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  
  if (data) {
    const est = Array.isArray(data.estudiantes) ? data.estudiantes[0] : data.estudiantes;
    return { 
      ...data, 
      ...est, // merge estudiantes fields
      areas_de_interes: est?.areas_de_interes || []
    }
  }
  return data
}

export async function verificarPerfilCompleto(userId: string) {
  const supabase = await createClient()
  const { data: userRecord, error } = await supabase
    .from('users')
    .select('*, estudiantes(*)')
    .eq('id', userId)
    .eq('rol', 'estudiante')
    .single()

  if (error || !userRecord) return false

  const est = Array.isArray(userRecord.estudiantes) ? userRecord.estudiantes[0] : userRecord.estudiantes;
  if (!est) return false;

  const camposRequeridos = [
    'carrera', 'escuela_facultad', 'sede',
    'proyecto_titulo', 'proyecto_descripcion', 'proyecto_area_tematica',
    'proyecto_tipo', 'areas_de_interes'
  ]

  const estaCompleto = camposRequeridos.every(campo => {
    const val = (est as any)[campo]
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
  
  const hasCarreraFilter = filtros?.carrera && filtros.carrera.length > 0
  const hasSedeFilter = filtros?.sede
  const hasAreasFilter = filtros?.areas_de_interes && filtros.areas_de_interes.length > 0
  const hasProyectoAreaFilter = filtros?.proyecto_area_tematica && filtros.proyecto_area_tematica.length > 0
  const hasProyectoTipoFilter = filtros?.proyecto_tipo
  
  const estJoin = (hasCarreraFilter || hasSedeFilter || hasAreasFilter || hasProyectoAreaFilter || hasProyectoTipoFilter) ? 'estudiantes!inner' : 'estudiantes'

  let query = supabase
    .from('users')
    .select(`
      *,
      ${estJoin} (*),
      curriculums (
        sobre_mi,
        url_linkedin,
        url_portfolio,
        habilidades_tecnicas,
        habilidades_blandas,
        proyecto_graduacion_resumen
      )
    `, { count: 'exact' })
    .eq('rol', 'estudiante')
    .eq('activo', true)
    .eq('visible_en_directorio', true)
    .order('nombre', { ascending: true })

  if (filtros) {
    if (filtros.areas_de_interes && filtros.areas_de_interes.length > 0) {
      query = query.contains('estudiantes.areas_de_interes', filtros.areas_de_interes)
    }
    if (filtros.carrera && filtros.carrera.length > 0) {
      query = query.in('estudiantes.carrera', filtros.carrera)
    }
    if (filtros.sede) {
      query = query.eq('estudiantes.sede', filtros.sede)
    }
    if (filtros.proyecto_area_tematica && filtros.proyecto_area_tematica.length > 0) {
      query = query.in('estudiantes.proyecto_area_tematica', filtros.proyecto_area_tematica)
    }
    if (filtros.proyecto_tipo) {
      query = query.eq('estudiantes.proyecto_tipo', filtros.proyecto_tipo)
    }
    if (filtros.tipos_apoyo && filtros.tipos_apoyo.length > 0) {
      filtros.tipos_apoyo.forEach(tipo => {
        if (tipo === 'financiamiento') query = query.eq('estudiantes.busca_financiamiento', true)
        if (tipo === 'mentoría') query = query.eq('busca_mentoria', true)
        if (tipo === 'empleo') query = query.eq('busca_empleo', true)
        if (tipo === 'pasantía') query = query.eq('busca_pasantia', true)
      })
    }
  }

  if (opciones?.busqueda) {
    query = query.or(`nombre.ilike.%${opciones.busqueda}%,apellidos.ilike.%${opciones.busqueda}%,estudiantes.proyecto_titulo.ilike.%${opciones.busqueda}%`)
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
  
  const mappedData = data?.map(d => {
    const est = Array.isArray(d.estudiantes) ? d.estudiantes[0] : d.estudiantes;
    return {
      ...d,
      estudiantes: est,
      areas_de_interes: est?.areas_de_interes || []
    }
  })

  return { data: mappedData, count: count || 0 }
}

export async function obtenerEstudiantePorId(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      estudiantes (*),
      curriculums (
        sobre_mi,
        url_linkedin,
        url_portfolio,
        habilidades_tecnicas,
        habilidades_blandas,
        proyecto_graduacion_resumen
      )
    `)
    .eq('id', id)
    .eq('rol', 'estudiante')
    .single()

  if (error) throw new Error(error.message)

  if (data) {
    const est = Array.isArray(data.estudiantes) ? data.estudiantes[0] : data.estudiantes;
    return { 
      ...data, 
      estudiantes: est,
      areas_de_interes: est?.areas_de_interes || [] 
    }
  }

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
