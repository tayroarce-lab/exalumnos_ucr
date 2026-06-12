'use client';

// =============================================================================
// HOOK: useApplicationStatusRealtime
// Descripción : Suscribe al canal Realtime de Supabase para detectar cambios
//               en el estado de las aplicaciones del estudiante autenticado.
//               Dispara un callback cuando el estado cambia a "seleccionado".
// =============================================================================

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface EstadoCambio {
  aplicacion_id: string;
  position_id: string;
  estado_nuevo: string;
  estado_anterior: string;
}

interface OpcionesRealtime {
  studentId: string | undefined;
  onCambioEstado: (cambio: EstadoCambio) => void;
}

// [VERDE - FUNCION: useApplicationStatusRealtime]
// Hook que establece una suscripción WebSocket a través de Supabase Realtime
// para escuchar actualizaciones en la tabla 'applications' filtradas por student_id.
export function useApplicationStatusRealtime({ studentId, onCambioEstado }: OpcionesRealtime) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const supabase = createClient();

    // Crear canal con filtro server-side por student_id para que RLS
    // y el filtro de Postgres Changes protejan los datos.
    const channel = supabase
      .channel(`application-status-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          const estadoNuevo = payload.new.status as string;
          const estadoAnterior = payload.old.status as string;

          // Solo notificar si hubo un cambio real de estado
          if (estadoNuevo !== estadoAnterior) {
            onCambioEstado({
              aplicacion_id: payload.new.id as string,
              position_id: payload.new.position_id as string,
              estado_nuevo: estadoNuevo,
              estado_anterior: estadoAnterior,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Suscrito a cambios de estado de aplicaciones');
        }
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('[Realtime] Canal cerrado o con error:', status);
        }
      });

    channelRef.current = channel;

    // Limpieza al desmontar el componente
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);
}
