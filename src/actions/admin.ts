'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchUserRole } from '@/repositories/admin.repository';
import { calculateDashboardMetrics } from '@/services/admin.service';

export async function getDashboardMetrics() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('No autenticado');
    }

    // Validar permisos de administrador a través del repositorio
    const userRole = await fetchUserRole(user.id);
    if (userRole !== 'admin') {
      throw new Error('Solo los administradores pueden ver el dashboard');
    }

    // Calcular métricas mediante el servicio
    const metrics = await calculateDashboardMetrics();

    return {
      success: true,
      data: metrics
    };
  } catch (error: any) {
    console.error('Error en getDashboardMetrics:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function verificarRolAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('No autenticado')
  }

  const userRole = await fetchUserRole(user.id)
  if (userRole !== 'admin') {
    throw new Error('Solo los administradores tienen acceso a esta acción')
  }
}

export async function gestionarMatch(matchId: string, estado: 'sugerido' | 'contactado' | 'activo' | 'cerrado', notas_admin?: string) {
  await verificarRolAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('matches')
    .update({ estado, notas_admin, updated_at: new Date().toISOString() })
    .eq('id', matchId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function listarMatchesAdmin(filtros?: { estado?: string; tipo_apoyo?: string }) {
  await verificarRolAdmin()
  const adminClient = createAdminClient()

  let query = adminClient.from('matches').select(`
    *,
    exalumno:users!matches_exalumno_id_fkey(nombre, email),
    estudiante:users!matches_estudiante_id_fkey(nombre, email)
  `).order('created_at', { ascending: false })

  if (filtros?.estado) query = query.eq('estado', filtros.estado)
  if (filtros?.tipo_apoyo) query = query.eq('tipo_apoyo', filtros.tipo_apoyo)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function listarDonacionesPendientes() {
  await verificarRolAdmin()
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('donaciones')
    .select(`
      *,
      exalumno:users!donaciones_exalumno_id_fkey(nombre, email),
      estudiante:users!donaciones_proyecto_estudiante_id_fkey(nombre, email)
    `)
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true }) // Las más antiguas primero

  if (error) throw new Error(error.message)
  return data
}
