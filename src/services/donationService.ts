import { createClient } from '@/lib/supabase/client';

// =============================================================================
// SERVICIO: donationService
// Descripción : Lógica de negocio para registro y obtención de donaciones.
// =============================================================================

export type EstadoDonacion = 'pendiente' | 'confirmada' | 'rechazada';

export interface DatosDonacion {
  proyecto_id?: string;
  fondo_general: boolean;
  monto: number;
  moneda: 'CRC' | 'USD';
  metodo_pago: 'SINPE' | 'Transferencia';
  fecha_transferencia: string;
  numero_referencia?: string;
  mensaje_estudiante?: string;
  comprobante: File;
}

export interface DonacionHistorial {
  id: string;
  monto: number;
  moneda: string;
  metodo_pago: string;
  fecha_transferencia: string;
  estado: EstadoDonacion;
  fondo_general: boolean;
  proyecto_id?: string;
  created_at: string;
}

export interface RespuestaServicio {
  exito: boolean;
  mensaje: string;
  datos?: unknown;
}

// [VERDE - FUNCION: crearDonacion]
// Registra una nueva donación, subiendo el archivo al bucket seguro
export async function crearDonacion(datos: DatosDonacion): Promise<RespuestaServicio> {
  const supabase = createClient();
  
  // 1. Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { exito: false, mensaje: 'Usuario no autenticado' };
  }

  // 2. Subir comprobante al bucket 'receipts' con path tracking del usuario
  const fileExt = datos.comprobante.name.split('.').pop();
  const filePath = `${user.id}/${Date.now()}_comprobante.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, datos.comprobante);

  if (uploadError) {
    return { exito: false, mensaje: `Error subiendo comprobante: ${uploadError.message}` };
  }

  // 3. Registrar en base de datos
  const { data, error: dbError } = await supabase
    .from('donations')
    .insert({
      user_id: user.id,
      proyecto_id: datos.fondo_general ? null : datos.proyecto_id,
      fondo_general: datos.fondo_general,
      monto: datos.monto,
      moneda: datos.moneda,
      metodo_pago: datos.metodo_pago,
      fecha_transferencia: datos.fecha_transferencia,
      numero_referencia: datos.numero_referencia,
      mensaje_estudiante: datos.mensaje_estudiante,
      comprobante_url: filePath,
      estado: 'pendiente'
    })
    .select()
    .single();

  if (dbError) {
    // Intento de rollback del archivo si falla DB
    await supabase.storage.from('receipts').remove([filePath]);
    return { exito: false, mensaje: `Error registrando donación: ${dbError.message}` };
  }

  // HOOK: Aquí se integraría la llamada a Edge Functions para notificar al Admin en < 5 mins
  // await triggerNotificacionAdmin(data.id);

  // HOOK: Aquí se programaría el cron job / Edge Function para alertar SLA 48h
  // await triggerAlertaSLA(data.id, 48);

  return { exito: true, mensaje: 'Donación registrada exitosamente', datos: data };
}

// [VERDE - FUNCION: obtenerHistorialDonaciones]
// Obtiene el historial de donaciones del exalumno ordenado por fecha
export async function obtenerHistorialDonaciones(): Promise<DonacionHistorial[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo historial:', error);
    return [];
  }

  return data as DonacionHistorial[];
}
