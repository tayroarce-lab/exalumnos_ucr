import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstudianteById, getEstudiantesRelacionados } from "@/lib/api";
import GrillaEstudiantes from "../_components/GrillaEstudiantes";
import { EstudianteDirectorio } from "@/types/estudiantes";

export default async function PerfilEstudiantePage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const estudiante = await getEstudianteById(params.id);

  if (!estudiante) {
    notFound();
  }

  const estudiantesRelacionados = await getEstudiantesRelacionados(
    estudiante.user_id,
    estudiante.proyecto_area_tematica
  );

  const tagsApoyo = getTagsApoyo(estudiante);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navegación */}
        <div className="mb-6">
          <Link 
            href="/directorio/estudiantes/todos" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-esmeralda transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
            Volver al Directorio
          </Link>
        </div>

        {/* Tarjeta Principal (Encabezado y Botones) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
              {estudiante.foto_url ? (
                <img src={estudiante.foto_url} alt={estudiante.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 font-semibold text-4xl">
                  {estudiante.nombre.charAt(0)}
                </span>
              )}
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 mb-2">
                    {estudiante.nombre}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1 font-medium text-esmeralda bg-esmeralda/10 px-2.5 py-1 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 5v17"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/></svg>
                      {estudiante.carrera}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {estudiante.sede}
                    </span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                  <button className="w-full md:w-48 inline-flex justify-center items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 bg-esmeralda text-white hover:bg-esmeralda/90 h-10 px-4 py-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>
                    Ofrecer apoyo
                  </button>
                  <button className="w-full md:w-48 inline-flex justify-center items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 h-10 px-4 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                    Compartir perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dos columnas de información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Columna Izquierda (Proyecto) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-celeste"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Información del Proyecto
              </h2>
              
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {estudiante.proyecto_area_tematica}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {estudiante.proyecto_tipo}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-snug">
                  {estudiante.proyecto_titulo || "Proyecto en definición"}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {estudiante.proyecto_descripcion || 
                    "El estudiante se encuentra desarrollando un proyecto innovador que busca generar impacto en su área de estudio. Para conocer más detalles técnicos o específicos, te invitamos a ponerte en contacto directamente."}
                </p>
              </div>

              {/* Barra de Progreso */}
              <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Avance General del Proyecto</span>
                  <span className="text-sm font-bold text-esmeralda">{estudiante.proyecto_porcentaje_avance || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-esmeralda h-2.5 rounded-full" 
                    style={{ width: `${estudiante.proyecto_porcentaje_avance || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha (Info Académica y Tags) */}
          <div className="space-y-6">
            
            {/* Buscando Apoyo En */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                Buscando Apoyo En
              </h2>
              {tagsApoyo.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tagsApoyo.map((apoyo, idx) => (
                    <span key={idx} className="inline-flex items-center rounded bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200/50">
                      {apoyo}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No especificado en este momento.</p>
              )}
            </div>

            {/* Áreas de Interés */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                Áreas de Interés
              </h2>
              {estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {estudiante.areas_de_interes.map((interes, idx) => (
                    <span key={idx} className="inline-flex items-center rounded bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 border border-blue-200/50">
                      {interes}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sin intereses registrados.</p>
              )}
            </div>

            {/* Info Académica */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                Información Académica
              </h2>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Carrera</dt>
                  <dd className="text-slate-900 font-medium">{estudiante.carrera}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Facultad / Escuela</dt>
                  <dd className="text-slate-900">{estudiante.escuela_facultad || "Facultad de la Universidad de Costa Rica"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Sede UCR</dt>
                  <dd className="text-slate-900">{estudiante.sede}</dd>
                </div>
              </dl>
            </div>

          </div>
        </div>

        {/* Sección de Estudiantes Relacionados */}
        {estudiantesRelacionados.length > 0 && (
          <div className="pt-10 mt-10 border-t border-slate-200">
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">
              Otros proyectos que podrían interesarte
            </h2>
            <p className="text-slate-500 mb-6">
              Descubre estudiantes trabajando en el área de <span className="font-medium text-slate-700">{estudiante.proyecto_area_tematica}</span>.
            </p>
            
            <GrillaEstudiantes estudiantes={estudiantesRelacionados} />
          </div>
        )}
      </div>
    </div>
  );
}

// Función auxiliar
function getTagsApoyo(estudiante: EstudianteDirectorio) {
  const tags = [];
  if (estudiante.busca_financiamiento) tags.push("Financiamiento");
  if (estudiante.busca_mentoria) tags.push("Mentoría");
  if (estudiante.busca_empleo) tags.push("Empleo");
  if (estudiante.busca_pasantia) tags.push("Pasantía");
  return tags;
}
