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
  const { filtros, pagina } = parseSearchParams(searchParams);
  const { estudiantes, total } = await getEstudiantes(filtros, { page: pagina, limit: 12 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F34B26] via-[#ff7c5c] to-[#F34B26] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-inner w-full relative overflow-hidden text-slate-900">
      <div className="max-w-none mx-auto w-full relative z-10">
        <DirectorioClient 
          estudiantesIniciales={estudiantes} 
          totalInicial={total} 
          filtrosIniciales={filtros}
          paginaInicial={pagina}
        />
      </div>
    </div>
  );
}
