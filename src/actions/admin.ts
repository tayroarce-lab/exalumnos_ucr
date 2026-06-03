'use server';

import { createClient } from '@/lib/supabase/server';
import { fetchUserRole } from '@/repositories/admin.repository';
import { calculateDashboardMetrics } from '@/services/admin.service';

export async function getDashboardMetrics() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('No autenticado');
    }

    // Validar permisos de administrador a través del repositorio
    const userRole = await fetchUserRole(user.id);
    if (userRole !== 'admin') {
      throw new Error('Solo los administradores pueden ver el dashboard');
    }

    // Calcular métricas mediante el servicio
    const metrics = await calculateDashboardMetrics();

    return {
      success: true,
      data: metrics
    };
  } catch (error: any) {
    console.error('Error en getDashboardMetrics:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
