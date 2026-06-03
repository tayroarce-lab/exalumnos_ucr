'use server'

import { createClient } from '@/lib/supabase/server'

// Rutas: POST /api/applications/send
export async function enviarAplicacion(estudianteId: string, exalumnoId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('matches')
    .insert({
      estudiante_id: estudianteId,
      exalumno_id: exalumnoId,
      estado: 'contactado'
    })

  if (error) throw new Error(error.message)
  return { success: true }
}

// Rutas: PATCH /api/applications/status
export async function gestionarEstadoAplicacion(matchId: string, nuevoEstado: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('matches')
    .update({ estado: nuevoEstado })
    .eq('id', matchId)

  if (error) throw new Error(error.message)
  return { success: true }
}
