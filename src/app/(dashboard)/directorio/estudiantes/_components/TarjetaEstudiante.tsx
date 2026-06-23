import React, { useState } from "react";
import Link from "next/link";
import { EstudianteDirectorio } from "@/types/estudiantes";
import { getAvatarUrl } from "@/lib/utils";
import ModalOfrecerApoyo from "./ModalOfrecerApoyo";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TarjetaEstudiante({ estudiante }: { estudiante: EstudianteDirectorio }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const router = useRouter();

  const matchScore = estudiante.match_score ?? 0;
  const avanceProyecto = estudiante.proyecto_porcentaje_avance ?? 0;

  // Título de proyecto simulado dinámicamente con el primer nombre si no existe
  const primerNombre = estudiante.nombre.split(' ')[0].toUpperCase();
  const tituloProyecto = estudiante.proyecto_titulo || `PROYECTO TFG ${primerNombre}`;

  // Nombre completo del estudiante para el modal
  const nombreCompleto = estudiante.nombre;

  // Estado para mostrar descripción del proyecto
  const [mostrarInfo, setMostrarInfo] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Si hace clic en un botón, enlace o en el modal, no navegamos
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    // Navegar al perfil completo
    router.push(`/directorio/estudiantes/${estudiante.user_id}`);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white hover:bg-sky-50 hover:border-[#54BCEB] hover:shadow-[0_0_20px_rgba(84,188,235,0.25)] hover:-translate-y-1 rounded-2xl border border-[#54BCEB]/30 p-5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group h-full cursor-pointer"
      >

        {/* Cabecera con avatar, nombre y badge */}
        <div className="flex items-start gap-4 relative z-10">
          {/* Avatar con anillo oscuro */}
          <div className="relative flex-shrink-0 mt-1">
            <div className="w-12 h-12 rounded-full p-0.5 border-2 border-[#003B4F] shadow-sm bg-white flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                {estudiante.foto_url ? (
                  <img src={getAvatarUrl(estudiante.foto_url) as string} alt={estudiante.nombre} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-[#003B4F] font-black text-xl">
                    {estudiante.nombre.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            {/* Pequeño icono en la esquina */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
               <div className="w-3 h-3 bg-[#003B4F] rounded-full"></div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-sans font-extrabold text-[#003B4F] text-[15px] leading-tight truncate uppercase" title={estudiante.nombre}>
                  {estudiante.nombre}
                </h3>
                <p className="text-[11px] font-bold text-[#0081A7] mt-0.5 truncate">{estudiante.carrera}</p>
                <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#F34B26]" fill="#F34B26" strokeWidth={1} /> Sede de {estudiante.sede}
                </p>
              </div>
              
              {/* Badge de Match */}
              {matchScore > 0 && (
                <span className="bg-[#003B4F] text-white text-[13px] font-black px-3 py-2 rounded-full shadow-sm flex flex-col items-center justify-center min-w-[55px] shrink-0">
                  <span>{matchScore}%</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest opacity-90 leading-none mt-0.5">Match</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Proyecto */}
        <div className="pt-2 flex-1 flex flex-col gap-2 relative z-10">
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMostrarInfo(true);
            }}
            className="cursor-pointer group/proyecto"
          >
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/proyecto:text-[#0081A7] transition-colors">Proyecto de Graduación</p>
            </div>
            <p className="text-xs font-bold text-[#C0392B] line-clamp-2 leading-snug uppercase group-hover/proyecto:underline decoration-dashed underline-offset-2" title="Clic para ver información del proyecto">
              {tituloProyecto}
            </p>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progreso del Proyecto</span>
              <span className="text-[11px] font-extrabold text-[#003B4F]">{avanceProyecto}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden relative">
              <style>{`
                #progress-${estudiante.user_id} {
                  width: ${avanceProyecto}%;
                }
              `}</style>
              <div 
                id={`progress-${estudiante.user_id}`}
                className="bg-[#003B4F] h-1.5 rounded-full transition-all duration-700 ease-out"
              ></div>
            </div>
          </div>
        </div>

        {/* Footer con botones de acción apilados verticalmente */}
        <div className="pt-2 mt-auto flex flex-col gap-2 relative z-10">
          <Link 
            href={`/directorio/estudiantes/${estudiante.user_id}`}
            className="w-full"
          >
            <button className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-[13px] py-2.5 transition-all rounded-xl flex items-center justify-center cursor-pointer shadow-sm">
              Ver Detalles
            </button>
          </Link>
          <button 
            className="w-full bg-white border border-[#54BCEB]/60 hover:bg-[#54BCEB]/10 text-[#003B4F] font-bold text-[13px] py-2.5 transition-all rounded-xl flex items-center justify-center cursor-pointer" 
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

      {/* Modal de Información del Proyecto */}
      {mostrarInfo && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setMostrarInfo(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg border border-[#B3DCEE]/60 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setMostrarInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#003B4F] transition-colors text-2xl font-bold cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-[#E0F2FE]"
            >
              &times;
            </button>
            
            <div className="flex justify-between items-start gap-2 mb-4 pr-8">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Proyecto de Graduación</span>
              <span className="text-[11px] font-bold text-[#1A5B75] bg-[#E0F2FE] px-3 py-1 rounded-full shadow-sm">
                {estudiante.proyecto_area_tematica || estudiante.proyecto_tipo || 'Tecnología'}
              </span>
            </div>
            
            <h2 className="text-xl font-black text-[#B43B06] mb-4 uppercase leading-tight">
              {tituloProyecto}
            </h2>
            
            <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
              {estudiante.proyecto_descripcion || 'Un proyecto mock para recibir donaciones y apoyo económico de la comunidad de graduados.'}
            </p>
            
            <div className="pt-5 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Progreso del Proyecto</span>
                <span className="text-sm font-black text-[#1A5B75]">{avanceProyecto}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div 
                  className="bg-[#1A5B75] h-2.5 rounded-full" 
                  style={{ width: `${avanceProyecto}%` }}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Link href={`/directorio/estudiantes/${estudiante.user_id}`}>
                <button className="bg-[#003B4F] hover:bg-[#1A5B75] text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer">
                  Ver Perfil Completo
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
