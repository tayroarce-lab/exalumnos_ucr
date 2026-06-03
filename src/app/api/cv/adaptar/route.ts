import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { posicionId, curriculumId } = body

    if (!posicionId || !curriculumId) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    // 1. Obtener los datos de la posición
    const { data: posicion, error: posError } = await supabase
      .from('posiciones')
      .select('titulo, descripcion_general, habilidades_requeridas, responsabilidades')
      .eq('id', posicionId)
      .single()

    if (posError || !posicion) {
      return NextResponse.json({ error: 'No se encontró la posición' }, { status: 404 })
    }

    // 2. Obtener el CV base del estudiante
    const { data: curriculum, error: cvError } = await supabase
      .from('curriculum')
      .select('cursos_relevantes, proyecto_graduacion_resumen, habilidades_tecnicas, habilidades_blandas')
      .eq('id', curriculumId)
      .single()

    if (cvError || !curriculum) {
      return NextResponse.json({ error: 'No se encontró el curriculum' }, { status: 404 })
    }

    // 2.5 Verificar límite de uso (Máximo 10 versiones para proteger API)
    const { count, error: countError } = await supabase
      .from('curriculum_versiones')
      .select('id', { count: 'exact', head: true })
      .eq('curriculum_id', curriculumId)

    if (countError) {
      return NextResponse.json({ error: 'Error verificando límites de uso' }, { status: 500 })
    }

    if (count !== null && count >= 10) {
      return NextResponse.json({ error: 'Has alcanzado el límite máximo de 10 versiones adaptadas por cuenta.' }, { status: 403 })
    }

    // 3. Obtener la experiencia
    const { data: experiencia } = await supabase
      .from('curriculum_experiencia')
      .select('tipo, titulo, organizacion, bullets')
      .eq('curriculum_id', curriculumId)

    const systemPrompt = `
      Eres un reclutador experto que adapta curriculums vitae para resaltar la compatibilidad de un candidato con una vacante específica.
      Se te proveerá la información de la vacante y el CV original del candidato.
      Debes devolver un objeto JSON con dos claves:
      - "contenido_adaptado": Un resumen adaptado (máx 150 palabras) y la lista de las 3 habilidades técnicas/blandas más relevantes que el candidato ya posee.
      - "sugerencias_ia": Una lista de sugerencias cortas sobre qué puntos el candidato podría mejorar o resaltar en una entrevista.
      Asegúrate de que la salida sea estrictamente JSON válido y nada más.
    `

    const userPrompt = `
      Vacante:
      Título: ${posicion.titulo}
      Descripción: ${posicion.descripcion_general}
      Habilidades Requeridas: ${posicion.habilidades_requeridas.join(', ')}

      CV Candidato:
      Habilidades Técnicas: ${JSON.stringify(curriculum.habilidades_tecnicas)}
      Habilidades Blandas: ${curriculum.habilidades_blandas.join(', ')}
      Cursos: ${curriculum.cursos_relevantes.join(', ')}
      Experiencias: ${JSON.stringify(experiencia)}
    `

    // 4. Llamar a Claude
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ]
    })

    const textContent = (msg.content[0] as any).text
    
    // Validar JSON
    let resultadoIA;
    try {
      resultadoIA = JSON.parse(textContent)
    } catch (e) {
      // Intento de extraer JSON si el modelo agregó texto extra
      const match = textContent.match(/\{[\s\S]*\}/)
      if (match) {
        resultadoIA = JSON.parse(match[0])
      } else {
        throw new Error('Claude no devolvió un JSON válido')
      }
    }

    // 5. Guardar la versión en BD
    const { data: versionGuardada, error: insertError } = await supabase
      .from('curriculum_versiones')
      .insert({
        curriculum_id: curriculumId,
        posicion_id: posicionId,
        nombre_version: `Versión para ${posicion.titulo}`,
        contenido_adaptado: resultadoIA.contenido_adaptado,
        sugerencias_ia: resultadoIA.sugerencias_ia
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
         return NextResponse.json({ error: 'Ya existe una versión generada para esta posición' }, { status: 400 })
      }
      throw new Error(insertError.message)
    }

    return NextResponse.json({ success: true, data: versionGuardada })

  } catch (error: any) {
    console.error('Error adaptando CV:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
