import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { notificarDonacionAtrasadaAdmin } from '../../../../lib/email';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminClient = createAdminClient();
    
    // Calcular la fecha límite (hace 48 horas)
    const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: donaciones, error } = await adminClient
      .from('donaciones')
      .select(`
        id, 
        monto, 
        moneda, 
        fecha_transferencia, 
        donante:users!donaciones_exalumno_id_fkey(email)
      `)
      .eq('estado', 'pendiente')
      .lt('created_at', limite48h);

    if (error) throw error;

    if (donaciones && donaciones.length > 0) {
      // Obtener todos los administradores
      const { data: admins } = await adminClient
        .from('users')
        .select('email')
        .eq('tipo', 'admin')
        .eq('activo', true);

      if (admins && admins.length > 0) {
        const adminEmails = admins.map(a => a.email);

        for (const donacion of donaciones) {
          const donanteData = Array.isArray(donacion.donante) ? donacion.donante[0] : donacion.donante;
          
          if (donanteData && donanteData.email) {
            await notificarDonacionAtrasadaAdmin(
              adminEmails,
              'Equipo Administrador',
              donacion.monto,
              donacion.moneda,
              donanteData.email,
              donacion.fecha_transferencia
            );
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Se enviaron notificaciones para ${donaciones?.length || 0} donaciones atrasadas.` 
    });
  } catch (error: any) {
    console.error('Error en cron check-donations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
