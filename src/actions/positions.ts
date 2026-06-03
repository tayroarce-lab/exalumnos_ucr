'use server'

import { createClient } from '@/lib/supabase/server'

// Rutas: POST /api/positions/publish
export async function publicarPosicion(exalumnoId: string, flags: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('exalumnos')
    .update({ ...flags })
    .eq('exalumno_id', exalumnoId)

  if (error) throw new Error(error.message)
  return { success: true }
}

// Rutas: GET /api/positions/search
export async function listarPosicionesConFiltros(filtros: any) {
  const supabase = await createClient()
  let query = supabase.from('exalumnos').select('*')

  if (filtros.carrera_ucr) query = query.eq('carrera_ucr', filtros.carrera_ucr)
  if (filtros.sector_industria) query = query.eq('sector_industry', filtros.sector_industria)
  
  // Filtros combinados de tipo de apoyo
  if (filtros.ofrece_mentoria) query = query.eq('ofrece_mentoria', true)
  if (filtros.ofrece_empleo) query = query.eq('ofrece_empleo', true)
  if (filtros.ofrece_pasantia) query = query.eq('ofrece_pasantia', true)
  if (filtros.ofrece_proyecto) query = query.eq('ofrece_proyecto', true)
  if (filtros.ofrece_donacion_dinero) query = query.eq('ofrece_donacion_dinero', true)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}
