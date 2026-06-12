'use client';

// =============================================================================
// PÁGINA: /mis-aplicaciones
// Descripción : Vista donde el estudiante revisa todas sus aplicaciones activas.
//               Se actualiza en tiempo real via WebSocket (Supabase Realtime)
//               cuando el Exalumno cambia el estado a "seleccionado".
// GUARDRAIL   : Solo muestra datos de las aplicaciones del usuario logueado.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/contexts/ProfileContext';
import { useApplicationStatusRealtime } from '@/hooks/useApplicationStatusRealtime';
import {
  Briefcase, Clock, CheckCircle, XCircle, Eye,
  FileText, AlertCircle, Wifi, WifiOff, RefreshCw,
} from 'lucide-react';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

type EstadoAplicacion = 'enviada' | 'en_revision' | 'seleccionado' | 'descartado';

interface Aplicacion {
  id: string;
  position_id: string;
  status: EstadoAplicacion;
  cover_message: string | null;
  cv_url: string | null;
  created_at: string;
  updated_at: string;
  posicion_titulo: string;
  empresa: string;
}

// ─── HELPERS VISUALES ────────────────────────────────────────────────────────

function getBadgeEstado(status: EstadoAplicacion) {
  switch (status) {
    case 'enviada':
      return {
        label: 'Enviada',
        clase: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        icon: Clock,
      };
    case 'en_revision':
      return {
        label: 'En Revisión',
        clase: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Eye,
      };
    case 'seleccionado':
      return {
        label: '¡Seleccionado/a!',
        clase: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle,
      };
    case 'descartado':
      return {
        label: 'No avanzó',
        clase: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        icon: XCircle,
      };
  }
}

function formatearFecha(isoString: string) {
  return new Date(isoString).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export default function MisAplicacionesPage() {
  const { user } = useProfile();
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConectado, setRealtimeConectado] = useState(false);
  const [idsActualizados, setIdsActualizados] = useState<Set<string>>(new Set());

  // ── Fetch de aplicaciones desde Supabase ─────────────────────────────────

  const cargarAplicaciones = useCallback(async () => {
    if (!user) return;
    setCargando(true);
    setError(null);

    const supabase = createClient();

    // Join con posiciones para mostrar el título y empresa
    const { data, error: fetchError } = await supabase
      .from('applications')
      .select(`
        id,
        position_id,
        status,
        cover_message,
        cv_url,
        created_at,
        updated_at,
        posiciones!inner (
          titulo,
          empresa
        )
      `)
      .eq('student_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('No se pudieron cargar tus aplicaciones.');
      setCargando(false);
      return;
    }

    // Mapear datos del join
    const mapped: Aplicacion[] = (data ?? []).map((row: any) => ({
      id: row.id,
      position_id: row.position_id,
      status: row.status,
      cover_message: row.cover_message,
      cv_url: row.cv_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      posicion_titulo: row.posiciones?.titulo ?? 'Posición',
      empresa: row.posiciones?.empresa ?? 'Empresa',
    }));

    setAplicaciones(mapped);
    setCargando(false);
  }, [user]);

  useEffect(() => {
    cargarAplicaciones();
  }, [cargarAplicaciones]);

  // ── Realtime: actualización optimista del estado ─────────────────────────

  useApplicationStatusRealtime({
    studentId: user?.id,
    onCambioEstado: (cambio) => {
      // Actualización optimista: mutar el estado local directamente
      setAplicaciones(prev =>
        prev.map(app =>
          app.id === cambio.aplicacion_id
            ? { ...app, status: cambio.estado_nuevo as EstadoAplicacion, updated_at: new Date().toISOString() }
            : app
        )
      );

      // Resaltar la tarjeta que cambió durante 5 segundos
      setIdsActualizados(prev => new Set(prev).add(cambio.aplicacion_id));
      setTimeout(() => {
        setIdsActualizados(prev => {
          const next = new Set(prev);
          next.delete(cambio.aplicacion_id);
          return next;
        });
      }, 5000);

      setRealtimeConectado(true);
    },
  });

  // Marcar como conectado cuando el hook se monta exitosamente
  useEffect(() => {
    if (user?.id) setRealtimeConectado(true);
    return () => setRealtimeConectado(false);
  }, [user?.id]);

  // ── Estadísticas rápidas ─────────────────────────────────────────────────
  const stats = {
    total: aplicaciones.length,
    activas: aplicaciones.filter(a => a.status === 'enviada' || a.status === 'en_revision').length,
    seleccionadas: aplicaciones.filter(a => a.status === 'seleccionado').length,
    descartadas: aplicaciones.filter(a => a.status === 'descartado').length,
  };

  // ── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="py-8 px-6 lg:px-10 max-w-5xl mx-auto space-y-8">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase font-display text-slate-900 dark:text-white tracking-wide flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-blue-600" />
            Mis Aplicaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Seguimiento en tiempo real de tus postulaciones a posiciones UCR.
          </p>
        </div>

        {/* Indicador Realtime + botón refresh */}
        <div className="flex items-center gap-3">
          <div
            title={realtimeConectado ? 'Actualizaciones en tiempo real activas' : 'Reconectando…'}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
              realtimeConectado
                ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400'
                : 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400'
            }`}
          >
            {realtimeConectado ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {realtimeConectado ? 'En vivo' : 'Reconectando'}
          </div>
          <button
            onClick={cargarAplicaciones}
            disabled={cargando}
            title="Actualizar manualmente"
            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700 dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800' },
          { label: 'Activas', value: stats.activas, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Seleccionado/a', value: stats.seleccionadas, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'No avanzó', value: stats.descartadas, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-white/50 dark:border-white/5`}>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Estados */}
      {cargando && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Cargando tus aplicaciones…</p>
        </div>
      )}

      {error && !cargando && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {!cargando && !error && aplicaciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 dark:text-white">Aún no has aplicado a ninguna posición</p>
            <p className="text-sm text-slate-500 mt-1">Explora las oportunidades disponibles en la bolsa de empleo.</p>
          </div>
          <a
            href="/jobs"
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider"
          >
            Ver Oportunidades →
          </a>
        </div>
      )}

      {/* Lista de aplicaciones */}
      {!cargando && !error && aplicaciones.length > 0 && (
        <div className="space-y-4">
          {aplicaciones.map((app) => {
            const badge = getBadgeEstado(app.status);
            const Icon = badge.icon;
            const estaActualizado = idsActualizados.has(app.id);

            return (
              <div
                key={app.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-sm transition-all duration-500 ${
                  estaActualizado
                    ? 'border-emerald-400 ring-2 ring-emerald-300/50 dark:border-emerald-600 dark:ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Ícono de estado */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${badge.clase}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                      {app.posicion_titulo}
                    </h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${badge.clase}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                    {estaActualizado && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 animate-pulse">
                        ✦ Actualizado ahora
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {app.empresa}
                  </p>
                  {app.cover_message && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                      "{app.cover_message}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <span>Aplicado: {formatearFecha(app.created_at)}</span>
                    <span>Actualizado: {formatearFecha(app.updated_at)}</span>
                  </div>
                </div>

                {/* Acción: Ver CV */}
                {app.cv_url && (
                  <a
                    href={`/api/cv/export?path=${encodeURIComponent(app.cv_url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <FileText className="w-4 h-4" />
                    Mi CV
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Aviso informativo */}
      {!cargando && aplicaciones.length > 0 && (
        <p className="text-xs text-center text-slate-400 dark:text-slate-600 pb-4">
          Los cambios de estado se reflejan automáticamente gracias a Supabase Realtime (WebSocket).
          No es necesario refrescar la página.
        </p>
      )}
    </div>
  );
}
