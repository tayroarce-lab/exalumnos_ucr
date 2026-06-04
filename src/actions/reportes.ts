'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notificarSuspensionAdmin } from '@/lib/email';

export interface CrearReporteInput {
  perfil_reportado: string;
  motivo: string;
  descripcion?: string;
}

// ---------------------------------------------------------------------------
// Helper interno: verifica rol admin usando el cliente administrativo
// ---------------------------------------------------------------------------
async function assertAdmin(userId: string): Promise<void> {
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .eq('id', userId)
    .single();

  if (profile?.tipo !== 'admin') {
    throw new Error('Solo los administradores pueden realizar esta acción');
  }
}

// ---------------------------------------------------------------------------
// crearReporte
// Inserta el reporte y, si se superan 3 reportes, notifica a los admins.
// Usa adminClient porque insertar en reportes_perfil puede requerir bypass
// de RLS para leer datos cruzados (reportes_recibidos, emails de admins).
// ---------------------------------------------------------------------------
export async function crearReporte(data: CrearReporteInput) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  if (user.id === data.perfil_reportado) {
    throw new Error('No puedes reportar tu propio perfil');
  }

  const adminClient = createAdminClient();

  try {
    // Insertar el reporte
    const { error: insertError } = await adminClient.from('reportes_perfil').insert({
      reportado_por: user.id,
      perfil_reportado: data.perfil_reportado,
      motivo: data.motivo,
      descripcion: data.descripcion,
      resuelto: false,
    });
    if (insertError) throw insertError;

    // Verificar si el usuario fue suspendido por trigger (>= 3 reportes)
    const { data: usuarioReportado } = await adminClient
      .from('users')
      .select('email, reportes_recibidos, activo')
      .eq('id', data.perfil_reportado)
      .single();

    if (
      usuarioReportado &&
      usuarioReportado.reportes_recibidos >= 3 &&
      usuarioReportado.activo === false
    ) {
      // Notificar a todos los admins activos
      const { data: admins } = await adminClient
        .from('users')
        .select('email')
        .eq('tipo', 'admin')
        .eq('activo', true);

      if (admins && admins.length > 0) {
        const adminEmails = admins.map((a) => a.email);
        await notificarSuspensionAdmin(
          adminEmails,
          'Equipo Administrador',
          usuarioReportado.email,
          usuarioReportado.reportes_recibidos,
        );
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error al crear reporte:', error);
    throw new Error(error.message || 'Error al registrar el reporte');
  }
}

// ---------------------------------------------------------------------------
// obtenerReportesPendientes
// Solo admins. Usa adminClient para leer datos cruzados de múltiples usuarios.
// ---------------------------------------------------------------------------
export async function obtenerReportesPendientes() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  await assertAdmin(user.id);

  const adminClient = createAdminClient();

  try {
    const { data, error } = await adminClient
      .from('reportes_perfil')
      .select(
        `*,
        denunciante:users!reportes_perfil_reportado_por_fkey(nombre, email),
        reportado:users!reportes_perfil_perfil_reportado_fkey(nombre, email, reportes_recibidos)`,
      )
      .eq('resuelto', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    throw new Error(error.message || 'Error al obtener la lista de reportes pendientes');
  }
}

// ---------------------------------------------------------------------------
// resolverReporte
// Solo admins. Marca el reporte como resuelto.
// ---------------------------------------------------------------------------
export async function resolverReporte(reporte_id: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  await assertAdmin(user.id);

  const adminClient = createAdminClient();

  try {
    const { error } = await adminClient
      .from('reportes_perfil')
      .update({ resuelto: true })
      .eq('id', reporte_id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error al resolver reporte:', error);
    throw new Error(error.message || 'Error al actualizar el estado del reporte');
  }
}
