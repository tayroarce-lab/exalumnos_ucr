import React from 'react';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToStream } from '@react-pdf/renderer';
import { CVDocument } from '@/lib/pdf/CVDocument';
import { getFullCvData } from '@/app/actions/cv/profile.actions';

// Explícito y obligatorio para que @react-pdf/renderer funcione en Next.js App Router
export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener los datos completos del CV del usuario
    const cvResponse = await getFullCvData();
    if (!cvResponse.success || !cvResponse.data) {
      return NextResponse.json({ error: cvResponse.message || 'Error obteniendo CV' }, { status: 404 });
    }

    const cvData = cvResponse.data;

    // Construir los datos del perfil
    const profileConDatos = {
      ...(cvData as any),
      email: user.email,
      user_metadata: {
        nombre: user.user_metadata?.full_name || user.user_metadata?.nombre || 'Estudiante UCR'
      }
    };
    (cvData as any).profile = profileConDatos;

    // Generar el stream del PDF usando la plantilla React
    const stream = await renderToStream(React.createElement(CVDocument, { data: cvData }) as any);

    // Construir la respuesta HTTP enviando el stream directamente
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv-exalumnos-ucr.pdf"',
      },
    });

  } catch (error: any) {
    console.error('Export PDF API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor generando el PDF' }, { status: 500 });
  }
}
