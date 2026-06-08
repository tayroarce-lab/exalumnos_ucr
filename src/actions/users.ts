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
    .single()

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
    .select('tipo').is('deleted_at', null)
    .eq('id', user.id)
    .single()

  if (data?.tipo !== 'admin') {
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

export async function listarUsuarios(filtros?: { tipo?: string; activo?: boolean }) {
  await verificarAdmin()
  const adminClient = createAdminClient()

  let query = adminClient.from('users').select('*').is('deleted_at', null).order('created_at', { ascending: false })

  if (filtros?.tipo) {
    query = query.eq('tipo', filtros.tipo)
  }
  if (filtros?.activo !== undefined) {
    query = query.eq('activo', filtros.activo)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return data
}
