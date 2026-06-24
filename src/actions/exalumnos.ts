'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function completarOnboardingExalumno(datos: {
  empresa_actual?: string;
  cargo_actual?: string;
  sector_industria?: string;
  anos_experiencia?: number;
  pais_ciudad?: string;
  linkedin_url?: string;
  areas_de_interes: string[];
  ofrece_mentoria: boolean;
  horas_mes_mentoria?: number;
  ofrece_empleo: boolean;
  ofrece_pasantia: boolean;
  ofrece_proyecto: boolean;
  ofrece_donacion_dinero: boolean;
  monto_maximo_donacion?: number;
  moneda_donacion?: string;
  bio?: string;
  habilidades: string[];
  foto_url?: string;
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('No autenticado')
    }

    const adminClient = createAdminClient()

    // 1. Obtener la data existente para la tabla exalumnos (necesitamos los académicos básicos)
    const { data: currentUserData } = await adminClient
      .from('users')
      .select('nombre, apellidos, foto_url')
      .eq('id', user.id)
      .single()
      
    const { data: currentProfile } = await adminClient
      .from('profiles')
      .select('academic, full_name, anio_graduacion')
      .eq('id', user.id)
      .single()

    const { data: currentExalumno } = await adminClient
      .from('exalumnos')
      .select('carrera_ucr, escuela_facultad, anio_graduacion')
      .eq('id', user.id)
      .maybeSingle()

    // 2. Upsert en tabla "profiles"
    const profilePayload = {
      id: user.id,
      empresa_actual: datos.empresa_actual || null,
      cargo_actual: datos.cargo_actual || null,
      sector_industria: datos.sector_industria ? [datos.sector_industria] : null,
      anos_experiencia: datos.anos_experiencia || null,
      pais_ciudad: datos.pais_ciudad || null,
      linkedin_url: datos.linkedin_url || null,
      areas_de_interes: datos.areas_de_interes,
      ofrece_mentoria: datos.ofrece_mentoria,
      horas_mes_mentoria: datos.horas_mes_mentoria || null,
      ofrece_empleo: datos.ofrece_empleo,
      ofrece_pasantia: datos.ofrece_pasantia,
      ofrece_proyecto: datos.ofrece_proyecto,
      ofrece_donacion_dinero: datos.ofrece_donacion_dinero,
      monto_maximo_donacion: datos.monto_maximo_donacion || null,
      moneda_donacion: datos.moneda_donacion || null,
      bio: datos.bio || null,
      foto_url: datos.foto_url || null,
      perfil_completo: 1 as any,
      es_exalumno: true
    }

    const { error: profilesError } = await adminClient
      .from('profiles')
      .upsert(profilePayload)

    if (profilesError) {
      logError('exalumnos.ts/completarOnboardingExalumno', profilesError, { userId: user.id })
      throw new Error('Error al actualizar el perfil público.')
    }

    // 3. Upsert en tabla legacy "exalumnos"
    const exalumnoPayload = {
      id: user.id,
      user_id: user.id,
      carrera_ucr: currentExalumno?.carrera_ucr || currentProfile?.academic?.[0]?.carrera || 'No especificada',
      escuela_facultad: currentExalumno?.escuela_facultad || currentProfile?.academic?.[0]?.escuela || 'No especificada',
      anio_graduacion: currentExalumno?.anio_graduacion || currentProfile?.anio_graduacion || 2000,
      empresa_actual: datos.empresa_actual || 'No especificada',
      cargo_actual: datos.cargo_actual || 'No especificada',
      sector_industria: datos.sector_industria ? [datos.sector_industria] : [],
      anios_experiencia: datos.anos_experiencia || 0,
      pais_ciudad: datos.pais_ciudad || 'No especificada',
      linkedin_url: datos.linkedin_url || '',
      areas_de_interes: datos.areas_de_interes,
      ofrece_mentoria: datos.ofrece_mentoria,
      horas_mes_mentoria: datos.horas_mes_mentoria || null,
      ofrece_empleo: datos.ofrece_empleo,
      ofrece_pasantia: datos.ofrece_pasantia,
      ofrece_proyecto: datos.ofrece_proyecto,
      ofrece_donacion_dinero: datos.ofrece_donacion_dinero,
      monto_maximo_donacion: datos.monto_maximo_donacion || null,
      moneda_donacion: datos.moneda_donacion || null,
      bio: datos.bio || '',
      visible_en_directorio: true,
      perfil_completo: true
    }

    const { error: exalumnosError } = await adminClient
      .from('exalumnos')
      .upsert(exalumnoPayload, { onConflict: 'id' })

    if (exalumnosError) {
      logError('exalumnos.ts/completarOnboardingExalumno', exalumnosError, { userId: user.id })
      // No lanzamos error para no bloquear, profile ya está
    }

    // 4. Actualizar tabla "users" (no actualizar areas_de_interes ni perfil_completo ya que no existen)
    const { error: usersError } = await adminClient
      .from('users')
      .update({
        ofrece_mentoria: datos.ofrece_mentoria
      })
      .eq('id', user.id)

    if (usersError) {
      logError('exalumnos.ts/completarOnboardingExalumno', usersError, { userId: user.id })
    }

    // 5. Manejar Skills (Habilidades) a través de curriculums y curriculum_skills si es necesario
    // Para no complicarlo de más, la tabla curriculums maneja skills
    // Intentaremos hacer un upsert básico en curriculums para vincular las habilidades
      const { data: currentCv } = await adminClient.from('curriculums').select('id').eq('user_id', user.id).maybeSingle()
      if (!currentCv) {
        await adminClient.from('curriculums').insert({
          user_id: user.id,
          habilidades_blandas: datos.habilidades || [],
          sobre_mi: datos.bio || ''
        })
      } else {
        await adminClient.from('curriculums').update({
          habilidades_blandas: datos.habilidades || [],
          sobre_mi: datos.bio || ''
        }).eq('id', currentCv.id)
      }

    revalidatePath('/dashboard')
    revalidatePath('/network')
    
    return { success: true }
  } catch (err: any) {
    logError('exalumnos.ts/completarOnboardingExalumno', err)
    return { success: false, error: err.message || 'Error inesperado' }
  }
}
