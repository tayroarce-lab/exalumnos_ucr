import { createAdminClient } from '@/lib/supabase/admin';

export async function fetchUserRole(userId: string) {
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .eq('id', userId)
    .single();
  return profile?.tipo;
}

export async function fetchConfirmedDonations() {
  const adminClient = createAdminClient();
  const { data: donaciones } = await adminClient
    .from('donaciones')
    .select('monto, moneda, proyecto_estudiante_id')
    .eq('estado', 'confirmada');
  return donaciones || [];
}

export async function fetchAllDonations() {
  const adminClient = createAdminClient();
  const { data: donaciones } = await adminClient
    .from('donaciones')
    .select('exalumno_id')
    .eq('estado', 'confirmada');
  return donaciones || [];
}

export async function fetchActiveMatchesCount() {
  const adminClient = createAdminClient();
  const { count, data } = await adminClient
    .from('matches')
    .select('estudiante_id', { count: 'exact' })
    .eq('estado', 'activo');
  return { count: count || 0, data: data || [] };
}

export async function fetchClosedMatchesCount() {
  const adminClient = createAdminClient();
  const { count, data } = await adminClient
    .from('matches')
    .select('estudiante_id', { count: 'exact' })
    .eq('estado', 'cerrado')
    .eq('resultado', 'exitoso');
  return { count: count || 0, data: data || [] };
}

export async function fetchActiveUsersCount(tipo: 'exalumno' | 'estudiante') {
  const adminClient = createAdminClient();
  const { count } = await adminClient
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', tipo)
    .eq('activo', true);
  return count || 0;
}

export async function fetchEstudiantesData() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('estudiantes')
    .select('carrera, sede');
  return data || [];
}
