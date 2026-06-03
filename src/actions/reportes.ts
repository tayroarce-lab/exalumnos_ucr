'use server';

import { createClient } from '@/lib/supabase/server';
import { processNewReport, getPendingReportsList, resolveReport } from '@/services/reportes.service';

export interface CrearReporteInput {
  perfil_reportado: string;
  motivo: string;
  descripcion?: string;
}

export async function crearReporte(data: CrearReporteInput) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  try {
    await processNewReport(user.id, data.perfil_reportado, data.motivo, data.descripcion);
    return { success: true };
  } catch (error: any) {
    console.error('Error al crear reporte:', error);
    throw new Error(error.message || 'Error al registrar el reporte');
  }
}

export async function obtenerReportesPendientes() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  try {
    const data = await getPendingReportsList(user.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    throw new Error(error.message || 'Error al obtener la lista de reportes pendientes');
  }
}

export async function resolverReporte(reporte_id: string) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  try {
    await resolveReport(user.id, reporte_id);
    return { success: true };
  } catch (error: any) {
    console.error('Error al resolver reporte:', error);
    throw new Error(error.message || 'Error al actualizar el estado del reporte');
  }
}
