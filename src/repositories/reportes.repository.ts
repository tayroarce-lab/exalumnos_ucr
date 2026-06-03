import { createAdminClient } from '@/lib/supabase/admin';

export async function insertReport(userId: string, perfilReportado: string, motivo: string, descripcion?: string) {
  // Use admin client since user client might not have permissions for certain checks or just for consistency
  // Actually, inserting a report can be done by normal client if RLS is setup, 
  // but for refactoring safety, we use the passed client or admin
  const adminClient = createAdminClient();
  const { error } = await adminClient.from('reportes_perfil').insert({
    reportado_por: userId,
    perfil_reportado: perfilReportado,
    motivo,
    descripcion,
    resuelto: false
  });
  if (error) throw error;
}

export async function fetchReportedUserStats(userId: string) {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('users')
    .select('email, reportes_recibidos, activo')
    .eq('id', userId)
    .single();
  return data;
}

export async function fetchAllActiveAdmins() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('users')
    .select('email')
    .eq('tipo', 'admin')
    .eq('activo', true);
  return data || [];
}

export async function fetchPendingReports() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('reportes_perfil')
    .select(`
      *,
      denunciante:users!reportes_perfil_reportado_por_fkey(nombre, email),
      reportado:users!reportes_perfil_perfil_reportado_fkey(nombre, email, reportes_recibidos)
    `)
    .eq('resuelto', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markReportAsResolved(reportId: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('reportes_perfil')
    .update({ resuelto: true })
    .eq('id', reportId);
  
  if (error) throw error;
}
