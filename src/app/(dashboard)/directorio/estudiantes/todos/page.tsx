import React from "react";
import Link from "next/link";
import TodosClient from "../_components/TodosClient";
import DirectoryBackground from "@/components/ui/DirectoryBackground";
import { getEstudiantes } from "@/lib/api";
import { parseSearchParams } from "@/lib/url-utils";

export default async function VerTodosEstudiantesPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const { filtros, busqueda, pagina } = parseSearchParams(searchParams);
  const { estudiantes, total } = await getEstudiantes(filtros, { page: pagina, limit: 12, busqueda });

  return (
    <div className="min-h-screen relative bg-[#FAF9E6] py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 overflow-hidden">
      {/* Fondo alegre decorado */}
      <DirectoryBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link href="/directorio/estudiantes" className="hover:text-[#1F8BB6] transition-colors">Directorio</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Todos los estudiantes</span>
        </div>

        <TodosClient 
          estudiantesIniciales={estudiantes} 
          totalInicial={total} 
          filtrosIniciales={filtros}
          busquedaInicial={busqueda}
          paginaInicial={pagina}
        />
      </div>
    </div>
  );
}
