import React from "react";
import Link from "next/link";
import TodosClient from "../_components/TodosClient";
import { getEstudiantes } from "@/lib/api";
import { parseSearchParams } from "@/lib/url-utils";

export default async function VerTodosEstudiantesPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const { filtros, busqueda, pagina } = parseSearchParams(searchParams);
  const { estudiantes, total } = await getEstudiantes(filtros, { page: pagina, limit: 6, busqueda });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/directorio/estudiantes" className="hover:text-esmeralda transition-colors">Directorio</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Todos los estudiantes</span>
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
