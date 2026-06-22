'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/logger'

export async function obtenerMiPerfil() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logError('users.ts/obtenerMiPerfil', authError || new Error('No autenticado'));
    return null;
  }

  const { data: perfil, error: dbError } = await supabase
    .from('users')
    .select(`
      *,
      estudiantes (*),
      exalumnos (*),
      curriculums (*),
      carrera_principal:carrera_campus!users_carrera_principal_id_fkey(
        carreras(nombre)
      ),
      users_areas_interes(
        catalogo_areas_interes(nombre)
      )
    `)
    .is('deleted_at', null)
    .eq('id', user.id)
    .maybeSingle()

  if (dbError) {
    logError('users.ts/obtenerMiPerfil', dbError, { userId: user.id });
    return null;
  }

  if (perfil) {
    const est = Array.isArray(perfil.estudiantes) ? perfil.estudiantes[0] : perfil.estudiantes;
    const exa = Array.isArray(perfil.exalumnos) ? perfil.exalumnos[0] : perfil.exalumnos;
    const curr = Array.isArray(perfil.curriculums) ? perfil.curriculums[0] : perfil.curriculums;
    
    // Mapear áreas de interés desde la tabla relacional V2 si existe, de lo contrario fallback
    const mappedAreas = perfil.users_areas_interes 
      ? perfil.users_areas_interes.map((ua: any) => ua.catalogo_areas_interes?.nombre).filter(Boolean)
      : [];

    return {
      ...perfil,
      ...(est || {}),
      ...(exa || {}),
      ...(curr || {}),
      carrera: perfil.carrera_principal?.carreras?.nombre || est?.carrera || exa?.carrera_ucr || null,
      areas_de_interes: mappedAreas.length > 0 ? mappedAreas : (est?.areas_de_interes || exa?.areas_de_interes || perfil.areas_de_interes || []),
    }
  }

  return perfil
}

export async function subirFotoPerfil(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    logError('users.ts/subirFotoPerfil', new Error('No autenticado'));
    return { success: false, error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('users')
    .update({ foto_url: url })
    .eq('id', user.id)

  if (error) {
    logError('users.ts/subirFotoPerfil', error, { userId: user.id });
    return { success: false, error: 'Error interno del servidor' };
  }
  revalidatePath('/mi-perfil')
  return { success: true }
}

export async function desactivarCuenta() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    logError('users.ts/desactivarCuenta', new Error('No autenticado'));
    return { success: false, error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('users')
    .update({ activo: false })
    .eq('id', user.id)

  if (error) {
    logError('users.ts/desactivarCuenta', error, { userId: user.id });
    return { success: false, error: 'Error interno del servidor' };
  }
  return { success: true }
}

// --- ACCIONES ADMINISTRATIVAS ---

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('users')
    .select('rol').is('deleted_at', null)
    .eq('id', user.id)
    .single()

  if (data?.rol !== 'admin') {
    throw new Error('Acceso denegado: Se requieren permisos de administrador')
  }
}

export async function suspenderUsuario(userId: string) {
  await verificarAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('users')
    .update({ activo: false })
    .eq('id', userId)

  if (error) {
    logError('users.ts/suspenderUsuario', error, { targetUserId: userId });
    return { success: false, error: 'Error interno del servidor' };
  }
  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function reactivarUsuario(userId: string) {
  await verificarAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('users')
    .update({ activo: true })
    .eq('id', userId)

  if (error) {
    logError('users.ts/reactivarUsuario', error, { targetUserId: userId });
    return { success: false, error: 'Error interno del servidor' };
  }
  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function listarUsuarios(filtros?: { rol?: string; activo?: boolean }) {
  await verificarAdmin()
  const adminClient = createAdminClient()

  let query = adminClient.from('users').select('*').is('deleted_at', null).order('created_at', { ascending: false })

  if (filtros?.rol) {
    query = query.eq('rol', filtros.rol)
  }
  if (filtros?.activo !== undefined) {
    query = query.eq('activo', filtros.activo)
  }

  const { data, error } = await query
  if (error) {
    logError('users.ts/listarUsuarios', error);
    return [];
  }

  return data
}

export async function actualizarPerfil(data: any) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logError('users.ts/actualizarPerfil', authError || new Error('No autenticado'));
    return { success: false, error: 'No autenticado' };
  }

  // Verificar rol del usuario en la tabla users para seguridad
  const adminClient = createAdminClient()
  const { data: userData, error: userError } = await adminClient
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (userError) {
    logError('users.ts/actualizarPerfil', userError, { userId: user.id });
    return { success: false, error: 'Error al verificar el rol' };
  }

  const isAdmin = userData?.rol === 'admin'
  const isStudentUser = userData?.rol === 'estudiante'

  let payloadToUpdate: any = {
    id: user.id,
    foto_url: data.foto_url,
    pais_ciudad: data.pais_ciudad,
    full_name: data.full_name,
  }

  if (isAdmin) {
    // Si es admin, forzar nulos/falsos en campos de directorio
    payloadToUpdate = {
      ...payloadToUpdate,
      linkedin_url: null,
      bio: data.bio || null, // Permitir bio básica si se desea
      academic: null,
      carrera_principal: null,
      escuela_principal: null,
      facultad_principal: null,
      anio_graduacion: null,
      empresa_actual: null,
      cargo_actual: null,
      sector_industria: null,
      anos_experiencia: null,
      areas_de_interes: null,
      ofrece_mentoria: false,
      horas_mes_mentoria: null,
      ofrece_empleo: false,
      ofrece_pasantia: false,
      ofrece_proyecto: false,
      ofrece_donacion_dinero: false,
      monto_maximo_donacion: null,
      moneda_donacion: null,
      es_exalumno: false
    }
  } else {
    // Si no es admin, guardar todos los campos enviados
    const primeraCarrera = data.academic && data.academic.length > 0 ? data.academic[0] : null
    const hasAcademic = data.academic && data.academic.some((a: any) => a.carrera?.trim() !== '' && a.escuela?.trim() !== '' && a.anio?.trim() !== '')
    const es_exalumno = isStudentUser ? false : hasAcademic;

    payloadToUpdate = {
      ...payloadToUpdate,
      linkedin_url: data.linkedin_url,
      bio: data.bio,
      academic: data.academic,
      carrera_principal: primeraCarrera?.carrera || null,
      escuela_principal: primeraCarrera?.escuela || null,
      facultad_principal: primeraCarrera?.escuela && primeraCarrera.escuela.toLowerCase().includes('facultad') 
        ? primeraCarrera.escuela 
        : null,
      anio_graduacion: primeraCarrera?.anio ? parseInt(primeraCarrera.anio) : null,
      empresa_actual: data.empresa_actual,
      cargo_actual: data.cargo_actual,
      sector_industria: data.sector_industria,
      anos_experiencia: data.anos_experiencia ? Number(data.anos_experiencia) : null,
      areas_de_interes: data.areas_de_interes,
      ofrece_mentoria: data.ofrece_mentoria,
      horas_mes_mentoria: data.horas_mes_mentoria ? Number(data.horas_mes_mentoria) : null,
      ofrece_empleo: data.ofrece_empleo,
      ofrece_pasantia: data.ofrece_pasantia,
      ofrece_proyecto: data.ofrece_proyecto,
      ofrece_donacion_dinero: data.ofrece_donacion_dinero,
      monto_maximo_donacion: data.donacion_monto_max ? Number(data.donacion_monto_max) : null,
      moneda_donacion: data.donacion_moneda,
      es_exalumno: es_exalumno
    }
  }

  const { error } = await adminClient
    .from('profiles')
    .upsert(payloadToUpdate)

  if (error) {
    logError('users.ts/actualizarPerfil', error, { userId: user.id });
    return { success: false, error: 'Error al guardar el perfil' };
  }

  return { success: true, isAdmin }
}
