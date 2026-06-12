'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { DatosCV } from '@/components/cv/CVLiveContext';

// Utilidad para validar UUID
const isValidUUID = (uuid: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

export async function obtenerVersionAdaptadaPorPosicion(posicionId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    // Si no es un UUID válido (ej. MOCK IDs), no lo filtramos por posicion_id o lo manejamos distinto.
    let query = supabase
      .from('cv_versiones')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (isValidUUID(posicionId)) {
      query = query.eq('posicion_id', posicionId);
    } else {
      // Para propósitos de prueba con MOCK_JOBS, traemos la última guardada genéricamente
      query = query.is('posicion_id', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) return { success: false, error: error.message };

    return { success: true, version: data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function guardarVersionAdaptada(
  posicionId: string, 
  tituloVersion: string, 
  cvAdaptado: DatosCV
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    // Determinar si el ID de posición es válido para la DB
    const validPosicionId = isValidUUID(posicionId) ? posicionId : null;

    const { error } = await supabase
      .from('cv_versiones')
      .insert([
        {
          user_id: user.id,
          posicion_id: validPosicionId,
          titulo_version: tituloVersion,
          contenido: cvAdaptado
        }
      ]);

    if (error) {
      if (error.message.includes('Has alcanzado el límite máximo')) {
        return { success: false, error: 'Has alcanzado el límite máximo de 10 versiones adaptadas. Elimina una anterior para continuar.' };
      }
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/posiciones/${posicionId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error guardando versión de CV:', error);
    return { success: false, error: error.message || 'Error interno del servidor' };
  }
}
