'use server';

import { createClient } from '@/lib/supabase/server';


// ============================================================================
// PROFILE ACTIONS
// ============================================================================

export async function getOrCreateCvProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const userId = user.id;

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const userId = user.id;

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

  const academicInfos = profile.cv_academic_info || [];
  const experiencesRaw = profile.cv_experiences || [];
  const skills = profile.cv_skills || [];
  const certifications = profile.cv_certifications || [];

  // Ordenar experiencias por fecha descendente o sort_order si lo implementan en UI
  const experiences = experiencesRaw.sort((a: any, b: any) => {
    if (a.start_year !== b.start_year) return (b.start_year || 0) - (a.start_year || 0);
    return (b.start_month || 0) - (a.start_month || 0);
  });

  return { 
    success: true, 
    data: {
      profile_id: profile.id,
      academic: academicInfos.length > 0 ? academicInfos[0] : null,
      experiences,
      skills,
      certifications
    }
  };
}
