import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ComponenteComparadorCV from '@/components/cv/ComponenteComparadorCV';
import { getOrCreateCvProfile, getFullCvData } from '@/app/actions/cv/profile.actions';

export const metadata = {
  title: 'Adaptar CV con IA | Fundación Exalumnos UCR',
};

export default async function AdaptarCVPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: posicionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">No autenticado</h1>
        <p className="mt-2 text-gray-600">Debes iniciar sesión para adaptar tu CV.</p>
      </div>
    );
  }

  // Obtener detalle de la posición
  let posicion;
  const { data: posData, error: posError } = await supabase
    .from('posiciones')
    .select('titulo, descripcion_general, habilidades_requeridas')
    .eq('id', posicionId)
    .maybeSingle();

  if (posError || !posData) {
    // Fallback a MOCK_JOBS para propósitos de prueba con IDs '1', '2', '3'
    if (['1', '2', '3'].includes(posicionId)) {
      posicion = {
        titulo: posicionId === '1' ? 'Desarrollador React Senior' : posicionId === '2' ? 'Analista de Datos Junior' : 'Diseñador UI/UX Senior',
        descripcion_general: 'Buscamos un excelente profesional para unirse a nuestro equipo con las mejores prácticas y tecnologías modernas.',
        habilidades_requeridas: ['React', 'TypeScript', 'Proactividad', 'Trabajo en equipo']
      };
    } else {
      notFound();
    }
  } else {
    posicion = posData;
  }

  // Asegurar que el perfil exista y obtener los datos
  await getOrCreateCvProfile();
  const cvResponse = await getFullCvData();

  if (!cvResponse.success || !cvResponse.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Error cargando tu CV</h1>
        <p className="mt-2 text-gray-600">{cvResponse.message}</p>
      </div>
    );
  }

  // Construir cvBase a partir de los datos retornados por getFullCvData
  const cvBase = {
    academic: cvResponse.data.academic || null,
    experiences: (cvResponse.data.experiences || []).map((exp: any) => ({
      experience_type: exp.experience_type || 'Empleo',
      title: exp.title,
      organization: exp.organization,
      start_year: exp.start_year,
      start_month: exp.start_month,
      end_year: exp.end_year,
      end_month: exp.end_month,
      bullets: exp.bullets || []
    })),
    skills: (cvResponse.data.skills || []).map((skill: any) => ({
      nombre: skill.name,
      nivel: skill.level || 'Básico'
    })),
    certifications: (cvResponse.data.certifications || []).map((cert: any) => ({
      nombre: cert.name,
      institucion: cert.institution,
      fecha: cert.issued_year ? `${cert.issued_year}-${cert.issued_month || '01'}-01` : '',
      url_verificacion: cert.verification_url || ''
    }))
  };

  const posicionDetalle = {
    titulo: posicion.titulo,
    descripcion: posicion.descripcion_general,
    requisitos: Array.isArray(posicion.habilidades_requeridas) 
      ? posicion.habilidades_requeridas.join(', ') 
      : posicion.habilidades_requeridas || 'No especificados'
  };

  return (
    <div className="py-8 px-4 w-full">
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Optimiza tu CV con IA</h1>
        <p className="text-gray-600">
          Adaptando para la vacante: <span className="font-semibold text-gray-800">{posicion.titulo}</span>
        </p>
      </div>

      <ComponenteComparadorCV 
        posicionId={posicionId} 
        posicionDetalle={posicionDetalle} 
        cvBase={cvBase as any} 
      />
    </div>
  );
}
