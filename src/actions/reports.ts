'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { sendReportNotificationEmail } from '@/services/email-service';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// Tipos manuales — reportes_perfil y user_bans no están en database.types.ts.
// Actualizar ejecutando: supabase gen types typescript --project-id <id>
// ---------------------------------------------------------------------------

export type ReportMotivo = 'Spam' | 'Perfil Falso' | 'Comportamiento Inapropiado' | 'Otro';

export interface SubmitReportInput {
  perfil_reportado: string;
  motivo: ReportMotivo;
  descripcion?: string;
}

export interface ReportePerfil {
  id: string;
  reportado_por: string;
  perfil_reportado: string;
  motivo: string;
  descripcion: string | null;
  resuelto: boolean;
  created_at: string;
  denunciante?: { nombre: string; email: string } | null;
  reportado?: { nombre: string; email: string; reportes_recibidos: number } | null;
}

export interface BanInput {
  user_id: string;
  reason: string;
  expires_at?: string | null; // ISO string, null = permanente
}

export interface UserBan {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  expires_at: string | null;
  lifted_at: string | null;
  lifted_by: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Constantes de validación
// ---------------------------------------------------------------------------

/** Motivos permitidos en el sistema — debe coincidir con el enum de la BD. */
const MOTIVOS_VALIDOS = new Set<ReportMotivo>([
  'Spam',
  'Perfil Falso',
  'Comportamiento Inapropiado',
  'Otro',
]);

const DESCRIPCION_MAX_CHARS = 1000;
const REASON_MIN_CHARS = 10;
const REASON_MAX_CHARS = 500;

/** Expresión regular para UUID v4. */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Helpers de validación
// ---------------------------------------------------------------------------

/** Devuelve true si el string tiene formato UUID v4 válido. */
function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/** Lanza un error descriptivo si el UUID no es válido. */
function assertValidUUID(value: string, campo: string): void {
  if (!isValidUUID(value)) {
    throw new Error(`El campo "${campo}" no tiene un formato UUID válido.`);
  }
}

// ---------------------------------------------------------------------------
// Helper: cliente sin genérico Database para tablas fuera del schema tipado
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

// ===========================================================================
// REPORTES DE PERFIL (tabla: reportes_perfil)
// ===========================================================================

/**
 * Crea un nuevo reporte contra un perfil.
 *
 * Validaciones:
 *   - Usuario autenticado
 *   - No puede reportarse a sí mismo
 *   - perfil_reportado debe ser un UUID válido
 *   - motivo debe ser uno de los valores permitidos
 *   - descripcion no puede superar los 1 000 caracteres
 *   - El perfil reportado debe existir y no estar eliminado
 *   - Un usuario no puede reportar el mismo perfil más de una vez
 *
 * Si el trigger de BD activa la suspensión automática (>= 3 reportes),
 * notifica a los administradores por correo.
 */
export async function submitProfileReport(data: SubmitReportInput) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'No autenticado' };
  }

  // --- Validación: UUID del perfil reportado ---
  if (!data.perfil_reportado || !isValidUUID(data.perfil_reportado)) {
    return { success: false, error: 'El perfil reportado no es válido.' };
  }

  // --- Validación: no reportarse a sí mismo ---
  if (user.id === data.perfil_reportado) {
    return { success: false, error: 'No puedes reportar tu propio perfil.' };
  }

  // --- Validación: motivo permitido ---
  if (!data.motivo || !MOTIVOS_VALIDOS.has(data.motivo)) {
    return {
      success: false,
      error: `Motivo inválido. Opciones permitidas: ${[...MOTIVOS_VALIDOS].join(', ')}.`,
    };
  }

  // --- Validación: longitud de descripción ---
  if (data.descripcion && data.descripcion.trim().length > DESCRIPCION_MAX_CHARS) {
    return {
      success: false,
      error: `La descripción no puede superar los ${DESCRIPCION_MAX_CHARS} caracteres.`,
    };
  }

  const adminClient = createUntypedAdminClient();

  try {
    // --- Validación: el perfil reportado debe existir y no estar eliminado ---
    const { data: perfilObjetivo, error: perfilError } = await adminClient
      .from('users')
      .select('id')
      .is('deleted_at', null)
      .eq('id', data.perfil_reportado)
      .maybeSingle();

    if (perfilError) throw new Error(perfilError.message);

    if (!perfilObjetivo) {
      return { success: false, error: 'El perfil que intentas reportar no existe o fue eliminado.' };
    }

    // --- Validación: el usuario no puede reportar el mismo perfil dos veces ---
    const { data: reporteDuplicado, error: duplicadoError } = await adminClient
      .from('reportes_perfil')
      .select('id')
      .eq('reportado_por', user.id)
      .eq('perfil_reportado', data.perfil_reportado)
      .maybeSingle();

    if (duplicadoError) throw new Error(duplicadoError.message);

    if (reporteDuplicado) {
      return { success: false, error: 'Ya has reportado este perfil anteriormente.' };
    }

    // Insertar en reportes_perfil (trigger de BD maneja el contador y suspensión)
    const { error: insertError } = await adminClient.from('reportes_perfil').insert({
      reportado_por: user.id,
      perfil_reportado: data.perfil_reportado,
      motivo: data.motivo,
      descripcion: data.descripcion?.trim() ?? null,
      resuelto: false,
    });

    if (insertError) throw new Error(insertError.message);

    // Verificar si el trigger suspendió automáticamente al usuario (>= 3 reportes)
    const { data: usuarioReportado } = await adminClient
      .from('users')
      .select('email, reportes_recibidos, activo')
      .is('deleted_at', null)
      .eq('id', data.perfil_reportado)
      .single();

    if (
      usuarioReportado &&
      usuarioReportado.reportes_recibidos >= 3 &&
      usuarioReportado.activo === false
    ) {
      // Notificar a los admins activos de la suspensión automática
      const { data: admins } = await adminClient
        .from('users')
        .select('email')
        .is('deleted_at', null)
        .eq('tipo', 'admin')
        .eq('activo', true);

      if (admins && admins.length > 0) {
        await sendReportNotificationEmail(admins[0].email as string, 'nuevo', data.motivo);
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el reporte';
    console.error('Error al enviar reporte:', error);
    return { success: false, error: message };
  }
}

/**
 * Devuelve todos los reportes pendientes (resuelto = false).
 * Solo accesible por administradores.
 */
export async function getPendingReports() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'No autenticado', data: null };

  try {
    await assertAdmin(user.id);
  } catch {
    return { success: false, error: 'Acceso denegado', data: null };
  }

  const adminClient = createUntypedAdminClient();
  const { data, error } = await adminClient
    .from('reportes_perfil')
    .select(`
      *,
      denunciante:users!reportes_perfil_reportado_por_fkey(nombre, email),
      reportado:users!reportes_perfil_perfil_reportado_fkey(nombre, email, reportes_recibidos)
    `)
    .eq('resuelto', false)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message, data: null };

  return { success: true, data: data as ReportePerfil[] };
}

/**
 * Marca un reporte como resuelto.
 * Solo accesible por administradores.
 *
 * Validaciones:
 *   - reporte_id debe ser un UUID válido
 */
export async function resolveReport(reporte_id: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'No autenticado' };

  // --- Validación: UUID ---
  if (!reporte_id || !isValidUUID(reporte_id)) {
    return { success: false, error: 'El ID del reporte no es válido.' };
  }

  try {
    await assertAdmin(user.id);
  } catch {
    return { success: false, error: 'Acceso denegado' };
  }

  const adminClient = createUntypedAdminClient();

  try {
    const { error } = await adminClient
      .from('reportes_perfil')
      .update({ resuelto: true })
      .eq('id', reporte_id);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/reportes');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al resolver el reporte';
    console.error('Error al resolver reporte:', error);
    return { success: false, error: message };
  }
}

// ===========================================================================
// BANEOS MANUALES (tabla: user_bans)
// ===========================================================================

/**
 * Aplica un baneo manual a un usuario.
 * Además pone activo = false en users.
 * Solo accesible por administradores.
 *
 * Validaciones:
 *   - user_id debe ser un UUID válido
 *   - El admin no puede banearse a sí mismo
 *   - No se puede banear a otro administrador
 *   - reason debe tener entre 10 y 500 caracteres
 *   - expires_at, si se proporciona, debe ser una fecha futura
 */
export async function banUser(data: BanInput) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'No autenticado' };

  // --- Validación: UUID ---
  if (!data.user_id || !isValidUUID(data.user_id)) {
    return { success: false, error: 'El ID de usuario no es válido.' };
  }

  // --- Validación: no auto-baneo ---
  if (user.id === data.user_id) {
    return { success: false, error: 'No puedes banearte a ti mismo.' };
  }

  // --- Validación: razón del baneo ---
  const reasonTrimmed = data.reason?.trim() ?? '';
  if (reasonTrimmed.length < REASON_MIN_CHARS) {
    return {
      success: false,
      error: `La razón del baneo debe tener al menos ${REASON_MIN_CHARS} caracteres.`,
    };
  }
  if (reasonTrimmed.length > REASON_MAX_CHARS) {
    return {
      success: false,
      error: `La razón del baneo no puede superar los ${REASON_MAX_CHARS} caracteres.`,
    };
  }

  // --- Validación: expires_at debe ser fecha futura ---
  if (data.expires_at) {
    const expDate = new Date(data.expires_at);
    if (isNaN(expDate.getTime())) {
      return { success: false, error: 'La fecha de expiración no tiene un formato válido.' };
    }
    if (expDate <= new Date()) {
      return { success: false, error: 'La fecha de expiración debe ser una fecha futura.' };
    }
  }

  try {
    await assertAdmin(user.id);
  } catch {
    return { success: false, error: 'Acceso denegado' };
  }

  const adminClient = createUntypedAdminClient();

  try {
    // --- Validación: no se puede banear a otro admin ---
    const { data: objetivoProfile } = await adminClient
      .from('users')
      .select('tipo')
      .is('deleted_at', null)
      .eq('id', data.user_id)
      .maybeSingle();

    if (!objetivoProfile) {
      return { success: false, error: 'El usuario que intentas banear no existe.' };
    }

    if (objetivoProfile.tipo === 'admin') {
      return { success: false, error: 'No se puede banear a un administrador.' };
    }

    // Insertar registro de baneo
    const { error: banError } = await adminClient.from('user_bans').insert({
      user_id: data.user_id,
      banned_by: user.id,
      reason: reasonTrimmed,
      expires_at: data.expires_at ?? null,
    });

    if (banError) throw new Error(banError.message);

    // Marcar usuario como inactivo en la tabla users
    const { error: updateError } = await adminClient
      .from('users')
      .update({ activo: false })
      .eq('id', data.user_id);

    if (updateError) throw new Error(updateError.message);

    // Notificar al usuario baneado
    const { data: bannedUser } = await adminClient
      .from('users')
      .select('email')
      .eq('id', data.user_id)
      .single();

    if (bannedUser?.email) {
      await sendReportNotificationEmail(bannedUser.email as string, 'resuelto', reasonTrimmed);
    }

    revalidatePath('/admin/reportes');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al aplicar el baneo';
    console.error('Error al banear usuario:', error);
    return { success: false, error: message };
  }
}

/**
 * Levanta el baneo activo de un usuario y lo reactiva.
 * Solo accesible por administradores.
 *
 * Validaciones:
 *   - ban_id y user_id deben ser UUIDs válidos
 */
export async function liftBan(ban_id: string, user_id: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'No autenticado' };

  // --- Validación: UUIDs ---
  if (!ban_id || !isValidUUID(ban_id)) {
    return { success: false, error: 'El ID del baneo no es válido.' };
  }
  if (!user_id || !isValidUUID(user_id)) {
    return { success: false, error: 'El ID de usuario no es válido.' };
  }

  try {
    await assertAdmin(user.id);
  } catch {
    return { success: false, error: 'Acceso denegado' };
  }

  const adminClient = createUntypedAdminClient();

  try {
    // Marcar el baneo como levantado
    const { error: liftError } = await adminClient
      .from('user_bans')
      .update({ lifted_at: new Date().toISOString(), lifted_by: user.id })
      .eq('id', ban_id);

    if (liftError) throw new Error(liftError.message);

    // Reactivar al usuario solo si no tiene otros baneos activos
    const { data: activeBans } = await adminClient
      .from('user_bans')
      .select('id')
      .eq('user_id', user_id)
      .is('lifted_at', null);

    if (!activeBans || activeBans.length === 0) {
      const { error: updateError } = await adminClient
        .from('users')
        .update({ activo: true })
        .eq('id', user_id);

      if (updateError) throw new Error(updateError.message);
    }

    revalidatePath('/admin/reportes');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al levantar el baneo';
    console.error('Error al levantar baneo:', error);
    return { success: false, error: message };
  }
}

/**
 * Devuelve el historial de baneos de un usuario específico.
 * Solo accesible por administradores.
 *
 * Validaciones:
 *   - user_id debe ser un UUID válido
 */
export async function getUserBanHistory(user_id: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'No autenticado', data: null };

  // --- Validación: UUID ---
  if (!user_id || !isValidUUID(user_id)) {
    return { success: false, error: 'El ID de usuario no es válido.', data: null };
  }

  try {
    await assertAdmin(user.id);
  } catch {
    return { success: false, error: 'Acceso denegado', data: null };
  }

  const adminClient = createUntypedAdminClient();
  const { data, error } = await adminClient
    .from('user_bans')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message, data: null };

  return { success: true, data: data as UserBan[] };
}
