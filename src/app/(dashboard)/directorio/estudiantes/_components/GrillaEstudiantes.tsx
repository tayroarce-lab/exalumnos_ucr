import React from "react";
import { EstudianteDirectorio } from "@/types/estudiantes";
import TarjetaEstudiante from "./TarjetaEstudiante";

export default function GrillaEstudiantes({ estudiantes }: { estudiantes: EstudianteDirectorio[] }) {
  if (!estudiantes || estudiantes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed rounded-2xl border-slate-200 bg-white/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-4">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <p className="text-slate-600 font-semibold text-base mb-1">No se encontraron estudiantes</p>
        <p className="text-slate-400 text-sm max-w-xs">Intenta ajustar los criterios de búsqueda o limpia los filtros para ver más resultados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
      {estudiantes.map((estudiante) => (
        <TarjetaEstudiante key={estudiante.user_id} estudiante={estudiante} />
      ))}
    </div>
  );
}
