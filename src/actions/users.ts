'use server'

import { createClient } from '@/lib/supabase/server'

// Rutas: PATCH /api/users/profile-photo
export async function subirFotoPerfil(userId: string, url: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ foto_url: url })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  return { success: true }
}

// Rutas: PATCH /api/users/deactivate
export async function desactivarCuenta(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ activo: false })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  return { success: true }
}
