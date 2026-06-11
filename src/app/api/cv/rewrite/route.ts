import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { bullet } = await req.json();

    if (!bullet || typeof bullet !== 'string') {
      return NextResponse.json({ error: 'El texto es requerido' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Configuración de IA faltante' }, { status: 500 });
    }

    const systemPrompt = `Eres un Reclutador Senior técnico especializado en CVs optimizados para ATS.
Reescribe el logro recibido usando verbos de acción en pasado y resultados cuantificables.
Restricción absoluta: el output debe tener máximo 120 caracteres incluyendo espacios.
Si no cabe sin perder contexto, prioriza la métrica numérica sobre descripciones cualitativas.
Responde ÚNICAMENTE con el texto reescrito. Sin comillas, sin explicaciones, sin prefijos.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        max_tokens: 60,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: bullet }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI Error:', err);
      return NextResponse.json({ error: 'Error del servicio de IA' }, { status: 502 });
    }

    const data = await response.json();
    let rewritten = data.choices?.[0]?.message?.content?.trim() || '';

    // Mitigación "Fail-Soft": Si es mayor a 120, igual lo devolvemos pero el frontend se encarga de mostrar el contador en rojo
    return NextResponse.json({ rewritten });
  } catch (error: any) {
    console.error('Rewrite API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
