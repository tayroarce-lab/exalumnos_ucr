'use server';

import { createClient } from '@/lib/supabase/server';
import { academicInfoSchema, AcademicInfoData } from './schemas';
import { getOrCreateCvProfile } from './profile.actions';
import { revalidatePath } from 'next/cache';

export async function upsertAcademicInfo(data: AcademicInfoData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  // Validar con Zod
  const validation = academicInfoSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Datos inválidos', errors: validation.error.flatten() };
  }

  const profileResponse = await getOrCreateCvProfile();
  if (!profileResponse.success || !profileResponse.profile) {
    return { success: false, message: profileResponse.message || 'Error obteniendo perfil' };
  }

  const profileId = profileResponse.profile.id;

  const { error } = await supabase
    .from('cv_academic_info')
    .upsert({
      profile_id: profileId,
      ...validation.data
    });

  if (error) {
    return { success: false, message: `Error guardando información académica: ${error.message}` };
  }

  revalidatePath('/dashboard/cv');
  return { success: true, message: 'Información académica guardada' };
}
