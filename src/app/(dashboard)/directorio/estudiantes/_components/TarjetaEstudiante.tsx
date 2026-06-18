import React, { useState } from "react";
import Link from "next/link";
import { EstudianteDirectorio } from "@/types/estudiantes";
import { getAvatarUrl } from "@/lib/utils";
import ModalOfrecerApoyo from "./ModalOfrecerApoyo";

export default function TarjetaEstudiante({ estudiante }: { estudiante: EstudianteDirectorio }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  // Simulación del progreso (85% o 68% según hash por defecto si es 0/null)
  const avance = estudiante.proyecto_porcentaje_avance || (estudiante.nombre.length % 2 === 0 ? 85 : 68);

  // Título de proyecto simulado dinámicamente con el primer nombre si no existe
  const primerNombre = estudiante.nombre.split(' ')[0].toUpperCase();
  const tituloProyecto = estudiante.proyecto_titulo || `PROYECTO TFG ${primerNombre}`;

  // Nombre completo del estudiante para el modal
  const nombreCompleto = estudiante.nombre;

  return (
    <>
      <div className="bg-white rounded-2xl border border-transparent hover:border-[#54BCEB]/40 p-5 shadow-sm hover:shadow-2xl hover:shadow-[#54BCEB]/10 hover:-translate-y-1 hover:bg-[#54BCEB]/5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group h-full">
        {/* Glow de fondo al hacer hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#54BCEB]/5 to-[#F34B26]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Cabecera con avatar, nombre y badge */}
        <div className="flex items-start gap-4 relative z-10">
          {/* Avatar con anillo degradado fino de UCR */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-xl p-0.5 bg-gradient-to-tr from-[#54BCEB] via-[#003B4F] to-[#F34B26] shadow-sm">
              <div className="w-full h-full rounded-xl bg-white p-0.5 overflow-hidden flex items-center justify-center border border-white">
                {estudiante.foto_url ? (
                  <img src={getAvatarUrl(estudiante.foto_url) as string} alt={estudiante.nombre} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-[#003B4F] font-black text-lg group-hover:scale-110 transition-transform duration-300">
                    {estudiante.nombre.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            {/* Badge de Verificado */}
            <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-[#1A5B75] flex items-center justify-center border border-white shadow-sm">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-sans font-semibold text-[#003B4F] text-base leading-tight truncate" title={estudiante.nombre}>
                  {estudiante.nombre}
                </h3>
                <p className="text-xs text-slate-500 mt-1 truncate">{estudiante.carrera}</p>
                <p className="text-slate-500 text-[10px] mt-1.5 font-semibold">
                  Sede de {estudiante.sede}
                </p>
              </div>
              
              {/* Badge de Match más visible */}
              <span className="bg-orange-100 text-[#F34B26] text-[11px] font-black px-2.5 py-1.5 rounded-xl border border-orange-200 shadow-sm flex flex-col items-center justify-center min-w-[55px] shrink-0">
                <span>{avance}%</span>
                <span className="text-[7px] font-extrabold uppercase tracking-wide opacity-90 leading-none mt-0.5">Match</span>
              </span>
            </div>
          </div>
        </div>

        {/* Proyecto */}
        <div className="pt-3 border-t border-slate-100 flex-1 flex flex-col gap-3 relative z-10">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Proyecto de Graduación</p>
            <p className="text-xs font-bold text-[#003B4F] line-clamp-2 leading-snug uppercase" title={tituloProyecto}>
              {tituloProyecto}
            </p>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Progreso del Proyecto</span>
              <span className="text-[10px] font-bold text-[#F34B26]">{avance}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner relative">
              <style>{`
                #progress-${estudiante.user_id} {
                  width: ${avance}%;
                }
              `}</style>
              <div 
                id={`progress-${estudiante.user_id}`}
                className="bg-[#F34B26] h-1.5 rounded-full transition-all duration-700 ease-out"
              ></div>
            </div>
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className="pt-4 mt-auto flex gap-2 border-t border-slate-100 relative z-10">
          <Link 
            href={`/directorio/estudiantes/${estudiante.user_id}`}
            className="flex-1"
          >
            <button className="w-full bg-sky-50/50 hover:bg-[#54BCEB] border border-sky-100/70 hover:border-[#54BCEB] text-[#003B4F] hover:text-white font-semibold text-xs py-2 h-9 transition-all rounded-xl flex items-center justify-center cursor-pointer">
              Ver Detalles
            </button>
          </Link>
          <button 
            className="flex-1 bg-orange-50 hover:bg-[#FF9B18] border border-orange-100/70 hover:border-[#FF9B18] text-[#FF9B18] hover:text-white font-semibold text-xs py-2 h-9 transition-all rounded-xl flex items-center justify-center cursor-pointer" 
            onClick={() => setModalAbierto(true)}
            id={`btn-ofrecer-apoyo-${estudiante.user_id}`}
          >
            Ofrecer apoyo
          </button>
        </div>
      </div>

      {/* Modal de selección de tipo de apoyo */}
      {modalAbierto && (
        <ModalOfrecerApoyo
          nombreEstudiante={nombreCompleto}
          estudianteId={estudiante.user_id}
          tituloProyecto={tituloProyecto}
          tiposApoyoBuscado={{
            buscaFinanciamiento: estudiante.busca_financiamiento,
            buscaMentoria: estudiante.busca_mentoria,
            buscaEmpleo: estudiante.busca_empleo,
            buscaPasantia: estudiante.busca_pasantia,
          }}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}
