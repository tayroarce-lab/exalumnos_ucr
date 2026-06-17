import React from "react";
import { getEstudianteById } from "@/lib/api";
import DirectoryBackground from "@/components/ui/DirectoryBackground";
import FormularioDonacion from "./_components/FormularioDonacion";

export default async function DonacionesPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const proyectoId = typeof searchParams.proyecto === 'string' ? searchParams.proyecto : null;
  
  let estudiante = null;
  if (proyectoId) {
    estudiante = await getEstudianteById(proyectoId);
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#E0F2FE] via-white to-[#FFEAD2]/70 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 overflow-hidden">
      <DirectoryBackground />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#003B4F] mb-3 font-sans tracking-tight">
            Ofrecer Apoyo Económico
          </h1>
          <p className="text-slate-600 font-medium max-w-2xl mx-auto">
            {estudiante 
              ? `Estás apoyando el proyecto de ${estudiante.nombre}. Completa el formulario y adjunta tu comprobante de transferencia.` 
              : "Tu apoyo ayuda a hacer realidad proyectos innovadores. Completa el formulario para registrar tu donación."}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#B3DCEE]/60 shadow-xl overflow-hidden backdrop-blur-sm bg-white/95">
          <FormularioDonacion estudiante={estudiante} />
        </div>
      </div>
    </div>
  );
}
