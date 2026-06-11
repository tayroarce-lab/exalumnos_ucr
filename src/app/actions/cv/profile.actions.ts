'use server';

import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';

// ============================================================================
// PROFILE ACTIONS
// ============================================================================

export async function getOrCreateCvProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const supabase = await createClient();
  const userId = session.user.id;

  // Intentar obtener el perfil existente
  const { data: profile, error: getError } = await supabase
    .from('cv_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profile) {
    return { success: true, profile };
  }

  if (getError && getError.code !== 'PGRST116') { // PGRST116 is "No rows found"
    return { success: false, message: `Error obteniendo perfil: ${getError.message}` };
  }

  // Si no existe, crearlo
  const { data: newProfile, error: createError } = await supabase
    .from('cv_profiles')
    .insert({ user_id: userId })
    .select()
    .single();

  if (createError) {
    return { success: false, message: `Error creando perfil: ${createError.message}` };
  }

  return { success: true, profile: newProfile };
}

export async function getFullCvData() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const supabase = await createClient();
  const userId = session.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('cv_profiles')
    .select(`
      id,
      is_complete,
      cv_academic_info (*),
      cv_experiences (*),
      cv_skills (*),
      cv_certifications (*)
    `)
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    return { success: false, message: profileError?.message || 'Perfil no encontrado' };
  }

  // Ordenar experiencias por fecha descendente o sort_order si lo implementan en UI
  const experiences = profile.cv_experiences.sort((a: any, b: any) => {
    if (a.start_year !== b.start_year) return b.start_year - a.start_year;
    return b.start_month - a.start_month;
  });

  return { 
    success: true, 
    data: {
      profile_id: profile.id,
      academic: profile.cv_academic_info.length > 0 ? profile.cv_academic_info[0] : null,
      experiences,
      skills: profile.cv_skills,
      certifications: profile.cv_certifications
    }
  };
}
