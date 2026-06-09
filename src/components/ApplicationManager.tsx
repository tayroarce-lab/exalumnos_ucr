'use client';

// =============================================================================
// COMPONENTE: ApplicationManager
// Descripción : Panel de gestión de aplicaciones.
//               Incluye ModalAplicar (Estudiante) y PanelAplicantes (Exalumno).
// =============================================================================

import { useState } from 'react';
import { FileText, Send, User, MapPin, Star, Eye, Check, X, AlertTriangle } from 'lucide-react';
import { enviarAplicacion, cambiarEstadoAplicacion, EstadoAplicacion } from '@/services/applicationService';

// =============================================================================
// [VERDE - FUNCION: ModalAplicar]
// Modal interactivo para que el estudiante aplique a una posición.
// =============================================================================
export function ModalAplicar({ 
  positionId, 
  onClose, 
  onSuccess 
}: { 
  positionId: string; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [mensaje, setMensaje] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const manejarEnvio = async () => {
    setEnviando(true);
    setError('');

    const respuesta = await enviarAplicacion({
      position_id: positionId,
      cover_message: mensaje,
      cv_file: archivo || undefined
    });

    if (respuesta.exito) {
      onSuccess();
    } else {
      setError(respuesta.mensaje);
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            Aplicar a Posición
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-5">
          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Mensaje de Presentación (Opcional)
            </label>
            <textarea
              rows={4}
              maxLength={500}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Hola, me interesa esta posición porque..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
            <div className="text-right text-xs text-slate-500 mt-1">{mensaje.length}/500</div>
          </div>

          {/* Adjuntar CV */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Adjuntar CV (Opcional)
            </label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <FileText className="w-6 h-6 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {archivo ? archivo.name : 'Click o arrastre su CV en PDF'}
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Cancelar
          </button>
          <button 
            onClick={manejarEnvio}
            disabled={enviando}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {enviando ? 'Enviando...' : 'Enviar Aplicación'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Tipos para PanelAplicantes
// =============================================================================
export interface Candidato {
  id: string; // ID de la aplicación
  student_id: string;
  nombre: string;
  carrera: string;
  sede: string;
  score_compatibilidad: number;
  status: EstadoAplicacion;
  cv_url?: string;
  cover_message?: string;
}

// =============================================================================
// [VERDE - FUNCION: PanelAplicantes]
// Panel de gestión para que el exalumno revise los aplicantes a una de sus posiciones.
// GUARDRAIL: No expone promedio ni beca socioeconómica.
// =============================================================================
export function PanelAplicantes({ 
  positionId, 
  candidatos, 
  onUpdate 
}: { 
  positionId: string;
  candidatos: Candidato[]; 
  onUpdate: () => void;
}) {
  const [actualizando, setActualizando] = useState<string | null>(null);

  // [VERDE - FUNCION: manejarAccion]
  const manejarAccion = async (aplicacionId: string, nuevoEstado: EstadoAplicacion) => {
    setActualizando(aplicacionId);

    let cerrarPosicion = false;
    if (nuevoEstado === 'seleccionado') {
      cerrarPosicion = window.confirm(
        '¡Genial! Has seleccionado a este candidato.\n\n¿Deseas cerrar la posición y descartar automáticamente (de forma anónima) al resto de aplicantes?'
      );
    }

    const respuesta = await cambiarEstadoAplicacion(aplicacionId, nuevoEstado, positionId, cerrarPosicion);
    
    if (respuesta.exito) {
      onUpdate();
    } else {
      alert(respuesta.mensaje);
    }
    setActualizando(null);
  };

  const getColorPorScore = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10';
    if (score >= 50) return 'text-blue-500 bg-blue-500/10';
    return 'text-amber-500 bg-amber-500/10';
  };

  const getStatusBadge = (status: EstadoAplicacion) => {
    switch(status) {
      case 'enviada': return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 rounded-lg text-xs font-medium">Recibida</span>;
      case 'en_revision': return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-medium">En revisión</span>;
      case 'seleccionado': return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-medium">Seleccionado</span>;
      case 'descartado': return <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-medium">Descartado</span>;
    }
  };

  if (candidatos.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sin aplicantes aún</h3>
        <p className="text-slate-500 mt-2 max-w-sm">
          Cuando un estudiante envíe su aplicación, aparecerá en esta lista protegiendo su anonimato frente a otros candidatos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          Candidatos ({candidatos.length})
        </h2>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {candidatos.map((candidato) => (
          <div key={candidato.id} className="p-5 flex flex-col md:flex-row gap-5 items-start md:items-center hover:bg-slate-50 dark:hover:bg-slate-800/20 transition">
            
            {/* Info Principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-white truncate">{candidato.nombre}</h3>
                {getStatusBadge(candidato.status)}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><BookOpenIcon /> {candidato.carrera}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {candidato.sede}</span>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${getColorPorScore(candidato.score_compatibilidad)}`}>
                  <Star className="w-3.5 h-3.5" /> Match {candidato.score_compatibilidad}%
                </span>
              </div>

              {candidato.cover_message && (
                <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-400 italic">
                  "{candidato.cover_message}"
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap items-center gap-2 md:w-auto w-full">
              {candidato.cv_url && (
                <button 
                  onClick={() => alert(`Abre CV: ${candidato.cv_url}`)} 
                  className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  <Eye className="w-4 h-4" /> CV
                </button>
              )}

              {candidato.status !== 'seleccionado' && candidato.status !== 'descartado' && (
                <>
                  {candidato.status === 'enviada' && (
                    <button 
                      onClick={() => manejarAccion(candidato.id, 'en_revision')}
                      disabled={actualizando === candidato.id}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium transition"
                    >
                      <ActivityIcon /> Revisar
                    </button>
                  )}
                  
                  <button 
                    onClick={() => manejarAccion(candidato.id, 'seleccionado')}
                    disabled={actualizando === candidato.id}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition"
                  >
                    <Check className="w-4 h-4" /> Elegir
                  </button>

                  <button 
                    onClick={() => manejarAccion(candidato.id, 'descartado')}
                    disabled={actualizando === candidato.id}
                    className="flex items-center gap-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

          </div>
        ))}
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <p>Por seguridad y privacidad de los estudiantes UCR, esta lista de aplicantes es visible de manera exclusiva para el autor de la posición.</p>
      </div>
    </div>
  );
}

// Iconos Auxiliares Locales
function BookOpenIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
}

function ActivityIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
}
