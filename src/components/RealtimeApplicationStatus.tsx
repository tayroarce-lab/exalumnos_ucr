'use client';

// =============================================================================
// COMPONENTE: RealtimeApplicationStatus
// Descripción : Toast de notificación en tiempo real que se muestra al
//               estudiante cuando el Exalumno cambia su estado a "seleccionado".
//               Usa el hook useApplicationStatusRealtime (WebSocket Supabase).
// Reglas UI   : Posicionado fixed bottom-right. Sin style={{}}. Solo Tailwind.
// =============================================================================

import { useState, useCallback } from 'react';
import { CheckCircle, X, Briefcase, Bell } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { useApplicationStatusRealtime, EstadoCambio } from '@/hooks/useApplicationStatusRealtime';

interface Notificacion {
  id: string;
  mensaje: string;
  position_id: string;
  tipo: 'seleccionado' | 'descartado' | 'en_revision';
  timestamp: Date;
}

const LABELS_ESTADO: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  seleccionado: {
    label: '¡Fuiste seleccionado/a!',
    color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    icon: CheckCircle,
  },
  en_revision: {
    label: 'Tu aplicación está en revisión',
    color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    icon: Bell,
  },
  descartado: {
    label: 'Tu aplicación no avanzó',
    color: 'border-slate-400 bg-slate-50 dark:bg-slate-800/40',
    icon: Briefcase,
  },
};

// =============================================================================
// [VERDE - FUNCION: RealtimeApplicationStatus]
// Componente que se monta una sola vez en el layout del dashboard y
// escucha via WebSocket los cambios de estado de las aplicaciones del estudiante.
// =============================================================================
export default function RealtimeApplicationStatus() {
  const { user } = useProfile();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // Callback que recibe el cambio de estado desde el hook de Realtime
  const manejarCambio = useCallback((cambio: EstadoCambio) => {
    const estadoRelevante = ['seleccionado', 'en_revision', 'descartado'];
    if (!estadoRelevante.includes(cambio.estado_nuevo)) return;

    const nueva: Notificacion = {
      id: `${cambio.aplicacion_id}-${Date.now()}`,
      mensaje: LABELS_ESTADO[cambio.estado_nuevo]?.label ?? `Estado: ${cambio.estado_nuevo}`,
      position_id: cambio.position_id,
      tipo: cambio.estado_nuevo as Notificacion['tipo'],
      timestamp: new Date(),
    };

    setNotificaciones(prev => [...prev, nueva]);

    // Auto-eliminar la notificación después de 12 segundos
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== nueva.id));
    }, 12000);
  }, []);

  // Conectar el WebSocket a través del hook reutilizable
  useApplicationStatusRealtime({
    studentId: user?.id,
    onCambioEstado: manejarCambio,
  });

  const cerrarNotificacion = (id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  if (notificaciones.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notificaciones en tiempo real"
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none"
    >
      {notificaciones.map((notif) => {
        const config = LABELS_ESTADO[notif.tipo];
        const Icon = config?.icon ?? Bell;
        const colorClass = config?.color ?? 'border-slate-400 bg-white';

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto w-80 border-2 rounded-2xl shadow-2xl p-4 flex gap-3 items-start backdrop-blur-sm ${colorClass} animate-slide-up`}
          >
            {/* Icono */}
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
              <Icon
                className={`w-5 h-5 ${
                  notif.tipo === 'seleccionado'
                    ? 'text-emerald-500'
                    : notif.tipo === 'en_revision'
                    ? 'text-blue-500'
                    : 'text-slate-400'
                }`}
              />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                Actualización de Aplicación
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {notif.mensaje}
              </p>
              <a
                href={`/jobs`}
                className="inline-block mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver mis aplicaciones →
              </a>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => cerrarNotificacion(notif.id)}
              aria-label="Cerrar notificación"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0 mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
