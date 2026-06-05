'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notificarDonacionAprobada } from '@/lib/email';

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

// ---------------------------------------------------------------------------
// crearDonacion
// Solo exalumnos pueden registrar donaciones (verificado contra la tabla users
// con el cliente autenticado del propio usuario — RLS garantiza el scope).
// ---------------------------------------------------------------------------
export async function crearDonacion(data: CrearDonacionInput) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  // Verificar rol con el cliente autenticado (RLS permite que cada usuario lea su propio perfil)
  const { data: profile } = await supabase
    .from('users')
    .select('tipo')
    .eq('id', user.id)
    .single();

  if (profile?.tipo !== 'exalumno') {
    throw new Error('Solo los exalumnos pueden registrar donaciones');
  }

  try {
    const { error } = await supabase.from('donaciones').insert({
      exalumno_id: user.id,
      proyecto_estudiante_id: data.proyecto_estudiante_id,
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
    return { success: true };
  } catch (error: any) {
    console.error('Error al crear donación:', error);
    throw new Error(error.message || 'Error al registrar la donación');
  }
}

// ---------------------------------------------------------------------------
// obtenerMisDonaciones
// El cliente autenticado + RLS limita automáticamente al scope del usuario.
// ---------------------------------------------------------------------------
export async function obtenerMisDonaciones() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  try {
    const { data, error } = await supabase
      .from('donaciones')
      .select(
        `*,
        exalumno:users!donaciones_exalumno_id_fkey(nombre, email, foto_url),
        estudiante:users!donaciones_proyecto_estudiante_id_fkey(nombre, email, foto_url)`,
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener donaciones:', error);
    throw new Error(error.message || 'Error al obtener el historial de donaciones');
  }
}

// ---------------------------------------------------------------------------
// actualizarEstadoDonacion
// Requiere adminClient para escribir el campo confirmado_por y cambiar estado
// (operación privilegiada que solo ejecuta un admin con Service Role).
// ---------------------------------------------------------------------------
export async function actualizarEstadoDonacion(
  donacion_id: string,
  estado: 'confirmada' | 'rechazada',
  motivo_rechazo?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  const adminClient = createAdminClient();

  // Verificar que quien actualiza es admin
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .eq('id', user.id)
    .single();

  if (profile?.tipo !== 'admin') {
    throw new Error('Solo los administradores pueden confirmar o rechazar donaciones');
  }

  try {
    const updateData: {
      estado: 'confirmada' | 'rechazada';
      confirmado_por: string;
      updated_at: string;
      motivo_rechazo?: string | null;
    } = {
      estado,
      confirmado_por: user.id,
      updated_at: new Date().toISOString(),
    };

    if (estado === 'rechazada' && motivo_rechazo) {
      updateData.motivo_rechazo = motivo_rechazo;
    } else if (estado === 'confirmada') {
      updateData.motivo_rechazo = null;
    }

    const { error } = await adminClient
      .from('donaciones')
      .update(updateData)
      .eq('id', donacion_id);

    if (error) throw error;

    // Notificar al estudiante si se confirmó
    if (estado === 'confirmada') {
      const { data: donacionRecord } = await adminClient
        .from('donaciones')
        .select(
          `monto, moneda,
          estudiante:users!donaciones_proyecto_estudiante_id_fkey(nombre, email)`,
        )
        .eq('id', donacion_id)
        .single();

      if (donacionRecord && donacionRecord.estudiante) {
        const estudianteData = Array.isArray(donacionRecord.estudiante)
          ? donacionRecord.estudiante[0]
          : donacionRecord.estudiante;

        if (estudianteData?.email && estudianteData?.nombre) {
          await notificarDonacionAprobada(
            estudianteData.email,
            estudianteData.nombre,
            donacionRecord.monto,
            donacionRecord.moneda,
          );
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error al actualizar donación:', error);
    throw new Error(error.message || 'Error al actualizar el estado de la donación');
  }
}
