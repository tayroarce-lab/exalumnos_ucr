import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EstudianteDirectorio } from "@/types/estudiantes";
import { getAvatarUrl } from "@/lib/utils";

export default function TarjetaEstudiante({ estudiante }: { estudiante: EstudianteDirectorio }) {
  const router = useRouter();
  const getTagsApoyo = () => {
    const tags = [];
    if (estudiante.busca_financiamiento) tags.push("Financiamiento");
    if (estudiante.busca_mentoria) tags.push("Mentoría");
    if (estudiante.busca_empleo) tags.push("Empleo");
    if (estudiante.busca_pasantia) tags.push("Pasantía");
    return tags;
  };

  const avance = estudiante.proyecto_porcentaje_avance || 0;

  // Color dinámico del badge de match según porcentaje con gradientes UCR
  const getBadgeColor = () => {
    if (avance >= 80) return "from-[#003B4F] to-[#54BCEB]";
    if (avance >= 50) return "from-[#54BCEB] to-[#FF9B18]";
    return "from-[#FF9B18] to-[#F34B26]";
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group relative">
      {/* Glow de fondo al hacer hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#54BCEB]/5 to-[#F34B26]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Cabecera con avatar, nombre y badge */}
      <div className="p-5 pb-3 flex items-start gap-4 relative z-10">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-slate-200/60 shadow-sm group-hover:border-[#54BCEB]/50 transition-colors duration-300">
          {estudiante.foto_url ? (
            <img src={getAvatarUrl(estudiante.foto_url) as string} alt={estudiante.nombre} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#003B4F] font-extrabold text-xl group-hover:scale-110 transition-transform duration-300">
              {estudiante.nombre.charAt(0)}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-extrabold text-base text-[#003B4F] truncate leading-tight group-hover:text-[#54BCEB] transition-colors duration-200" title={estudiante.nombre}>
                {estudiante.nombre}
              </h3>
              <p className="text-xs text-[#54BCEB] font-semibold truncate mt-0.5">{estudiante.carrera}</p>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{estudiante.sede}</p>
            </div>
            
            {/* Badge de Match/Avance */}
            <span className={`bg-gradient-to-br ${getBadgeColor()} text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl flex-shrink-0 shadow-sm flex flex-col items-center justify-center min-w-[50px]`}>
              <span>{avance}%</span>
              <span className="text-[7px] font-extrabold uppercase tracking-wide opacity-90 leading-none mt-0.5">Match</span>
            </span>
          </div>
        </div>
      </div>

      {/* Proyecto */}
      <div className="px-5 pb-3 flex-1 relative z-10">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Proyecto</p>
        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug" title={estudiante.proyecto_titulo || ""}>
          {estudiante.proyecto_titulo || "Proyecto sin título"}
        </p>
      </div>

      {/* Progreso */}
      <div className="px-5 pb-4 relative z-10">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-semibold text-slate-500">Progreso</span>
          <span className="text-[11px] font-black text-[#003B4F]">{avance} %</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#54BCEB] to-[#003B4F] h-2 rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${avance}%` }}
          ></div>
        </div>
      </div>

      {/* Footer con botón Ofrecer Apoyo */}
      <div className="px-5 pb-5 mt-auto flex flex-col gap-2 relative z-10">
        <button 
          className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-extrabold transition-all duration-200 bg-[#E84F26] text-white hover:bg-[#c93f1a] hover:shadow-md hover:shadow-[#E84F26]/20 h-10 px-4 active:scale-[0.98] group/btn cursor-pointer" 
          onClick={() => router.push('/donations?metodo=sinpe')}
        >
          {/* Handshake icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover/btn:scale-110">
            <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
            <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
            <path d="m21 3 1 11h-2"/>
            <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
            <path d="M3 4h8"/>
          </svg>
          Ofrecer apoyo
        </button>
        <Link 
          href={`/directorio/estudiantes/${estudiante.user_id}`}
          className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-extrabold transition-all duration-200 border-2 border-[#003B4F]/10 bg-white hover:bg-[#003B4F] hover:text-white text-[#003B4F] h-10 px-4 active:scale-[0.98] shadow-sm hover:shadow"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
}
