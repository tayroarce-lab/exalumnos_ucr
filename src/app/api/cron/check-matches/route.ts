import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { notificarMatchAntiguoAdmin } from '../../../../lib/email';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminClient = createAdminClient();
    
    // Calcular la fecha límite (hace 6 meses)
    // 6 meses ~= 180 días
    const limite6Meses = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

    const { data: matches, error } = await adminClient
      .from('matches')
      .select(`
        id, 
        created_at,
        exalumno:users!matches_exalumno_id_fkey(email),
        estudiante:users!matches_estudiante_id_fkey(email)
      `)
      .eq('estado', 'activo')
      .lt('created_at', limite6Meses);

    if (error) throw error;

    if (matches && matches.length > 0) {
      // Obtener todos los administradores
      const { data: admins } = await adminClient
        .from('users')
        .select('email')
        .eq('tipo', 'admin')
        .eq('activo', true);

      if (admins && admins.length > 0) {
        const adminEmails = admins.map(a => a.email);

        for (const match of matches) {
          const exalumnoData = Array.isArray(match.exalumno) ? match.exalumno[0] : match.exalumno;
          const estudianteData = Array.isArray(match.estudiante) ? match.estudiante[0] : match.estudiante;
          
          if (exalumnoData?.email && estudianteData?.email) {
            await notificarMatchAntiguoAdmin(
              adminEmails,
              'Equipo Administrador',
              exalumnoData.email,
              estudianteData.email,
              match.created_at
            );
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Se enviaron alertas para ${matches?.length || 0} matches antiguos.` 
    });
  } catch (error: any) {
    console.error('Error en cron check-matches:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
