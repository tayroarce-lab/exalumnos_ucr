'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadProfileImage, uploadBannerImage } from '@/lib/profile-upload'
import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/logger'

export async function updateProfileImage(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'No autorizado' }
    }

    const file = formData.get('image') as File
    if (!file) {
      return { success: false, error: 'No se envió ninguna imagen' }
    }

    const publicUrl = await uploadProfileImage(file, user.id)

    const { error } = await supabase
      .from('profiles')
      .update({ foto_url: publicUrl })
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/profile')
    return { success: true, url: publicUrl }
  } catch (error) {
    logError('updateProfileImage', error)
    return { success: false, error: 'Ocurrió un error al actualizar la foto' }
  }
}

export async function updateBannerImage(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'No autorizado' }
    }

    const file = formData.get('image') as File
    if (!file) {
      return { success: false, error: 'No se envió ninguna imagen' }
    }

    const publicUrl = await uploadBannerImage(file, user.id)

    const { error } = await supabase
      .from('profiles')
      .update({ banner_url: publicUrl })
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/profile')
    return { success: true, url: publicUrl }
  } catch (error) {
    logError('updateBannerImage', error)
    return { success: false, error: 'Ocurrió un error al actualizar el banner' }
  }
}
