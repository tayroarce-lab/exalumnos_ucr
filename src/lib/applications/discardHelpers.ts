import { sendApplicationDiscardedEmail } from '@/lib/email/application-emails'

export async function descartarAplicantesPendientes(
  supabase: any,
  positionId: string,
  positionTitle: string,
  excludeApplicationId?: string
) {
  // Obtener a todos los aplicantes pendientes (distintos de descartado o seleccionado)
  let query = supabase
    .from('applications')
    .select('id, student_id, studentUser:users!applications_student_id_fkey(nombre, email)')
    .eq('position_id', positionId)
    .neq('status', 'descartado')
    .neq('status', 'seleccionado')

  if (excludeApplicationId) {
    query = query.neq('id', excludeApplicationId)
  }

  const { data: others, error } = await query
  if (error) throw error

  if (others && others.length > 0) {
    const otherIds = others.map((o: any) => o.id)
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'descartado', updated_at: new Date().toISOString() })
      .in('id', otherIds)

    if (updateError) throw updateError

    for (const other of others) {
      const oEmail = (other.studentUser as any)?.email
      const oName = (other.studentUser as any)?.nombre
      if (oEmail && oName) {
        await sendApplicationDiscardedEmail({
          studentEmail: oEmail,
          studentName: oName,
          positionTitle
        }).catch((err: any) => {
          console.error(`Error enviando correo de descarte a ${oEmail}:`, err)
        })
      }
    }
  }

  return others?.length || 0
}
