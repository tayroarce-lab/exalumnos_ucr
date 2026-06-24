'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/logger'

export type PerfilEstudianteInput = {
  carrera?: string
  escuela_facultad?: string
  sede?: string
  proyecto_titulo?: string
  proyecto_descripcion?: string
  proyecto_area_tematica?: string
  proyecto_tipo?: string
  proyecto_porcentaje_avance?: number
  proyecto_valor_monto?: number | null
  proyecto_valor_moneda?: string | null
  proyecto_video_url?: string | null
  proyecto_documento_url?: string | null
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
  if (!user) {
    logError('students.ts/actualizarPerfilEstudiante', new Error('No autenticado'));
    return { success: false, error: 'No autenticado' };
  }

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

  if (usersError) {
    logError('students.ts/actualizarPerfilEstudiante', usersError, { userId: user.id });
    return { success: false, error: 'Error al actualizar usuario' };
  }

  // Actualizar estudiantes
  const { error: estError } = await supabase
    .from('estudiantes')
    .upsert({ user_id: user.id, ...restDatos, areas_de_interes }, { onConflict: 'user_id' })

  if (estError) {
    logError('students.ts/actualizarPerfilEstudiante', estError, { userId: user.id });
    return { success: false, error: 'Error interno del servidor' };
  }

  revalidatePath('/mi-perfil')
  return { success: true }
}

/**
 * Server Action para completar el onboarding inicial del estudiante.
 * Usa adminClient para bypassear la RLS y poder actualizar la tabla users
 * (perfil_completo, busca_*). Sin esto, el sistema sigue pidiendo llenar el
 * formulario aunque ya fue llenado.
 */
export async function completarOnboardingEstudiante(datos: {
  carnet_ucr: string
  carrera: string
  escuela_facultad: string
  sede: string
  anio_ingreso: number
  nivel_academico: string
  promedio_ponderado?: number | null
  beca_socioeconomica: string
  proyecto_titulo: string
  proyecto_descripcion: string
  proyecto_area_tematica: string
  proyecto_tipo: string
  proyecto_porcentaje_avance: number
  proyecto_necesidades: string[]
  areas_de_interes: string[]
  busca_financiamiento: boolean
  busca_mentoria: boolean
  busca_empleo: boolean
  busca_pasantia: boolean
  habilidades: string[]
  foto_url?: string
  bio?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado. Por favor, inicia sesión nuevamente.' }
    }

    // Usar adminClient para saltarse la RLS en users
    const adminClient = createAdminClient()

    // 1. Guardar datos académicos del estudiante usando adminClient
    const { error: estError } = await adminClient.from('estudiantes').upsert({
      user_id: user.id,
      carnet_ucr: datos.carnet_ucr,
      carrera: datos.carrera,
      escuela_facultad: datos.escuela_facultad,
      sede: datos.sede,
      anio_ingreso: datos.anio_ingreso,
      nivel_academico: datos.nivel_academico,
      promedio_ponderado: datos.promedio_ponderado === 0 ? null : datos.promedio_ponderado,
      beca_socioeconomica: datos.beca_socioeconomica,
      proyecto_titulo: datos.proyecto_titulo,
      proyecto_descripcion: datos.proyecto_descripcion,
      proyecto_area_tematica: datos.proyecto_area_tematica,
      proyecto_tipo: datos.proyecto_tipo,
      proyecto_porcentaje_avance: datos.proyecto_porcentaje_avance,
      proyecto_necesidades: datos.proyecto_necesidades,
      areas_de_interes: datos.areas_de_interes,
      busca_financiamiento: datos.busca_financiamiento,
      busca_mentoria: datos.busca_mentoria,
      busca_empleo: datos.busca_empleo,
      busca_pasantia: datos.busca_pasantia,
      habilidades: datos.habilidades,
      perfil_completo: true,
    }, { onConflict: 'user_id' })

    if (estError) {
      logError('students.ts/completarOnboardingEstudiante', estError, { userId: user.id })
      return { success: false, error: 'Error al guardar datos académicos: ' + estError.message }
    }

    // 2. Marcar perfil_completo en profiles usando adminClient y actualizar foto_url y bio
    const { error: profilesError } = await adminClient.from('profiles').update({
      perfil_completo: 1 as any,
      foto_url: datos.foto_url || null,
      bio: datos.bio || null
    }).eq('id', user.id)

    if (profilesError) {
      logError('students.ts/completarOnboardingEstudiante', profilesError, { userId: user.id })
      console.error('Warning: No se pudo actualizar perfil_completo en profiles:', profilesError.message)
    }

    // 2.5 Actualizar curriculums con el bio (resumen)
    if (datos.bio || (datos.habilidades && datos.habilidades.length > 0)) {
      const { data: currentCv } = await adminClient.from('curriculums').select('id').eq('user_id', user.id).maybeSingle()
      if (!currentCv) {
        await adminClient.from('curriculums').insert({
          user_id: user.id,
          habilidades_blandas: datos.habilidades || [],
          sobre_mi: datos.bio || ''
        })
      } else {
        await adminClient.from('curriculums').update({
          habilidades_blandas: datos.habilidades || [],
          sobre_mi: datos.bio || ''
        }).eq('id', currentCv.id)
      }
    }

    // 3. Actualizar flags de búsqueda en users
    const { error: usersError } = await adminClient.from('users').update({
      busca_mentoria: datos.busca_mentoria,
      busca_empleo: datos.busca_empleo,
      busca_pasantia: datos.busca_pasantia,
    }).eq('id', user.id)

    if (usersError) {
      logError('students.ts/completarOnboardingEstudiante', usersError, { userId: user.id })
      console.error('Warning: No se pudo actualizar flags en users:', usersError.message)
    }

    revalidatePath('/completar-perfil')
    revalidatePath('/student-dashboard')
    return { success: true }
  } catch (err: any) {
    logError('students.ts/completarOnboardingEstudiante', err)
    return { success: false, error: err.message || 'Error interno del servidor.' }
  }
}

export async function actualizarPerfilCompletoEstudiante(datos: any) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logError('students.ts/actualizarPerfilCompletoEstudiante', new Error('No autenticado'));
      return { success: false, error: 'No autenticado. Por favor, inicia sesión nuevamente.' }
    }

    const adminClient = createAdminClient()

    // 1. Actualizar tabla profiles
    const profilePayload = {
      id: user.id,
      full_name: datos.full_name,
      foto_url: datos.foto_url,
      pais_ciudad: datos.pais_ciudad,
      linkedin_url: datos.linkedin_url,
      bio: datos.bio,
      es_exalumno: false // Siempre forzamos a false porque es un estudiante
    }

    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert(profilePayload)

    if (profileError) {
      logError('students.ts/actualizarPerfilCompletoEstudiante', profileError, { userId: user.id });
      return { success: false, error: 'Error al actualizar perfiles: ' + profileError.message }
    }

    // 2. Actualizar tabla users
    const userPayload = {
      busca_mentoria: datos.busca_mentoria,
      busca_empleo: datos.busca_empleo,
      busca_pasantia: datos.busca_pasantia,
    }

    const { error: usersError } = await supabase
      .from('users')
      .update(userPayload)
      .eq('id', user.id)
      .eq('rol', 'estudiante')

    if (usersError) {
      logError('students.ts/actualizarPerfilCompletoEstudiante', usersError, { userId: user.id });
      return { success: false, error: 'Error al actualizar usuario: ' + usersError.message }
    }

    // 3. Actualizar tabla estudiantes
    const estudiantePayload = {
      carrera: datos.carrera,
      escuela_facultad: datos.escuela_facultad,
      sede: datos.sede,
      anio_ingreso: datos.anio_ingreso,
      proyecto_titulo: datos.proyecto_titulo,
      proyecto_descripcion: datos.proyecto_descripcion,
      proyecto_area_tematica: datos.proyecto_area_tematica,
      proyecto_tipo: datos.proyecto_tipo,
      proyecto_porcentaje_avance: datos.proyecto_porcentaje_avance,
      proyecto_valor_monto: datos.proyecto_valor_monto,
      proyecto_valor_moneda: datos.proyecto_valor_moneda,
      proyecto_video_url: datos.proyecto_video_url,
      proyecto_documento_url: datos.proyecto_documento_url,
      proyecto_necesidades: datos.proyecto_necesidades,
      areas_de_interes: datos.areas_de_interes,
      busca_financiamiento: datos.busca_financiamiento,
    }

    const { error: estError } = await supabase
      .from('estudiantes')
      .update(estudiantePayload)
      .eq('user_id', user.id)

    if (estError) {
      logError('students.ts/actualizarPerfilCompletoEstudiante', estError, { userId: user.id });
      return { success: false, error: 'Error al actualizar datos de estudiante: ' + estError.message }
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error interno del servidor.' }
  }
}

export async function obtenerMiPerfilEstudiante() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    logError('students.ts/obtenerMiPerfilEstudiante', new Error('No autenticado'));
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      estudiantes (*)
    `)
    .eq('id', user.id)
    .eq('rol', 'estudiante')
    .single()

  if (error && error.code !== 'PGRST116') {
    logError('students.ts/obtenerMiPerfilEstudiante', error, { userId: user.id });
    return null;
  }
  
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

  if (error || !userRecord) {
    if (error) logError('students.ts/verificarPerfilCompleto', error, { userId });
    return false;
  }

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
    const terminos = opciones.busqueda.trim().split(/\s+/);
    terminos.forEach(termino => {
      query = query.or(`nombre.ilike.%${termino}%,apellidos.ilike.%${termino}%`);
    });
  }

  if (opciones?.page && opciones?.limit) {
    const from = (opciones.page - 1) * opciones.limit
    const to = from + opciones.limit - 1
    query = query.range(from, to)
  } else if (opciones?.limit) {
    query = query.limit(opciones.limit)
  }

  const { data, count, error } = await query
  if (error) {
    logError('students.ts/listarEstudiantes', error);
    return { data: [], count: 0 };
  }

  // Cargar foto_url y banner_url personalizados desde la tabla profiles para evitar inconsistencias
  const userIds = data?.map(d => d.id) || [];
  let profilesData: any[] = [];
  if (userIds.length > 0) {
    try {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, foto_url, banner_url')
        .in('id', userIds);
      if (profs) {
        profilesData = profs;
      }
    } catch (err) {
      console.error('Error fetching batch profiles in listarEstudiantes:', err);
    }
  }
  
  const mappedData = data?.map(d => {
    const est = Array.isArray(d.estudiantes) ? d.estudiantes[0] : d.estudiantes;
    const prof = profilesData.find(p => p.id === d.id);
    return {
      ...d,
      estudiantes: est,
      areas_de_interes: est?.areas_de_interes || [],
      foto_url: prof?.foto_url || d.foto_url,
      banner_url: prof?.banner_url || null
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

  if (error) {
    logError('students.ts/obtenerEstudiantePorId', error);
    return null;
  }

  let banner_url: string | null = null;
  let custom_foto_url: string | null = null;
  try {
    const { data: profData } = await supabase
      .from('profiles')
      .select('banner_url, foto_url')
      .eq('id', id)
      .maybeSingle();
    if (profData) {
      banner_url = profData.banner_url;
      custom_foto_url = profData.foto_url;
    }
  } catch (err) {
    console.error('Error fetching banner_url and foto_url from profiles:', err);
  }

  if (data) {
    const est = Array.isArray(data.estudiantes) ? data.estudiantes[0] : data.estudiantes;
    return { 
      ...data, 
      estudiantes: est,
      areas_de_interes: est?.areas_de_interes || [],
      banner_url,
      foto_url: custom_foto_url || data.foto_url
    }
  }

  return data
}

export async function pausarPerfilEstudiante(pausar: boolean = true) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    logError('students.ts/pausarPerfilEstudiante', new Error('No autenticado'));
    return { success: false, error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('users')
    .update({ visible_en_directorio: !pausar })
    .eq('id', user.id)
    .eq('rol', 'estudiante')

  if (error) {
    logError('students.ts/pausarPerfilEstudiante', error, { userId: user.id });
    return { success: false, error: 'Error interno del servidor' };
  }
  revalidatePath('/mi-perfil')
  return { success: true }
}
