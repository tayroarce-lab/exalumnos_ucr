import { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { CrearDonacionInput } from '@/actions/donaciones';

export async function fetchUserRole(client: SupabaseClient, userId: string) {
  const { data: profile } = await client
    .from('users')
    .select('tipo')
    .eq('id', userId)
    .single();
  return profile?.tipo;
}

export async function insertDonation(client: SupabaseClient, userId: string, data: CrearDonacionInput) {
  const { error } = await client.from('donaciones').insert({
    exalumno_id: userId,
    proyecto_estudiante_id: data.proyecto_estudiante_id,
    monto: data.monto,
    moneda: data.moneda,
    metodo_pago: data.metodo_pago,
    fecha_transferencia: data.fecha_transferencia,
    numero_referencia: data.numero_referencia,
    comprobante_url: data.comprobante_url,
    mensaje_estudiante: data.mensaje_estudiante,
    estado: 'pendiente'
  });
  if (error) throw error;
}

export async function fetchMyDonations(client: SupabaseClient) {
  const { data, error } = await client
    .from('donaciones')
    .select(`
      *,
      exalumno:users!donaciones_exalumno_id_fkey(nombre, email, foto_url),
      estudiante:users!donaciones_proyecto_estudiante_id_fkey(nombre, email, foto_url)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateDonationStatus(
  donacionId: string, 
  adminId: string, 
  estado: 'confirmada' | 'rechazada', 
  motivoRechazo?: string
) {
  const adminClient = createAdminClient();
  const updateData: any = { 
    estado, 
    confirmado_por: adminId,
    updated_at: new Date().toISOString()
  };

  if (estado === 'rechazada' && motivoRechazo) {
    updateData.motivo_rechazo = motivoRechazo;
  } else if (estado === 'confirmada') {
    updateData.motivo_rechazo = null;
  }

  const { error } = await adminClient
    .from('donaciones')
    .update(updateData)
    .eq('id', donacionId);
  if (error) throw error;
}

export async function fetchDonationStudentDetails(donacionId: string) {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('donaciones')
    .select(`
      monto,
      moneda,
      estudiante:users!donaciones_proyecto_estudiante_id_fkey(nombre, email)
    `)
    .eq('id', donacionId)
    .single();
  return data;
}
