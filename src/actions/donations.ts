'use server';

import { createClient } from '@/lib/supabase/server';
import { DonationAdminView, DonationsHistoryFilters } from '@/types/donations';
import { sendDonationConfirmationEmails, sendDonationRejectionEmail, sendDonationVerificationEmail } from '@/services/email-service';
import { notificarNuevaDonacionAdmin } from '@/lib/email';
import { createAdminClient } from '@/lib/supabase/admin';

export interface CrearDonacionInput {
  proyecto_destino: string;
  monto: number;
  moneda: 'CRC' | 'USD';
  metodo_pago: 'SINPE' | 'Transferencia';
  fecha_transferencia: string;
  numero_referencia: string;
  comprobante_url: string;
  mensaje_estudiante?: string;
  /** ID del estudiante si la donación es para un proyecto específico */
  estudiante_id?: string;
}

// Tabla real en la BD: public.donations (con columna user_id)
// Las migraciones de renombre a "donaciones/alumni_id" AÚN NO se han aplicado al remoto.
const DB_TABLE = 'donations' as const;

const FONDOS_MAP: Record<string, string> = {
  '1': 'Becas de Excelencia Alumni UCR',
  '2': 'Fondo de Emergencia Estudiantil',
  'general': 'Fondo General'
};

async function enrichDonationsWithUsers(supabase: any, donations: any[]): Promise<DonationAdminView[]> {
  if (!donations || donations.length === 0) return [];
  
  const userIds = [...new Set(donations.map(d => d.user_id).filter(Boolean))];
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
    const user = usersMap[d.user_id] || { nombre: 'Desconocido', email: '' };
    // Resolve project name (fondo_destino or proyecto_id)
    const projectKey = d.fondo_destino || (d.fondo_general ? 'general' : d.proyecto_id) || 'general';
    const projectName = FONDOS_MAP[projectKey] || projectKey;
    
    return {
      ...d,
      // Normalize to the interface fields expected by the UI
      alumni_id: d.user_id,
      proyecto_destino: projectName,
      donor_name: user.nombre,
      student_name: projectName,
      admin_name: null
    };
  });
}

export async function getPendingDonations(): Promise<{ data: DonationAdminView[] | null; error: string | null }> {
  // Usamos adminClient para bypassear RLS (políticas tienen bug: usan `tipo` en vez de `rol`)
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from(DB_TABLE)
    .select('*')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending donations:', error);
    return { data: null, error: error.message };
  }

  const formattedData = await enrichDonationsWithUsers(adminClient, data || []);
  return { data: formattedData, error: null };
}

export async function getDonationsHistory(filters?: DonationsHistoryFilters): Promise<{ data: DonationAdminView[] | null; error: string | null }> {
  // Usamos adminClient para bypassear RLS (políticas tienen bug: usan `tipo` en vez de `rol`)
  const adminClient = createAdminClient();

  let query = adminClient
    .from(DB_TABLE)
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

  const formattedData = await enrichDonationsWithUsers(adminClient, data || []);
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

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('users').select('rol').eq('id', user.id).single();
  if (profile?.rol !== 'admin') {
    return { success: false, error: 'Unauthorized: Admins only' };
  }

  const newState = action === 'confirm' ? 'confirmada' : 'rechazada';

  const { data: donation, error: fetchError } = await adminClient
    .from(DB_TABLE)
    .select('*')
    .eq('id', donationId)
    .single();

  if (fetchError || !donation) {
    return { success: false, error: 'Donation not found' };
  }

  const { error: updateError } = await adminClient
    .from(DB_TABLE)
    .update({
      estado: newState,
      updated_at: new Date().toISOString()
    })
    .eq('id', donationId);

  if (updateError) {
    console.error('Error updating donation:', updateError);
    return { success: false, error: updateError.message };
  }

  // Get donor info
  const { data: donor } = await adminClient
    .from('users')
    .select('nombre, email')
    .eq('id', donation.user_id)
    .single();

  const donorEmail = donor?.email;
  const donorName  = donor?.nombre || 'Estimado/a';
  
  const projectKey = donation.fondo_destino || (donation.fondo_general ? 'general' : 'general');
  const projectName = FONDOS_MAP[projectKey] || projectKey;

  if (action === 'confirm' && donorEmail) {
    // Si es donación a un proyecto de estudiante, buscar su email también
    let studentEmail: string | null = null;
    let studentName: string | null = null;
    const targetStudentId = donation.proyecto_id || (donation.fondo_destino?.length > 10 ? donation.fondo_destino : null);
    
    if (targetStudentId) {
      const { data: studentData } = await supabase
        .from('users')
        .select('nombre, email')
        .eq('id', targetStudentId)
        .single();
      studentEmail = studentData?.email || null;
      studentName = studentData?.nombre || null;
    }

    await sendDonationConfirmationEmails(
      donorEmail, donorName,
      donation.monto, donation.moneda,
      studentEmail, studentName
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

  // Verificar que sea exalumno usando el cliente normal (lectura propia, no bloqueada por RLS)
  const { data: profile } = await supabase
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (!profile || profile.rol !== 'exalumno') {
    throw new Error('Solo los exalumnos pueden registrar donaciones');
  }

  try {
    const esProyectoEstudiante = Boolean(data.estudiante_id);
    const isFondoGeneral = !esProyectoEstudiante && (
      data.proyecto_destino === 'general' || data.proyecto_destino === '1' || data.proyecto_destino === '2'
    );

    // Usar el cliente admin para el INSERT y evitar el bloqueo de RLS en la tabla donations
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.from(DB_TABLE).insert({
      user_id: user.id,
      fondo_general: isFondoGeneral,
      fondo_destino: data.proyecto_destino,
      monto: data.monto,
      moneda: data.moneda,
      metodo_pago: data.metodo_pago,
      fecha_transferencia: data.fecha_transferencia,
      numero_referencia: data.numero_referencia,
      comprobante_url: data.comprobante_url,
      mensaje_estudiante: data.mensaje_estudiante,
      estado: 'pendiente',
      ...(esProyectoEstudiante && {
        proyecto_id: data.estudiante_id,
      }),
    });
    
    if (error) throw error;

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fundacionucr.org';
    const projectName = esProyectoEstudiante
      ? (data.proyecto_destino || 'Proyecto de estudiante')
      : (FONDOS_MAP[data.proyecto_destino] || data.proyecto_destino);
    
    // Notificar al admin
    await notificarNuevaDonacionAdmin(ADMIN_EMAIL, data.monto, data.moneda, projectName, data.metodo_pago);

    // Email de verificación al exalumno donante
    const { data: donorData } = await supabase
      .from('users')
      .select('nombre, email')
      .eq('id', user.id)
      .single();
    
    if (donorData?.email) {
      await sendDonationVerificationEmail(
        donorData.email,
        donorData.nombre || 'Estimado/a',
        data.monto,
        data.moneda,
        projectName
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error al crear donación:', error);
    throw new Error(error.message || 'Error al registrar la donación');
  }
}

export async function uploadComprobante(formData: FormData): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    
    if (!file || !userId) {
      return { success: false, error: 'Faltan datos para subir el comprobante' };
    }

    const supabaseAdmin = createAdminClient();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('comprobantes')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error en uploadComprobante admin:', uploadError);
      return { success: false, error: uploadError.message };
    }

    return { success: true, filePath };
  } catch (error: any) {
    console.error('Excepción en uploadComprobante:', error);
    return { success: false, error: error.message };
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
      .from(DB_TABLE)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedData = await enrichDonationsWithUsers(supabase, data || []);
    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Error al obtener donaciones:', error);
    throw new Error(error.message || 'Error al obtener el historial de donaciones');
  }
}
