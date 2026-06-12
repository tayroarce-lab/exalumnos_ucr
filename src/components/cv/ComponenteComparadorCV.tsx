'use client';

import React, { useState, useEffect } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { DatosCV } from '@/components/cv/CVLiveContext';
import { guardarVersionAdaptada } from '@/actions/accionGuardarVersion';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Check, X, Edit2, CheckCircle } from 'lucide-react';

const outputSchema = z.object({
  sugerencias: z.array(
    z.object({
      seccionIdentifier: z.enum(['academica', 'experiencia', 'habilidades', 'certificaciones']),
      bloqueId: z.string(),
      campoIdentifier: z.string(),
      textoOriginal: z.string(),
      textoSugerido: z.string(),
      justificacionReclutador: z.string()
    })
  )
});

type Sugerencia = z.infer<typeof outputSchema>['sugerencias'][0];

interface ComponenteComparadorCVProps {
  posicionId: string;
  posicionDetalle: { titulo: string; descripcion: string; requisitos: string };
  cvBase: DatosCV;
}

export default function ComponenteComparadorCV({ posicionId, posicionDetalle, cvBase }: ComponenteComparadorCVProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [cvAdaptado, setCvAdaptado] = useState<DatosCV>(JSON.parse(JSON.stringify(cvBase))); // Deep copy
  const [sugerenciasProcesadas, setSugerenciasProcesadas] = useState<Record<string, 'aceptada' | 'descartada' | 'editada' | null>>({});
  const [editandoTexto, setEditandoTexto] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

  const { object, isLoading, submit } = useObject({
    api: '/api/cv/adaptar',
    schema: outputSchema,
    initialValue: { sugerencias: [] },
  });

  useEffect(() => {
    // Iniciar el stream automáticamente al montar
    submit({ posicionId, cvBase, posicionDetalle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aplicarCambio = (sugerencia: Sugerencia, textoFinal: string) => {
    const nuevoCV = { ...cvAdaptado };

    // Lógica para aplicar el cambio en el CV Adaptado según la sección
    if (sugerencia.seccionIdentifier === 'experiencia') {
      const index = parseInt(sugerencia.bloqueId, 10);
      if (!isNaN(index) && nuevoCV.experiences[index]) {
        if (sugerencia.campoIdentifier.startsWith('bullet_')) {
          const bulletIndex = parseInt(sugerencia.campoIdentifier.split('_')[1], 10);
          if (!isNaN(bulletIndex) && nuevoCV.experiences[index].bullets) {
            nuevoCV.experiences[index].bullets[bulletIndex] = textoFinal;
          }
        } else {
          (nuevoCV.experiences[index] as any)[sugerencia.campoIdentifier] = textoFinal;
        }
      }
    }
    // Añadir lógica similar para otras secciones si aplica

    setCvAdaptado(nuevoCV);
  };

  const handleAceptar = (sugerencia: Sugerencia, id: string) => {
    aplicarCambio(sugerencia, sugerencia.textoSugerido);
    setSugerenciasProcesadas(prev => ({ ...prev, [id]: 'aceptada' }));
  };

  const handleDescartar = (id: string) => {
    setSugerenciasProcesadas(prev => ({ ...prev, [id]: 'descartada' }));
  };

  const handleEditar = (id: string, textoSugerido: string) => {
    setIsEditing(prev => ({ ...prev, [id]: true }));
    if (!editandoTexto[id]) {
      setEditandoTexto(prev => ({ ...prev, [id]: textoSugerido }));
    }
  };

  const handleConfirmarEdicion = (sugerencia: Sugerencia, id: string) => {
    const textoFinal = editandoTexto[id] || sugerencia.textoSugerido;
    aplicarCambio(sugerencia, textoFinal);
    setIsEditing(prev => ({ ...prev, [id]: false }));
    setSugerenciasProcesadas(prev => ({ ...prev, [id]: 'editada' }));
  };

  const handleGuardar = async () => {
    try {
      const res = await guardarVersionAdaptada(posicionId, `Versión para: ${posicionDetalle.titulo}`, cvAdaptado);
      if (res.success) {
        toast({ title: 'Éxito', description: 'Versión adaptada guardada correctamente.' });
        router.push(`/jobs/${posicionId}`);
      } else {
        toast({ title: 'Error', description: res.error, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Ocurrió un error al guardar.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto p-4">
      {/* Columna Izquierda: CV Actual */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tu CV Base</h2>
        <div className="space-y-6">
          {cvBase.experiences.map((exp, i) => (
            <div key={i} className="border-b pb-4 last:border-b-0">
              <h3 className="font-medium text-lg">{exp.title} en {exp.organization}</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
                {exp.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Sugerencias de la IA */}
      <div className="flex-1 bg-gray-50 p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Sugerencias de la IA</h2>
          {isLoading && <span className="text-sm text-blue-600 animate-pulse">Generando sugerencias...</span>}
        </div>

        <div className="space-y-4">
          {object?.sugerencias?.map((sug: Sugerencia | undefined, idx: number) => {
            if (!sug) return null;
            const uniqueId = `${sug.seccionIdentifier}-${sug.bloqueId}-${sug.campoIdentifier}-${idx}`;
            const estado = sugerenciasProcesadas[uniqueId];

            return (
              <div 
                key={uniqueId} 
                className={`p-4 rounded-md border transition-colors ${estado === 'aceptada' ? 'bg-green-50 border-green-200' : estado === 'descartada' ? 'bg-gray-100 border-gray-200 opacity-60' : estado === 'editada' ? 'bg-blue-50 border-blue-200' : 'bg-white border-blue-100 shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {sug.seccionIdentifier} / {sug.campoIdentifier}
                  </span>
                  {estado && (
                    <span className="text-xs font-medium text-gray-500 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Procesada
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-500 line-through mb-2">{sug.textoOriginal}</div>
                
                {isEditing[uniqueId] ? (
                  <div className="mb-3">
                    <textarea 
                      className="w-full text-sm p-2 border rounded-md min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={editandoTexto[uniqueId]}
                      onChange={(e) => setEditandoTexto(prev => ({ ...prev, [uniqueId]: e.target.value }))}
                    />
                    <div className="flex justify-end mt-2">
                      <button 
                        onClick={() => handleConfirmarEdicion(sug, uniqueId)}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                      >
                        Confirmar Edición
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`text-sm font-medium mb-3 ${estado === 'aceptada' || estado === 'editada' ? 'text-green-700' : 'text-gray-800'}`}>
                    {estado === 'editada' ? editandoTexto[uniqueId] : sug.textoSugerido}
                  </div>
                )}

                <div className="bg-yellow-50 text-yellow-800 text-xs p-2 rounded border border-yellow-100 mb-3 italic">
                  💡 {sug.justificacionReclutador}
                </div>

                {!estado && !isEditing[uniqueId] && (
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleAceptar(sug, uniqueId)}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 rounded text-sm transition"
                    >
                      <Check className="w-4 h-4" /> Aceptar
                    </button>
                    <button 
                      onClick={() => handleEditar(uniqueId, sug.textoSugerido)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 px-3 rounded text-sm transition"
                    >
                      <Edit2 className="w-4 h-4" /> Editar
                    </button>
                    <button 
                      onClick={() => handleDescartar(uniqueId)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 py-1.5 px-3 rounded text-sm transition"
                    >
                      <X className="w-4 h-4" /> Descartar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isLoading && object?.sugerencias && object.sugerencias.length > 0 && (
          <div className="mt-8">
            <button 
              onClick={handleGuardar}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-center items-center gap-2"
            >
              Guardar Versión Adaptada
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
