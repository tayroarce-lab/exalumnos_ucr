'use server';

import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import { academicInfoSchema, AcademicInfoData } from './schemas';
import { getOrCreateCvProfile } from './profile.actions';
import { revalidatePath } from 'next/cache';

export async function upsertAcademicInfo(data: AcademicInfoData) {
  const session = await auth();
  if (!session?.user?.id) {
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

  const supabase = await createClient();
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
