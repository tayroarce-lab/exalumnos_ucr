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
    <div className="min-h-screen bg-gradient-to-br from-[#F34B26] via-[#ff7c5c] to-[#F34B26] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-inner w-full relative overflow-hidden text-slate-900">
      <div className="max-w-none mx-auto w-full relative z-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-white/80 font-medium">
          <Link href="/directorio/estudiantes" className="hover:text-white hover:underline transition-colors">Directorio</Link>
          <span>/</span>
          <span className="text-white font-bold">Todos los estudiantes</span>
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
