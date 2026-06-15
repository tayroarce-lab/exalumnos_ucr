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

const FONDOS_MAP: Record<string, string> = {
  '1': 'Becas de Excelencia Alumni UCR',
  '2': 'Fondo de Emergencia Estudiantil',
  'general': 'Fondo General'
};

async function enrichDonationsWithUsers(supabase: any, donations: any[]): Promise<DonationAdminView[]> {
  if (!donations || donations.length === 0) return [];
  
  const userIds = [...new Set(donations.map(d => d.alumni_id))];
  let usersMap: Record<string, { nombre: string, email: string }> = {};
  
  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from('users')
      .select('id, nombre, email')
      .in('id', userIds);
      
    if (usersData) {
      usersMap = usersData.reduce((acc: any, u: any) => {
        acc[u.id] = { nombre: u.nombre, email: u.email };
        return acc;
      }, {});
    }
  }

  return donations.map(d => {
    const user = usersMap[d.alumni_id] || { nombre: 'Desconocido', email: '' };
    
    // Resolve project name
    const projectName = FONDOS_MAP[d.proyecto_destino] || d.proyecto_destino || 'Desconocido';
    
    return {
      ...d,
      donor_name: user.nombre,
      student_name: projectName,
      admin_name: null // We don't track who confirmed in the new schema
    };
  });
}

export async function getPendingDonations(): Promise<{ data: DonationAdminView[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('donaciones')
    .select('*')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true }); 

  if (error) {
    console.error('Error fetching pending donations:', error);
    return { data: null, error: error.message };
  }

  const formattedData = await enrichDonationsWithUsers(supabase, data || []);
  return { data: formattedData, error: null };
}

export async function getDonationsHistory(filters?: DonationsHistoryFilters): Promise<{ data: DonationAdminView[] | null; error: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from('donaciones')
    .select('*')
    .neq('estado', 'pendiente')
    .order('updated_at', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('updated_at', filters.startDate);
  }
  
  if (filters?.endDate) {
    query = query.lte('updated_at', filters.endDate + 'T23:59:59.999Z');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching donations history:', error);
    return { data: null, error: error.message };
  }

  const formattedData = await enrichDonationsWithUsers(supabase, data || []);
  return { data: formattedData, error: null };
}

export async function processDonation(
  donationId: string,
  action: 'confirm' | 'reject',
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: 'Unauthorized: User not found' };
  }

  const newState = action === 'confirm' ? 'confirmada' : 'rechazada';

  const { data: donation, error: fetchError } = await supabase
    .from('donaciones')
    .select('*')
    .eq('id', donationId)
    .single();

  if (fetchError || !donation) {
    return { success: false, error: 'Donation not found' };
  }

  const { error: updateError } = await supabase
    .from('donaciones')
    .update({
      estado: newState,
      admin_notes: action === 'reject' ? rejectionReason : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', donationId);

  if (updateError) {
    console.error('Error updating donation:', updateError);
    return { success: false, error: updateError.message };
  }

  // Get donor info
  const { data: donor } = await supabase
    .from('users')
    .select('nombre, email')
    .eq('id', donation.alumni_id)
    .single();

  const donorEmail = donor?.email;
  const donorName  = donor?.nombre || 'Estimado/a';
  
  // Resolve project name for email
  const projectName = FONDOS_MAP[donation.proyecto_destino] || donation.proyecto_destino;

  if (action === 'confirm' && donorEmail) {
    // Send email to donor and "student" (project)
    await sendDonationConfirmationEmails(
      donorEmail, donorName,
      donation.monto, donation.moneda,
      process.env.ADMIN_EMAIL || 'admin@fundacionucr.org', projectName // No specific student email for general funds
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

  try {
    const { error } = await supabase.from('donaciones').insert({
      alumni_id: user.id,
      proyecto_destino: data.proyecto_destino,
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
    const projectName = FONDOS_MAP[data.proyecto_destino] || data.proyecto_destino;
    await notificarNuevaDonacionAdmin(ADMIN_EMAIL, data.monto, data.moneda, projectName, data.metodo_pago);

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
      .eq('alumni_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Enrich with names
    const formattedData = await enrichDonationsWithUsers(supabase, data || []);

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Error al obtener donaciones:', error);
    throw new Error(error.message || 'Error al obtener el historial de donaciones');
  }
}
