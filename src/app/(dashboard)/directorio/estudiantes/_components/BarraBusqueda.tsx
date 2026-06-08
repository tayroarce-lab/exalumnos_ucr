"use client";

import React from "react";

interface BarraBusquedaProps {
  valor: string;
  onChange: (valor: string) => void;
}

export default function BarraBusqueda({ valor, onChange }: BarraBusquedaProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>
      <input
        type="text"
        className="block w-full p-2.5 pl-10 pr-4 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-esmeralda/30 focus:border-esmeralda focus:outline-none shadow-sm transition-all duration-200 placeholder:text-slate-400"
        placeholder="Buscar por nombre..."
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
