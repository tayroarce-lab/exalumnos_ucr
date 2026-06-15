'use server';

import { createClient } from '@/lib/supabase/server';
import { DonationAdminView, DonationsHistoryFilters } from '@/types/donations';
import { sendDonationConfirmationEmails, sendDonationRejectionEmail } from '@/services/email-service';
import { notificarNuevaDonacionAdmin } from '@/lib/email';

export interface CrearDonacionInput {
  proyecto_destino: string;
  monto: number;
  moneda: 'CRC' | 'USD';
  metodo_pago: 'SINPE' | 'Transferencia';
  fecha_transferencia: string;
  numero_referencia: string;
  comprobante_url: string;
  mensaje_estudiante?: string;
}

/**
 * Obtiene las donaciones pendientes, ordenadas de más antigua a más reciente.
 * Fetches pending donations ordered by oldest to newest.
 */
export async function getPendingDonations(): Promise<{ data: DonationAdminView[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('donaciones')
    .select(`
      *,
      donor:users!donaciones_exalumno_id_fkey(nombre),
      student:users!donaciones_proyecto_estudiante_id_fkey(nombre)
    `).is('deleted_at', null)
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true }); // Cola FIFO (oldest first)

  if (error) {
    console.error('Error fetching pending donations:', error);
    return { data: null, error: error.message };
  }

  const formattedData: DonationAdminView[] = (data || []).map((d: any) => ({
    ...d,
    donor_name: Array.isArray(d.donor) ? d.donor[0]?.nombre || 'Unknown' : d.donor?.nombre || 'Unknown',
    admin_name: Array.isArray(d.donor) ? d.donor[0]?.nombre || null : d.donor?.nombre || null,
    student_name: Array.isArray(d.student) ? d.student[0]?.nombre || 'Unknown' : d.student?.nombre || 'Unknown',
  }));

  return { data: formattedData, error: null };
}

/**
 * Obtiene el historial de donaciones procesadas (confirmadas o rechazadas).
 * Fetches the history of processed donations.
 */
export async function getDonationsHistory(filters?: DonationsHistoryFilters): Promise<{ data: DonationAdminView[] | null; error: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from('donaciones')
    .select(`
      *,
      donor:users!donaciones_exalumno_id_fkey(nombre),
      student:users!donaciones_proyecto_estudiante_id_fkey(nombre),
      admin:users!donaciones_confirmado_por_fkey(nombre)
    `).is('deleted_at', null)
    .neq('estado', 'pendiente')
    .order('updated_at', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('updated_at', filters.startDate);
  }
  
  if (filters?.endDate) {
    // Añadir 23:59:59 a la fecha fin si es necesario, pero asumimos YYYY-MM-DD
    query = query.lte('updated_at', filters.endDate + 'T23:59:59.999Z');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching donations history:', error);
    return { data: null, error: error.message };
  }

  const formattedData: DonationAdminView[] = (data || []).map((d: any) => ({
    ...d,
    donor_name: Array.isArray(d.donor) ? d.donor[0]?.nombre || 'Unknown' : d.donor?.nombre || 'Unknown',
    student_name: Array.isArray(d.student) ? d.student[0]?.nombre || 'Unknown' : d.student?.nombre || 'Unknown',
    admin_name: Array.isArray(d.admin) ? d.admin[0]?.nombre || 'Unknown' : d.admin?.nombre || null,
  }));

  return { data: formattedData, error: null };
}

/**
 * Procesa una donación, actualiza la BD y envía los correos respectivos.
 * Processes a donation, updates the DB and sends corresponding emails.
 */
export async function processDonation(
  donationId: string,
  action: 'confirm' | 'reject',
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Obtener el usuario administrador actual / Get current admin user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: 'Unauthorized: User not found' };
  }

  const adminId = user.id;
  const newState = action === 'confirm' ? 'confirmada' : 'rechazada';

  // 2. Obtener datos de la donación para el correo / Get donation data for emails
  const { data: donation, error: fetchError } = await supabase
    .from('donaciones')
    .select(`
      *,
      donor:users!donaciones_exalumno_id_fkey(email),
      student:users!donaciones_proyecto_estudiante_id_fkey(email)
    `).is('deleted_at', null)
    .eq('id', donationId)
    .single();

  if (fetchError || !donation) {
    return { success: false, error: 'Donation not found' };
  }

  // 3. Actualizar la base de datos / Update DB
  const { error: updateError } = await supabase
    .from('donaciones')
    .update({
      estado: newState,
      confirmado_por: adminId,
      motivo_rechazo: action === 'reject' ? rejectionReason : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', donationId);

  if (updateError) {
    console.error('Error updating donation:', updateError);
    return { success: false, error: updateError.message };
  }

  // Extraer emails y nombres de donante y estudiante para los correos
  const donorEmail = Array.isArray(donation.donor) ? donation.donor[0]?.email : donation.donor?.email;
  const donorName  = Array.isArray(donation.donor) ? donation.donor[0]?.nombre : donation.donor?.nombre || 'Estimado/a';
  const studentEmail = Array.isArray(donation.student) ? donation.student[0]?.email : donation.student?.email;
  const studentName  = Array.isArray(donation.student) ? donation.student[0]?.nombre : donation.student?.nombre || 'Estudiante';

  if (action === 'confirm' && donorEmail && studentEmail) {
    await sendDonationConfirmationEmails(
      donorEmail, donorName,
      studentEmail, studentName,
      donation.monto, donation.moneda
    );
  } else if (action === 'reject' && donorEmail && rejectionReason) {
    await sendDonationRejectionEmail(donorEmail, donorName, rejectionReason);
  }

  return { success: true };
}

export async function crearDonacion(data: CrearDonacionInput) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('es_exalumno')
    .eq('id', user.id)
    .single();

  if (!profile?.es_exalumno) {
    throw new Error('Solo los exalumnos pueden registrar donaciones');
  }

  try {
    const { error } = await supabase.from('donaciones').insert({
      exalumno_id: user.id,
      proyecto_estudiante_id: data.proyecto_destino,
      monto: data.monto,
      moneda: data.moneda,
      metodo_pago: data.metodo_pago,
      fecha_transferencia: data.fecha_transferencia,
      numero_referencia: data.numero_referencia,
      comprobante_url: data.comprobante_url,
      mensaje_estudiante: data.mensaje_estudiante,
      estado: 'pendiente',
    });
    
    if (error) throw error;

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fundacionucr.org';
    await notificarNuevaDonacionAdmin(ADMIN_EMAIL, data.monto, data.moneda, data.proyecto_destino, data.metodo_pago);

    return { success: true };
  } catch (error: any) {
    console.error('Error al crear donación:', error);
    throw new Error(error.message || 'Error al registrar la donación');
  }
}

export async function obtenerMisDonaciones() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  try {
    const { data, error } = await supabase
      .from('donaciones')
      .select('*')
      .eq('exalumno_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener donaciones:', error);
    throw new Error(error.message || 'Error al obtener el historial de donaciones');
  }
}
