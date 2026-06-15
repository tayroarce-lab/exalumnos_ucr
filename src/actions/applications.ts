'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createApplicationSchema, updateApplicationStatusSchema, CreateApplicationInput, UpdateApplicationStatusInput } from '@/lib/validations/application'
import { calculateCompatibilityScore } from '@/lib/applications/compatibility'

// Placeholder for email notification functions to be implemented in FASE 5
import { 
  sendApplicationReceivedEmail, 
  sendApplicationSelectedEmail, 
  sendApplicationDiscardedEmail 
} from '@/lib/email/application-emails'

export async function applyToPosition(data: CreateApplicationInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Validar input
    const parsedData = createApplicationSchema.parse(data)

    // Verificar que sea estudiante
    const { data: studentUser, error: roleError } = await supabase
      .from('users')
      .select('nombre, rol')
      .eq('id', user.id)
      .single()

    if (roleError || studentUser?.rol !== 'estudiante') {
      return { success: false, error: 'Solo los estudiantes pueden aplicar a posiciones' }
    }

    // Obtener datos del estudiante para el score
    const { data: studentProfile } = await supabase
      .from('estudiantes')
      .select('carrera, habilidades, sede, areas_de_interes')
      .eq('user_id', user.id)
      .single()

    // Obtener datos de la posición y el exalumno
    const { data: position, error: posError } = await supabase
      .from('posiciones')
      .select('exalumno_id, estado, titulo, habilidades_requeridas, sector, lugar, exalumno:users!posiciones_exalumno_id_fkey(nombre, email)')
      .eq('id', parsedData.position_id)
      .single()

    if (posError || !position) return { success: false, error: 'Posición no encontrada' }
    if (position.estado !== 'activa') return { success: false, error: 'La posición ya no está activa' }

    // Calcular score si tenemos perfil
    let score = 0
    if (studentProfile) {
      score = calculateCompatibilityScore(
        {
          carrera: studentProfile.carrera || '',
          habilidades: studentProfile.habilidades || [],
          sede: studentProfile.sede || '',
          areas_de_interes: studentProfile.areas_de_interes || []
        },
        {
          habilidades_requeridas: position.habilidades_requeridas || [],
          sector: position.sector || [],
          lugar: position.lugar
        }
      )
    }

    // Insertar la aplicación
    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        position_id: parsedData.position_id,
        student_id: user.id,
        alumni_id: position.exalumno_id,
        cv_id: parsedData.cv_id || null,
        message: parsedData.message || null,
        status: 'enviada',
        compatibility_score: score
      })
      .select('id')
      .single()

    if (insertError) {
      if (insertError.code === '23505') return { success: false, error: 'Ya aplicaste a esta posición' }
      console.error(insertError)
      return { success: false, error: 'Error al registrar tu aplicación' }
    }

    // Insertar notificación en la base de datos (In-app)
    await supabase.from('notifications').insert({
      user_id: position.exalumno_id,
      type: 'nueva_aplicacion',
      title: 'Nueva Aplicación Recibida',
      content: `${studentUser.nombre} ha aplicado a tu posición: ${position.titulo}`,
      link_url: `/mis-posiciones/${parsedData.position_id}/aplicantes`
    })

    // Enviar correo al exalumno
    const alumniEmail = (position.exalumno as any)?.email
    const alumniName = (position.exalumno as any)?.nombre
    
    if (alumniEmail && alumniName) {
      await sendApplicationReceivedEmail({
        alumniEmail,
        alumniName,
        studentName: studentUser.nombre,
        positionTitle: position.titulo,
        applicationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/mis-posiciones/${parsedData.position_id}/aplicantes`
      }).catch(console.error)
    }

    revalidatePath('/mis-aplicaciones')
    revalidatePath(`/jobs/${parsedData.position_id}`)
    
    return { success: true, application_id: application.id }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error inesperado' }
  }
}

export async function withdrawApplication(application_id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Verificar propiedad y estado
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('status, student_id')
      .eq('id', application_id)
      .single()

    if (appError || !app) return { success: false, error: 'Aplicación no encontrada' }
    if (app.student_id !== user.id) return { success: false, error: 'No autorizado' }
    if (app.status !== 'enviada') return { success: false, error: 'No puedes retirar una aplicación que ya está en proceso' }

    // Eliminar
    const { error: delError } = await supabase
      .from('applications')
      .delete()
      .eq('id', application_id)

    if (delError) throw delError

    revalidatePath('/mis-aplicaciones')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Error al retirar la aplicación' }
  }
}

export async function getMyApplications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('applications')
    .select(`
      id, position_id, status, message, created_at,
      position:posiciones(titulo, exalumno:users!posiciones_exalumno_id_fkey(nombre))
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  // Format data
  return data.map(app => ({
    id: app.id,
    position_id: app.position_id,
    status: app.status,
    message: app.message,
    created_at: app.created_at,
    position: {
      titulo: (app.position as any)?.titulo || 'Posición desconocida',
      alumni_name: ((app.position as any)?.exalumno as any)?.nombre || 'Exalumno'
    }
  }))
}

export async function getPositionApplications(position_id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Obtener aplicaciones (El RLS protege que solo el dueño las vea)
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      studentUser:users!applications_student_id_fkey(
        nombre, email, foto_url,
        estudiantes(carrera, sede)
      ),
      cv:cv_profiles(id)
    `)
    .eq('position_id', position_id)
    .order('compatibility_score', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return data.map(app => {
    // Aquí podríamos generar o pedir URLs firmadas para el CV si aplica
    const studentUserObj = app.studentUser as any;
    const studentProfileObj = studentUserObj?.estudiantes?.[0] || studentUserObj?.estudiantes;
    
    return {
      ...app,
      student: {
        id: app.student_id,
        nombre: studentUserObj?.nombre,
        foto_url: studentUserObj?.foto_url,
        carrera: studentProfileObj?.carrera || 'N/A',
        sede: studentProfileObj?.sede || 'N/A'
      },
      cv: app.cv ? {
        id: (app.cv as any).id,
        // Hacky way to get the latest version name if it exists
        nombre_version: ((app.cv as any)?.cv_versiones?.[0])?.nombre_version || 'Mi CV'
      } : null
    }
  })
}

export async function updateApplicationStatus(data: UpdateApplicationStatusInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const parsedData = updateApplicationStatusSchema.parse(data)

    // Obtener la aplicación y la posición asociada para validar propiedad y sacar datos para el email
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('status, position_id, student_id, alumni_id, position:posiciones(titulo), studentUser:users!applications_student_id_fkey(nombre, email)')
      .eq('id', parsedData.application_id)
      .single()

    if (appError || !app) return { success: false, error: 'Aplicación no encontrada' }
    if (app.alumni_id !== user.id) return { success: false, error: 'No autorizado' }

    const updates: any = { status: parsedData.status, updated_at: new Date().toISOString() }
    if (app.status === 'enviada' && parsedData.status === 'en_revision') {
      updates.reviewed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', parsedData.application_id)

    if (updateError) throw updateError

    const positionTitle = (app.position as any)?.titulo
    const studentName = (app.studentUser as any)?.nombre
    const studentEmail = (app.studentUser as any)?.email
    
    // Obtener nombre del exalumno (el que ejecuta)
    const { data: alumniUser } = await supabase.from('users').select('nombre').eq('id', user.id).single()
    const alumniName = alumniUser?.nombre || 'Exalumno'

    if (parsedData.status === 'seleccionado') {
      // 1. Notificar al estudiante seleccionado in-app y por email
      await supabase.from('notifications').insert({
        user_id: app.student_id,
        type: 'seleccionado',
        title: '¡Fuiste seleccionado!',
        content: `Has sido seleccionado para la posición: ${positionTitle}. Revisa tu correo electrónico.`,
        link_url: `/mis-aplicaciones`
      })

      if (studentEmail && studentName) {
        await sendApplicationSelectedEmail({
          studentEmail, studentName, positionTitle, alumniName
        }).catch(console.error)
      }

      // 2. Descartar a los demás si cierra la posición
      if (parsedData.close_position) {
        await supabase.from('posiciones').update({ estado: 'cubierta' }).eq('id', app.position_id)

        // Obtener a los demás aplicantes
        const { data: others } = await supabase
          .from('applications')
          .select('id, student_id, studentUser:users!applications_student_id_fkey(nombre, email)')
          .eq('position_id', app.position_id)
          .neq('id', parsedData.application_id)
          .neq('status', 'descartado')

        if (others && others.length > 0) {
          const otherIds = others.map(o => o.id)
          await supabase.from('applications').update({ status: 'descartado' }).in('id', otherIds)

          for (const other of others) {
            const oEmail = (other.studentUser as any)?.email
            const oName = (other.studentUser as any)?.nombre
            if (oEmail && oName) {
              await sendApplicationDiscardedEmail({
                studentEmail: oEmail,
                studentName: oName,
                positionTitle
              }).catch(console.error)
            }
          }
        }
      }
    } else if (parsedData.status === 'descartado') {
      // Notificar descarte solo a este estudiante
      if (studentEmail && studentName) {
        await sendApplicationDiscardedEmail({
          studentEmail, studentName, positionTitle
        }).catch(console.error)
      }
    }

    revalidatePath(`/mis-posiciones/${app.position_id}/aplicantes`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el estado' }
  }
}
