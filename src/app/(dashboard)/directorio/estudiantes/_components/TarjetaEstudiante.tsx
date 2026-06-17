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
      <div className="bg-white rounded-2xl border border-[#B3DCEE]/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group relative">
        {/* Glow de fondo al hacer hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#54BCEB]/5 to-[#E84F26]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Cabecera con avatar, nombre y badge */}
        <div className="p-5 pb-3 flex items-start gap-4 relative z-10">
          {/* Avatar con anillo degradado fino de UCR */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#54BCEB] via-[#003B4F] to-[#E84F26] shadow-sm">
              <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center border border-white">
                {estudiante.foto_url ? (
                  <img src={getAvatarUrl(estudiante.foto_url) as string} alt={estudiante.nombre} className="w-full h-full object-cover rounded-full" />
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
                <h3 className="font-black text-base text-[#003B4F] truncate leading-tight group-hover:text-[#54BCEB] transition-colors duration-200" title={estudiante.nombre}>
                  {estudiante.nombre}
                </h3>
                <p className="text-xs text-[#1F8BB6] font-bold truncate mt-0.5">{estudiante.carrera}</p>
                <p className="text-xs text-slate-400 font-semibold truncate mt-0.5">📍 Sede de {estudiante.sede}</p>
              </div>
              
              {/* Badge de Match */}
              <span className="bg-gradient-to-br from-[#003B4F] to-[#54BCEB] text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl flex-shrink-0 shadow-sm flex flex-col items-center justify-center min-w-[50px]">
                <span>{avance}%</span>
                <span className="text-[7px] font-extrabold uppercase tracking-wide opacity-90 leading-none mt-0.5">Match</span>
              </span>
            </div>
          </div>
        </div>

        {/* Proyecto */}
        <div className="px-5 pb-3 flex-1 relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Proyecto de Graduación</p>
          <p className="text-sm font-bold text-[#B43B06] line-clamp-2 leading-snug uppercase" title={tituloProyecto}>
            {tituloProyecto}
          </p>
        </div>

        {/* Progreso */}
        <div className="px-5 pb-4 relative z-10">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progreso del Proyecto</span>
            <span className="text-xs font-black text-[#1A5B75]">{avance}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner relative">
            <style>{`
              #progress-${estudiante.user_id} {
                width: ${avance}%;
              }
            `}</style>
            <div 
              id={`progress-${estudiante.user_id}`}
              className="bg-[#1A5B75] h-2 rounded-full transition-all duration-700 ease-out"
            ></div>
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className="px-5 pb-5 mt-auto flex flex-col gap-2 relative z-10">
          <Link 
            href={`/directorio/estudiantes/${estudiante.user_id}`}
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 bg-[#B43B06] hover:bg-[#9E3405] text-white h-10 px-4 active:scale-[0.98] shadow-sm hover:shadow"
          >
            Ver Detalles
          </Link>
          <button 
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 border border-[#1A5B75]/20 bg-white hover:bg-slate-50 text-[#1A5B75] h-10 px-4 active:scale-[0.98] cursor-pointer" 
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
