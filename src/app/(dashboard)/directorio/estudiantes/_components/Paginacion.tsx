"use client";

import React from "react";

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
}

export default function Paginacion({ paginaActual, totalPaginas, onChange }: PaginacionProps) {
  if (totalPaginas <= 1) return null;

  // Limitar las páginas mostradas para UI limpia
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
    let end = Math.min(totalPaginas, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 pb-8">
      <button
        onClick={() => onChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="px-3.5 py-2 text-sm font-medium rounded-xl border border-white/10 text-white bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        ← Anterior
      </button>

      {getVisiblePages().map((pagina) => (
        <button
          key={pagina}
          onClick={() => onChange(pagina)}
          className={`w-10 h-10 text-sm font-semibold rounded-xl border transition-all duration-200 ${
            pagina === paginaActual
              ? "border-[#003B4F] bg-[#003B4F] text-white shadow-sm shadow-[#003B4F]/25"
              : "border-white/10 text-white bg-white/10 hover:bg-white/20"
          }`}
        >
          {pagina}
        </button>
      ))}

      <button
        onClick={() => onChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="px-3.5 py-2 text-sm font-medium rounded-xl border border-white/10 text-white bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        Siguiente →
      </button>
    </div>
  );
}
