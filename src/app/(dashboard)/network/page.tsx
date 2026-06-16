import React from "react";
import Link from "next/link";
import DirectorioClient from "../directorio/estudiantes/_components/DirectorioClient";
import { getEstudiantes } from "@/lib/api";
import { parseSearchParams } from "@/lib/url-utils";

export default async function NetworkPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const { filtros } = parseSearchParams(searchParams);
  const { estudiantes, total } = await getEstudiantes(filtros, { limit: 100 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide mb-1">Directorio de Exalumnos</h1>
            <p className="text-sm text-slate-500">Encuentra proyectos innovadores de estudiantes que necesitan tu apoyo.</p>
          </div>
          <div className="hidden sm:block">
            <Link
              href="/directorio/estudiantes/todos"
              className="text-sm font-semibold text-esmeralda hover:text-celeste transition-colors duration-200 flex items-center gap-1"
            >
              Ver todos
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>

        <DirectorioClient
          estudiantesIniciales={estudiantes}
          totalInicial={total}
          filtrosIniciales={filtros}
        />
      </div>
    </div>
  );
}
