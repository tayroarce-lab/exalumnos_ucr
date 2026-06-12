import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  // Verificación simple de seguridad para que no se ejecute públicamente
  // En Vercel, el encabezado x-vercel-cron se envía en las llamadas de Cron
  const authHeader = request.headers.get('authorization')
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  
  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabaseAdmin = createAdminClient()

    // Buscar posiciones activas cuya fecha límite ya pasó
    const { data: expiradas, error: selectError } = await supabaseAdmin
      .from('posiciones')
      .select('id')
      .eq('estado', 'activa')
      .lt('fecha_limite', new Date().toISOString())

    if (selectError) throw selectError

    if (!expiradas || expiradas.length === 0) {
      return NextResponse.json({ message: 'No hay posiciones expiradas para cerrar', closedCount: 0 })
    }

    const idsToClose = expiradas.map(p => p.id)

    // Cerrar todas las posiciones encontradas
    const { error: updateError } = await supabaseAdmin
      .from('posiciones')
      .update({ estado: 'cerrada', updated_at: new Date().toISOString() })
      .in('id', idsToClose)

    if (updateError) throw updateError

    return NextResponse.json({ 
      message: 'Posiciones expiradas cerradas exitosamente', 
      closedCount: idsToClose.length,
      ids: idsToClose
    })

  } catch (error: any) {
    console.error('Error en cron de cierre de posiciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
