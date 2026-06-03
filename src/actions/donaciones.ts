'use server';

import { createClient } from '@/lib/supabase/server';
import { processNewDonation, getDonationsList, resolveDonationStatus } from '@/services/donaciones.service';

export interface CrearDonacionInput {
  proyecto_estudiante_id: string;
  monto: number;
  moneda: 'CRC' | 'USD';
  metodo_pago: 'sinpe' | 'transferencia_bancaria';
  fecha_transferencia: string;
  numero_referencia: string;
  comprobante_url: string;
  mensaje_estudiante?: string;
}

export async function crearDonacion(data: CrearDonacionInput) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  try {
    await processNewDonation(supabase, user.id, data);
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
    const data = await getDonationsList(supabase);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener donaciones:', error);
    throw new Error(error.message || 'Error al obtener el historial de donaciones');
  }
}

export async function actualizarEstadoDonacion(donacion_id: string, estado: 'confirmada' | 'rechazada', motivo_rechazo?: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  try {
    await resolveDonationStatus(user.id, donacion_id, estado, motivo_rechazo);
    return { success: true };
  } catch (error: any) {
    console.error('Error al actualizar donación:', error);
    throw new Error(error.message || 'Error al actualizar el estado de la donación');
  }
}
