'use server';

import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import { experienceSchema, ExperienceData } from './schemas';
import { getOrCreateCvProfile } from './profile.actions';
import { revalidatePath } from 'next/cache';

export async function upsertExperience(data: ExperienceData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const validation = experienceSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Datos inválidos', errors: validation.error.flatten() };
  }

  // App-level limit check para viñetas (<= 120 chars) en caso de que Zod pase (aunque Zod ya valida)
  const bullets = validation.data.bullets || [];
  if (bullets.some(b => b.length > 120)) {
    return { success: false, message: 'Una o más viñetas exceden los 120 caracteres permitidos.' };
  }

  const profileResponse = await getOrCreateCvProfile();
  if (!profileResponse.success || !profileResponse.profile) {
    return { success: false, message: profileResponse.message || 'Error obteniendo perfil' };
  }

  const supabase = await createClient();
  const profileId = profileResponse.profile.id;

  const payload: any = {
    profile_id: profileId,
    experience_type: validation.data.experience_type,
    title: validation.data.title,
    organization: validation.data.organization,
    start_month: validation.data.start_month,
    start_year: validation.data.start_year,
    end_month: validation.data.end_month,
    end_year: validation.data.end_year,
    bullets: bullets
  };

  if (validation.data.id) {
    payload.id = validation.data.id;
  }

  const { error } = await supabase
    .from('cv_experiences')
    .upsert(payload);

  if (error) {
    return { success: false, message: `Error guardando experiencia: ${error.message}` };
  }

  revalidatePath('/dashboard/cv');
  return { success: true, message: 'Experiencia guardada' };
}

export async function deleteExperience(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const supabase = await createClient();
  // RLS will ensure the user can only delete their own
  const { error } = await supabase
    .from('cv_experiences')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, message: `Error eliminando experiencia: ${error.message}` };
  }

  revalidatePath('/dashboard/cv');
  return { success: true, message: 'Experiencia eliminada' };
}
