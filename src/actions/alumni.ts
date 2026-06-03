'use server'

import { createClient } from '@/lib/supabase/server'

type DatosExalumno = {
  exalumno_id: string
  carrera_ucr?: string
  empresa_actual?: string
  cargo_actual?: string
  sector_industry?: string
  areas_de_interes?: string[]
  ofrece_mentoria?: boolean
  ofrece_empleo?: boolean
  ofrece_pasantia?: boolean
  ofrece_proyecto?: boolean
  ofrece_donacion_dinero?: boolean
}

// Rutas: PUT /api/alumni/profile
export async function configurarPerfilExalumno(datos: DatosExalumno) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('exalumnos')
    .upsert(datos)

  if (error) throw new Error(error.message)
  return { success: true }
}
