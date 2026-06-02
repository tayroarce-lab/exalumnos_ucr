'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface CrearReporteInput {
  perfil_reportado: string;
  motivo: string;
  descripcion?: string;
}

export async function crearReporte(data: CrearReporteInput) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  if (user.id === data.perfil_reportado) {
    throw new Error('No puedes reportar tu propio perfil');
  }

  const { error } = await supabase.from('reportes_perfil').insert({
    reportado_por: user.id,
    perfil_reportado: data.perfil_reportado,
    motivo: data.motivo,
    descripcion: data.descripcion,
    resuelto: false
  });

  if (error) {
    console.error('Error al crear reporte:', error);
    throw new Error('Error al registrar el reporte');
  }

  return { success: true };
}

export async function obtenerReportesPendientes() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  const adminClient = createAdminClient();

  // Validar si el usuario es admin
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .eq('id', user.id)
    .single();

  if (profile?.tipo !== 'admin') {
    throw new Error('Solo los administradores pueden ver los reportes');
  }

  const { data, error } = await adminClient
    .from('reportes_perfil')
    .select(`
      *,
      denunciante:users!reportes_perfil_reportado_por_fkey(nombre, email),
      reportado:users!reportes_perfil_perfil_reportado_fkey(nombre, email, reportes_recibidos)
    `)
    .eq('resuelto', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener reportes:', error);
    throw new Error('Error al obtener la lista de reportes pendientes');
  }

  return { success: true, data };
}

export async function resolverReporte(reporte_id: string) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  const adminClient = createAdminClient();

  // Validar si el usuario es admin
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .eq('id', user.id)
    .single();

  if (profile?.tipo !== 'admin') {
    throw new Error('Solo los administradores pueden resolver reportes');
  }

  const { error } = await adminClient
    .from('reportes_perfil')
    .update({ resuelto: true })
    .eq('id', reporte_id);

  if (error) {
    console.error('Error al resolver reporte:', error);
    throw new Error('Error al actualizar el estado del reporte');
  }

  return { success: true };
}
