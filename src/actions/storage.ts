'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function uploadFileAction(formData: FormData, bucket: 'avatars' | 'comprobantes' | 'proyectos', prefix?: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autorizado');
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No se encontró archivo en el form data');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${prefix ? prefix + '/' : ''}${crypto.randomUUID()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw new Error('Error al subir el archivo al storage');
  }

  return { success: true, path: data.path };
}

export async function getSignedUrlAction(bucket: 'comprobantes' | 'avatars' | 'proyectos', path: string, expiresIn: number = 3600) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No autorizado');
  }

  let allowed = false;

  const adminClient = createAdminClient();
  
  // Validar el rol del usuario
  const { data: userProfile } = await adminClient
    .from('users')
    .select('rol').is('deleted_at', null)
    .eq('id', user.id)
    .single();

  if (userProfile?.rol === 'admin') {
    allowed = true;
  } else if (bucket === 'comprobantes') {
    // Validar si es el exalumno que donó, o el estudiante que recibe
    const { data: dbData, error: dbError } = await supabase
      .from('donations')
      .select('user_id').is('deleted_at', null)
      .eq('comprobante_url', path)
      .single();
      
    if (dbData && dbData.user_id === user.id) {
      allowed = true;
    }
  } else if (bucket === 'avatars' || bucket === 'proyectos') {
    allowed = true; 
  }

  if (!allowed) {
    throw new Error('No tienes permiso para ver este archivo');
  }

  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    throw new Error('Error al generar la URL firmada');
  }

  return { success: true, signedUrl: data.signedUrl };
}
