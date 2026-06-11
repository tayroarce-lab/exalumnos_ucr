'use server';

import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import { certificationSchema, CertificationData } from './schemas';
import { getOrCreateCvProfile } from './profile.actions';
import { revalidatePath } from 'next/cache';

export async function upsertCertification(data: CertificationData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const validation = certificationSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Datos inválidos', errors: validation.error.flatten() };
  }

  const profileResponse = await getOrCreateCvProfile();
  if (!profileResponse.success || !profileResponse.profile) {
    return { success: false, message: profileResponse.message || 'Error obteniendo perfil' };
  }

  const supabase = await createClient();
  const profileId = profileResponse.profile.id;

  const payload: any = {
    profile_id: profileId,
    name: validation.data.name,
    institution: validation.data.institution,
    issued_month: validation.data.issued_month,
    issued_year: validation.data.issued_year,
    verification_url: validation.data.verification_url
  };

  if (validation.data.id) {
    payload.id = validation.data.id;
  }

  const { error } = await supabase
    .from('cv_certifications')
    .upsert(payload);

  if (error) {
    return { success: false, message: `Error guardando certificación: ${error.message}` };
  }

  revalidatePath('/dashboard/cv');
  return { success: true, message: 'Certificación guardada' };
}

export async function deleteCertification(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('cv_certifications')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, message: `Error eliminando certificación: ${error.message}` };
  }

  revalidatePath('/dashboard/cv');
  return { success: true, message: 'Certificación eliminada' };
}
