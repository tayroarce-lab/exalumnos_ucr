import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EstudianteDirectorio } from "@/types/estudiantes";

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

  // Color dinámico del badge de match según porcentaje
  const getBadgeColor = () => {
    if (avance >= 80) return "bg-emerald-500";
    if (avance >= 50) return "bg-celeste";
    return "bg-amber-500";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full group">
      {/* Cabecera con avatar, nombre y badge */}
      <div className="p-5 pb-3 flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-slate-200/60 shadow-sm">
          {estudiante.foto_url ? (
            <img src={estudiante.foto_url} alt={estudiante.nombre} className="w-full h-full object-cover" />
          ) : (
            <span className="text-esmeralda font-bold text-xl">
              {estudiante.nombre.charAt(0)}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900 truncate leading-tight" title={estudiante.nombre}>
                {estudiante.nombre}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{estudiante.carrera}</p>
              <p className="text-xs text-slate-400 truncate">{estudiante.sede}</p>
            </div>
            
            {/* Badge de Match/Avance */}
            <span className={`${getBadgeColor()} text-white text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 shadow-sm`}>
              {avance}%
              <span className="block text-[8px] font-medium opacity-90 text-center leading-tight">Match</span>
            </span>
          </div>
        </div>
      </div>

      {/* Proyecto */}
      <div className="px-5 pb-3 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Proyecto</p>
        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug" title={estudiante.proyecto_titulo || ""}>
          {estudiante.proyecto_titulo || "Proyecto sin título"}
        </p>
      </div>

      {/* Progreso */}
      <div className="px-5 pb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-medium text-slate-500">Progreso</span>
          <span className="text-[11px] font-bold text-esmeralda">{avance} %</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-esmeralda to-celeste h-1.5 rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${avance}%` }}
          ></div>
        </div>
      </div>

      {/* Footer con botón Ofrecer Apoyo */}
      <div className="px-5 pb-5 mt-auto flex flex-col gap-2">
        <button className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 border-esmeralda/20 bg-white hover:bg-esmeralda hover:text-white text-esmeralda h-10 px-4 group/btn" onClick={() => router.push('/donations?metodo=sinpe')}>
          {/* Handshake icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover/btn:scale-110">
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
          className="w-full inline-flex justify-center items-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-esmeralda text-white hover:bg-esmeralda/90 h-10 px-4 shadow-sm hover:shadow-md"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
}
