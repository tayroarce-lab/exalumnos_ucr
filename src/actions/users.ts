'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function obtenerMiPerfil() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('No autenticado')
  }

  const { data: perfil, error: dbError } = await supabase
    .from('users')
    .select('*').is('deleted_at', null)
    .eq('id', user.id)
    .maybeSingle()

  if (dbError) throw new Error(dbError.message)

  return perfil
}

export async function subirFotoPerfil(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('users')
    .update({ foto_url: url })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/mi-perfil')
  return { success: true }
}

export async function desactivarCuenta() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('users')
    .update({ activo: false })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
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

  if (error) throw new Error(error.message)
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

  if (error) throw new Error(error.message)
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
  if (error) throw new Error(error.message)

  return data
}

export async function actualizarPerfil(data: any) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('No autenticado')
  }

  // Verificar rol del usuario en la tabla users para seguridad
  const adminClient = createAdminClient()
  const { data: userData, error: userError } = await adminClient
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (userError) {
    throw new Error('Error al verificar el rol del usuario')
  }

  const isAdmin = userData?.rol === 'admin'

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
    const es_exalumno = data.academic && data.academic.some((a: any) => a.carrera?.trim() !== '' && a.escuela?.trim() !== '' && a.anio?.trim() !== '')

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
    throw new Error('Error al guardar el perfil: ' + error.message)
  }

  return { success: true, isAdmin }
}
