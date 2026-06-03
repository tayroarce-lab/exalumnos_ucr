import { SupabaseClient } from '@supabase/supabase-js';
import * as donacionesRepo from '@/repositories/donaciones.repository';
import { notificarDonacionAprobada } from '@/lib/email';
import { CrearDonacionInput } from '@/actions/donaciones';
import { fetchUserRole } from '@/repositories/admin.repository';

export async function processNewDonation(client: SupabaseClient, userId: string, data: CrearDonacionInput) {
  const role = await donacionesRepo.fetchUserRole(client, userId);
  if (role !== 'exalumno') {
    throw new Error('Solo los exalumnos pueden registrar donaciones');
  }

  await donacionesRepo.insertDonation(client, userId, data);
  return { success: true };
}

export async function getDonationsList(client: SupabaseClient) {
  const data = await donacionesRepo.fetchMyDonations(client);
  return data;
}

export async function resolveDonationStatus(
  adminId: string, 
  donacionId: string, 
  estado: 'confirmada' | 'rechazada', 
  motivoRechazo?: string
) {
  const role = await fetchUserRole(adminId);
  if (role !== 'admin') {
    throw new Error('Solo los administradores pueden confirmar o rechazar donaciones');
  }

  await donacionesRepo.updateDonationStatus(donacionId, adminId, estado, motivoRechazo);

  if (estado === 'confirmada') {
    const donacionRecord = await donacionesRepo.fetchDonationStudentDetails(donacionId);
    if (donacionRecord && donacionRecord.estudiante) {
      const estudianteData = Array.isArray(donacionRecord.estudiante) 
        ? donacionRecord.estudiante[0] 
        : donacionRecord.estudiante;
        
      if (estudianteData && estudianteData.email && estudianteData.nombre) {
        await notificarDonacionAprobada(
          estudianteData.email,
          estudianteData.nombre,
          donacionRecord.monto,
          donacionRecord.moneda
        );
      }
    }
  }

  return { success: true };
}
