'use client';

import React from 'react';
import Link from 'next/link';
import { X, BookOpen, FileText, Video, DollarSign, Lightbulb, CheckCircle2, ExternalLink } from 'lucide-react';
import { EstudianteDirectorio } from '@/types/estudiantes';
import { getProyectoFileUrl } from '@/lib/utils';
import ProyectoDonacionesProgreso from '@/components/ProyectoDonacionesProgreso';

interface Props {
  estudiante: EstudianteDirectorio;
  onClose: () => void;
  onOfrecerApoyo?: () => void;
}

function formatProyectoTipo(tipo: string | null | undefined) {
  if (!tipo) return 'Proyecto de Graduación';
  switch (tipo.toLowerCase()) {
    case 'tfg': return 'Trabajo Final de Graduación (TFG)';
    case 'tesis': return 'Tesis de Grado';
    case 'practica_dirigida': return 'Práctica Dirigida';
    case 'seminario': return 'Seminario de Graduación';
    default: return tipo;
  }
}

export default function ModalProyectoEstudiante({ estudiante, onClose, onOfrecerApoyo }: Props) {
  const tituloProyecto = estudiante.proyecto_titulo || 'Proyecto de Graduación';
  const avance = estudiante.proyecto_porcentaje_avance || 0;
  const areaTematica = estudiante.proyecto_area_tematica || estudiante.proyecto_tipo || 'General';

  // Bloquear scroll al abrir modal
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl border border-[#B3DCEE]/60 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-[#003B4F] to-[#1A5B75] px-6 py-5 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#54BCEB]" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Proyecto de Graduación</span>
          </div>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white leading-tight uppercase pr-8">
                {tituloProyecto}
              </h2>
              <p className="text-sm text-white/70 font-semibold mt-1">{estudiante.nombre}</p>
            </div>
            <span className="bg-white/15 text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 shrink-0">
              {areaTematica}
            </span>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto max-h-[70vh] p-6 space-y-6">

          {/* Tipo y avance */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#54BCEB]/10 text-[#54BCEB] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {formatProyectoTipo(estudiante.proyecto_tipo)}
            </span>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Avance: {avance}%
            </span>
          </div>

          {/* Barra de progreso académico */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Progreso del proyecto</span>
              <span>{avance}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#FAF9E6] dark:bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#54BCEB] to-[#F34B26] transition-all duration-500"
                style={{ width: `${avance}%` }}
              />
            </div>
          </div>

          {/* Barra de financiamiento colectivo */}
          {estudiante.busca_financiamiento && estudiante.proyecto_valor_monto && (
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4">
              <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Financiamiento Colectivo
              </h5>
              <ProyectoDonacionesProgreso
                proyectoId={estudiante.user_id}
                metaMonto={estudiante.proyecto_valor_monto}
                metaMoneda={estudiante.proyecto_valor_moneda || 'USD'}
                mostrarBotonApoyar={false}
              />
            </div>
          )}

          {/* Imagen del proyecto */}
          {estudiante.proyecto_foto_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-72 w-full">
              <img
                src={getProyectoFileUrl(estudiante.proyecto_foto_url) || ''}
                alt={tituloProyecto}
                className="w-full h-full object-cover object-center max-h-72"
              />
            </div>
          )}

          {/* Descripción */}
          {estudiante.proyecto_descripcion && (
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción del Proyecto</h5>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {estudiante.proyecto_descripcion}
              </p>
            </div>
          )}

          {/* Beneficios para patrocinadores */}
          {estudiante.proyecto_beneficios && (
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 space-y-3">
              <h5 className="text-xs font-bold text-amber-700 uppercase tracking-wider">🎁 Beneficios para Patrocinadores</h5>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {estudiante.proyecto_beneficios}
              </p>
              {estudiante.proyecto_beneficios_fotos && estudiante.proyecto_beneficios_fotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                  {estudiante.proyecto_beneficios_fotos.map((fotoUrl, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-amber-200 shadow-sm aspect-square bg-slate-100">
                      <img
                        src={getProyectoFileUrl(fotoUrl) || ''}
                        alt={`Recompensa ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Necesidades */}
          {estudiante.proyecto_necesidades && estudiante.proyecto_necesidades.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#FF9B18]" /> Necesidades del Proyecto
              </h5>
              <div className="flex flex-wrap gap-2">
                {estudiante.proyecto_necesidades.map((nec: string, idx: number) => (
                  <span key={idx} className="bg-[#FF9B18]/10 text-[#FF9B18] px-3 py-1 rounded-full text-xs font-semibold">
                    {nec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tipos de apoyo buscados */}
          {(estudiante.busca_financiamiento || estudiante.busca_mentoria || estudiante.busca_empleo || estudiante.busca_pasantia) && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Apoyo Solicitado</h5>
              <div className="flex flex-wrap gap-2">
                {estudiante.busca_financiamiento && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    💰 Apoyo Económico
                  </span>
                )}
                {estudiante.busca_mentoria && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    🎓 Mentoría Técnica
                  </span>
                )}
                {estudiante.busca_empleo && (
                  <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    💼 Empleo
                  </span>
                )}
                {estudiante.busca_pasantia && (
                  <span className="bg-violet-100 text-violet-800 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    👜 Pasantía
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Documentos / Video */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {estudiante.proyecto_documento_url ? (
              <a
                href={getProyectoFileUrl(estudiante.proyecto_documento_url) || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                Ver Documentación
                <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
              </a>
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 text-slate-400 border border-slate-200/50 rounded-xl text-xs font-semibold">
                <FileText className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Sin documento</span>
              </div>
            )}

            {estudiante.proyecto_video_url ? (
              <a
                href={estudiante.proyecto_video_url.startsWith('http') ? estudiante.proyecto_video_url : `https://${estudiante.proyecto_video_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                <Video className="w-4 h-4 text-blue-500 shrink-0" />
                Ver Video
                <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
              </a>
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 text-slate-400 border border-slate-200/50 rounded-xl text-xs font-semibold">
                <Video className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Sin video</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-slate-100 rounded-b-3xl bg-slate-50/50 flex items-center gap-3">
          <Link
            href={`/directorio/estudiantes/${estudiante.user_id}`}
            className="flex-1 text-center py-3 rounded-xl border-2 border-[#003B4F]/20 text-[#003B4F] text-xs font-bold hover:border-[#003B4F]/40 hover:bg-[#003B4F]/5 transition-all"
          >
            Ver Perfil Completo
          </Link>
          {onOfrecerApoyo && (
            <button
              onClick={onOfrecerApoyo}
              className="flex-1 py-3 rounded-xl bg-[#003B4F] hover:bg-[#1A5B75] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Ofrecer Apoyo →
            </button>
          )}
          {!onOfrecerApoyo && estudiante.busca_financiamiento && (
            <Link
              href={`/donations?proyecto_id=${estudiante.user_id}`}
              className="flex-1 text-center py-3 rounded-xl bg-[#F34B26] hover:bg-[#C82A08] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              💰 Apoyar Económicamente →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
