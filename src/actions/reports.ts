'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { sendReportNotificationEmail } from '@/services/email-service';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// Interfaces de tipado manual para profile_reports (tabla nueva, aún no en
// database.types.ts — agregar después de ejecutar supabase gen types)
// ---------------------------------------------------------------------------
export interface SubmitReportInput {
  reported_user_id: string;
  reason: 'Spam' | 'Perfil Falso' | 'Comportamiento Inapropiado' | 'Otro';
  description?: string;
}

export interface ProfileReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string | null;
  status: 'pendiente' | 'en_revision' | 'resuelto' | 'desestimado';
  created_at: string;
  updated_at: string;
  reporter?: { nombre: string; email: string } | null;
  reported?: { nombre: string; email: string } | null;
}

// ---------------------------------------------------------------------------
// Helper: cliente sin tipos estrictos para consultar profile_reports
// (la tabla no existe aún en database.types.ts)
// ---------------------------------------------------------------------------
function createUntypedAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL');
  if (!key) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Helper: verifica que el usuario autenticado sea admin
// ---------------------------------------------------------------------------
async function assertAdmin(userId: string): Promise<void> {
  const adminClient = createUntypedAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .is('deleted_at', null)
    .eq('id', userId)
    .single();

  if (profile?.tipo !== 'admin') {
    throw new Error('Solo los administradores pueden realizar esta acción');
  }
}

// ---------------------------------------------------------------------------
// submitProfileReport
// Crea un nuevo reporte y notifica a los admins por correo.
// ---------------------------------------------------------------------------
export async function submitProfileReport(data: SubmitReportInput) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'No autenticado' };
  }

  if (user.id === data.reported_user_id) {
    return { success: false, error: 'No puedes reportar tu propio perfil' };
  }

  const adminClient = createUntypedAdminClient();

  try {
    // Insertar el reporte
    const { error: insertError } = await adminClient.from('profile_reports').insert({
      reporter_id: user.id,
      reported_user_id: data.reported_user_id,
      reason: data.reason,
      description: data.description ?? null,
      status: 'pendiente',
    });

    if (insertError) throw new Error(insertError.message);

    // Notificar a los admins activos
    const { data: admins } = await adminClient
      .from('users')
      .select('email')
      .is('deleted_at', null)
      .eq('tipo', 'admin')
      .eq('activo', true);

    if (admins && admins.length > 0) {
      await sendReportNotificationEmail(admins[0].email as string, 'nuevo', data.reason);
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el reporte';
    console.error('Error al enviar reporte:', error);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getPendingReports
// Solo admins. Devuelve los reportes con status 'pendiente'.
// ---------------------------------------------------------------------------
export async function getPendingReports() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'No autenticado', data: null };

  try {
    await assertAdmin(user.id);
  } catch {
    return { success: false, error: 'Acceso denegado', data: null };
  }

  const adminClient = createUntypedAdminClient();

  const { data, error } = await adminClient
    .from('profile_reports')
    .select('*, reporter:users!reporter_id(nombre, email), reported:users!reported_user_id(nombre, email)')
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message, data: null };

  return { success: true, data: data as ProfileReport[] };
}

// ---------------------------------------------------------------------------
// updateReportStatus
// Solo admins. Cambia el estado de un reporte y notifica si se resuelve.
// ---------------------------------------------------------------------------
export async function updateReportStatus(
  report_id: string,
  newStatus: 'en_revision' | 'resuelto' | 'desestimado'
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'No autenticado' };

  try {
    await assertAdmin(user.id);
  } catch {
    return { success: false, error: 'Acceso denegado' };
  }

  const adminClient = createUntypedAdminClient();

  try {
    // Obtener datos del reporte antes de actualizar
    const { data: report, error: fetchError } = await adminClient
      .from('profile_reports')
      .select('id, reason, reported:users!reported_user_id(email)')
      .eq('id', report_id)
      .single();

    if (fetchError || !report) {
      throw new Error(fetchError?.message ?? 'Reporte no encontrado');
    }

    // Actualizar el estado
    const { error: updateError } = await adminClient
      .from('profile_reports')
      .update({ status: newStatus })
      .eq('id', report_id);

    if (updateError) throw new Error(updateError.message);

    // Notificar al usuario afectado si el reporte fue resuelto
    if (newStatus === 'resuelto') {
      const reported = Array.isArray(report.reported) ? report.reported[0] : report.reported;
      if (reported?.email) {
        await sendReportNotificationEmail(
          reported.email as string,
          'resuelto',
          report.reason as string
        );
      }
    }

    revalidatePath('/admin/reportes');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el reporte';
    console.error('Error al actualizar reporte:', error);
    return { success: false, error: message };
  }
}
