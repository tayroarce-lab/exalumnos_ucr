import React from "react";
import Link from "next/link";
import DirectorioClient from "./_components/DirectorioClient";
import DirectoryBackground from "@/components/ui/DirectoryBackground";
import { getEstudiantes } from "@/lib/api";
import { parseSearchParams } from "@/lib/url-utils";

export default async function DirectorioEstudiantesPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const { filtros } = parseSearchParams(searchParams);
  const { estudiantes, total } = await getEstudiantes(filtros, { limit: 100 });

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#E0F2FE] via-white to-[#FFEAD2]/70 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 overflow-hidden">
      {/* Fondo alegre decorado */}
      <DirectoryBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#003B4F] mb-1 font-sans tracking-tight">Directorio de Estudiantes</h1>
            <p className="text-sm text-slate-600 font-medium">Encuentra proyectos innovadores que necesitan tu apoyo.</p>
          </div>
          <div className="hidden sm:block">
            <Link 
              href="/directorio/estudiantes/todos"
              className="text-sm font-bold text-[#003B4F] hover:text-[#54BCEB] transition-colors duration-200 flex items-center gap-1 bg-white/80 border border-slate-200/80 px-4 py-2 rounded-xl shadow-sm hover:shadow"
            >
              Ver todos
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
