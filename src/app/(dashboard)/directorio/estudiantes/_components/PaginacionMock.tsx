"use client";

import React from "react";

interface PaginacionMockProps {
  paginaActual: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
}

export default function PaginacionMock({ paginaActual, totalPaginas, onChange }: PaginacionMockProps) {
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
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        ← Anterior
      </button>

      {getVisiblePages().map((pagina) => (
        <button
          key={pagina}
          onClick={() => onChange(pagina)}
          className={`w-10 h-10 text-sm font-semibold rounded-xl border transition-all duration-200 ${
            pagina === paginaActual
              ? "border-esmeralda bg-esmeralda text-white shadow-sm shadow-esmeralda/25"
              : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          {pagina}
        </button>
      ))}

      <button
        onClick={() => onChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        Siguiente →
      </button>
    </div>
  );
}
