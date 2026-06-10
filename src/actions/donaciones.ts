'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

export async function crearDonacion(data: CrearDonacionInput) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  // Verificar que es exalumno
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

    // Notificar al admin (idealmente desde variable de entorno, acá hardcodeado para demo)
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
      .eq('alumni_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener donaciones:', error);
    throw new Error(error.message || 'Error al obtener el historial de donaciones');
  }
}
