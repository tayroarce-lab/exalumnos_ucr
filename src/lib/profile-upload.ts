import { createClient } from '@/lib/supabase/server';
import { logError } from '@/lib/logger';

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${userId}/avatar.${ext}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (error) {
    logError('uploadProfileImage', error);
    throw new Error('Error al subir la imagen de perfil');
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl + '?t=' + new Date().getTime(); // cache busting
}

export async function uploadBannerImage(file: File, userId: string): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${userId}/banner.${ext}`;
  
  const { data, error } = await supabase.storage
    .from('profile-banners')
    .upload(fileName, file, { upsert: true });

  if (error) {
    logError('uploadBannerImage', error);
    throw new Error('Error al subir el banner');
  }

  const { data: publicUrlData } = supabase.storage
    .from('profile-banners')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl + '?t=' + new Date().getTime(); // cache busting
}
