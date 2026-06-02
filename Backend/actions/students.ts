'use server'

import { createClient } from '@/lib/supabase/server'

type DatosEstudiante = {
  estudiante_id: string
  carrera?: string
  nivel_academico?: string
  beca_socioeconomica?: boolean
  proyecto_titulo?: string
  proyecto_descripcion?: string
  proyecto_area_tematica?: string
  proyecto_tipo?: string
  proyecto_porcentaje_avance?: number
  proyecto_necesidades?: string[]
  areas_de_interes?: string[]
  busca_financiamiento?: boolean
  busca_mentoria?: boolean
  busca_empleo?: boolean
  busca_pasantia?: boolean
}

// Rutas: PUT /api/students/profile
export async function actualizarPerfilEstudiante(datos: DatosEstudiante) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('estudiantes')
    .upsert(datos)

  if (error) throw new Error(error.message)
  return { success: true }
}
