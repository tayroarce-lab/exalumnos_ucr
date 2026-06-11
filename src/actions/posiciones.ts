'use server'

import { createClient } from '@/lib/supabase/server'
import { PosicionSchema, PosicionFormValues } from '@/lib/validations/posiciones'
import { revalidatePath } from 'next/cache'

export async function crearPosicion(data: PosicionFormValues) {
  try {
    const supabase = await createClient()

    // 1. Verificación de Autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'No autenticado' }
    }

    // 2. Verificación de Perfil de Exalumno y Completitud
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('es_exalumno, perfil_completo')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.es_exalumno) {
      return { success: false, error: 'Solo exalumnos pueden publicar posiciones' }
    }

    if ((profile as any).perfil_completo !== 100) {
      return { success: false, error: 'Debe completar su perfil al 100% para publicar' }
    }

    // 3. Validación Zod Estricta en Backend
    const parsed = PosicionSchema.safeParse(data)
    if (!parsed.success) {
      return { 
        success: false, 
        error: 'Datos inválidos', 
        details: parsed.error.flatten().fieldErrors 
      }
    }

    const validData = parsed.data

    // 4. Inserción en la base de datos
    const { data: newPosicion, error: dbError } = await supabase
      .from('posiciones')
      .insert({
        exalumno_id: user.id,
        titulo: validData.titulo,
        tipo: validData.tipo,
        modalidad: validData.modalidad,
        jornada: validData.jornada,
        lugar: validData.lugar,
        empresa: validData.empresa,
        sector: validData.sector,
        fecha_limite: new Date(validData.fecha_limite).toISOString(),
        habilidades_requeridas: validData.habilidades_requeridas,
        descripcion_general: validData.descripcion_general,
        responsabilidades: validData.responsabilidades,
        contexto_equipo: validData.contexto_equipo || null,
        estado: 'activa' // Estado inicial por defecto
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error insertando posición:', dbError)
      return { success: false, error: 'Error al guardar la posición en la base de datos' }
    }

    // Revalidar las rutas donde se listan las posiciones
    revalidatePath('/network')
    revalidatePath('/posiciones')

    return { success: true, data: newPosicion }
  } catch (error: any) {
    console.error('Excepción en crearPosicion:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

export async function actualizarEstadoPosicion(posicionId: string, nuevoEstado: 'activa' | 'cerrada' | 'cubierta' | 'pausada') {
  try {
    const supabase = await createClient()

    // Autenticación y Autorización
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Verificar que el usuario es dueño de la posición
    const { data: posicion } = await supabase
      .from('posiciones')
      .select('exalumno_id, estado')
      .eq('id', posicionId)
      .single()

    if (!posicion || posicion.exalumno_id !== user.id) {
      return { success: false, error: 'No autorizado para modificar esta posición' }
    }

    if (posicion.estado === nuevoEstado) {
      return { success: true, message: 'El estado ya es ' + nuevoEstado }
    }

    // Actualizar estado
    const { error: updateError } = await supabase
      .from('posiciones')
      .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('id', posicionId)

    if (updateError) {
      return { success: false, error: 'Error al actualizar el estado' }
    }

    /*
     * Nota Arquitectónica: 
     * Si nuevoEstado === 'cubierta', el webhook de Supabase se disparará de forma asíncrona
     * hacia /api/webhooks/posiciones-cubiertas. 
     * También podríamos llamar directamente el email handler aquí si quisiéramos evitar webhooks:
     * if (nuevoEstado === 'cubierta') { await notifyStudentsPosicionCubierta(posicionId) }
     */

    revalidatePath('/posiciones')
    return { success: true }
  } catch (error) {
    console.error('Excepción en actualizarEstadoPosicion:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}
