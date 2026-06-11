'use server';

import { createClient } from '@/lib/supabase/server';
import { skillSchema, SkillData } from './schemas';
import { getOrCreateCvProfile } from './profile.actions';
import { revalidatePath } from 'next/cache';

export async function upsertSkill(data: SkillData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const validation = skillSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Datos inválidos', errors: validation.error.flatten() };
  }

  const profileResponse = await getOrCreateCvProfile();
  if (!profileResponse.success || !profileResponse.profile) {
    return { success: false, message: profileResponse.message || 'Error obteniendo perfil' };
  }

  const profileId = profileResponse.profile.id;

  const payload: any = {
    profile_id: profileId,
    skill_type: validation.data.skill_type,
    name: validation.data.name,
    level: validation.data.level
  };

  if (validation.data.id) {
    payload.id = validation.data.id;
  }

  const { error } = await supabase
    .from('cv_skills')
    .upsert(payload);

  if (error) {
    return { success: false, message: `Error guardando habilidad: ${error.message}` };
  }

  revalidatePath('/dashboard/cv');
  return { success: true, message: 'Habilidad guardada' };
}

export async function deleteSkill(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const { error } = await supabase
    .from('cv_skills')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, message: `Error eliminando habilidad: ${error.message}` };
  }

  revalidatePath('/dashboard/cv');
  return { success: true, message: 'Habilidad eliminada' };
}
