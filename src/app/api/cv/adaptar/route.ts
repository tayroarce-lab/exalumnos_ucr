import { createClient } from '@/lib/supabase/server';
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { posicionId, cvBase, posicionDetalle } = await req.json();

    const outputSchema = z.object({
      sugerencias: z.array(
        z.object({
          seccionIdentifier: z.enum(['academica', 'experiencia', 'habilidades', 'certificaciones']),
          bloqueId: z.string().describe('El ID o índice del bloque dentro de la sección para identificarlo.'),
          campoIdentifier: z.string().describe('El nombre del campo (ej: "descripcion", "bullet_1").'),
          textoOriginal: z.string(),
          textoSugerido: z.string(),
          justificacionReclutador: z.string().describe('Explicación textual de por qué se sugiere el cambio o qué información real debe añadir el estudiante.')
        })
      )
    });

    const result = await streamObject({
      model: openai('gpt-4o-mini'),
      schema: outputSchema,
      system: `Actúa como un Reclutador Profesional Senior experto en optimización de CVs para sistemas ATS.
REGLAS DE REESCRITURA STRICTAS:
- Inicia cada bullet obligatoriamente con un verbo de acción conjugado en primera persona implícita (ej: "Desarrollé", "Optimicé", "Implementé"). No uses "Yo".
- Si el texto original carece de métricas, sugiere una reescritura que incorpore placeholders numéricos claros (ej: "Mejoré la eficiencia en un [X]%").
- Integra palabras clave exactas provistas en la descripción y requisitos del puesto.
- Elimina relleno corporativo como "responsable de..." o "encargado de apoyar...". Ve directo al grano.
- CRÍTICO: No inventes credenciales, empresas, tecnologías ni títulos académicos que no estén explícitamente en el cvBase. Si falta información vital para hacer una sección competitiva, rellena la propiedad justificacionReclutador indicando textualmente qué información real debe añadir el estudiante, en lugar de alucinarla.`,
      prompt: `Optimiza el siguiente CV para adaptarlo a esta posición.

POSICIÓN:
Título: ${posicionDetalle.titulo}
Descripción: ${posicionDetalle.descripcion}
Requisitos: ${posicionDetalle.requisitos}

CV BASE:
${JSON.stringify(cvBase, null, 2)}`
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in CV adaptation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
