import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    // Aquí implementamos la lógica de agregación
    // Dado que Supabase SQL puede ser complejo para GROUP BY en JS, traeremos los datos o usaremos RPC
    // Para simplificar, haremos múltiples queries filtrados por fecha
    
    let donationsQuery = adminClient.from('donaciones').select('monto, moneda, estado, created_at, exalumno_id');
    let matchesQuery = adminClient.from('matches').select('estado, resultado, created_at, estudiante_id');
    let usersQuery = adminClient.from('users').select(`
      rol, 
      created_at, 
      id, 
      activo,
      carrera_campus(
        campus(nombre),
        facultades(nombre)
      )
    `).is('deleted_at', null);

    if (startDate) {
      donationsQuery = donationsQuery.gte('created_at', startDate);
      matchesQuery = matchesQuery.gte('created_at', startDate);
    }
    if (endDate) {
      donationsQuery = donationsQuery.lte('created_at', endDate);
      matchesQuery = matchesQuery.lte('created_at', endDate);
    }

    const [
      { data: donations, error: donError },
      { data: matches, error: matError },
      { data: users, error: usrError }
    ] = await Promise.all([
      donationsQuery,
      matchesQuery,
      usersQuery
    ]);

    if (usrError) console.error('Error fetching users:', usrError);
    if (donError) console.error('Error fetching donaciones:', donError);
    if (matError) console.error('Error fetching matches:', matError);

    // Procesar Datos
    const donacionesConfirmadas = (donations || []).filter(d => d.estado === 'confirmada');
    
    const totalDonadoCRC = donacionesConfirmadas
      .filter(d => d.moneda === 'CRC')
      .reduce((acc, d) => acc + (Number(d.monto) || 0), 0);
      
    const totalDonadoUSD = donacionesConfirmadas
      .filter(d => d.moneda === 'USD')
      .reduce((acc, d) => acc + (Number(d.monto) || 0), 0);

    const matchesActivos = (matches || []).filter(m => m.estado === 'activo').length;
    const matchesCerradosExitosamente = (matches || []).filter(m => m.estado === 'cerrado' && (m as any).resultado === 'exitoso').length;

    // Distribución por carrera/facultad usando los datos reales de 'users'
    const distribucionCarrera: Record<string, number> = {};
    const distribucionSede: Record<string, number> = {};

    (users || []).forEach(u => {
      const carreraCampus = u.carrera_campus as any;
      if (carreraCampus) {
        const facultadNombre = carreraCampus.facultades?.nombre || 'General';
        distribucionCarrera[facultadNombre] = (distribucionCarrera[facultadNombre] || 0) + 1;
        
        const campusNombre = carreraCampus.campus?.nombre || 'Sede Central';
        distribucionSede[campusNombre] = (distribucionSede[campusNombre] || 0) + 1;
      }
    });

    const graficosCarrera = Object.entries(distribucionCarrera).map(([name, value]) => ({ name, value }));
    const graficosSede = Object.entries(distribucionSede).map(([name, value]) => ({ name, value }));

    // Estudiantes / Exalumnos Activos
    const estudiantesActivos = (users || []).filter(u => u.rol === 'estudiante' && u.activo).length;
    const exalumnosActivos = (users || []).filter(u => u.rol === 'exalumno' && u.activo).length;

    // Donantes nuevos vs recurrentes
    const donacionesAgrupadas: Record<string, number> = {};
    (donations || []).forEach(d => {
      if (d.exalumno_id) {
        donacionesAgrupadas[d.exalumno_id] = (donacionesAgrupadas[d.exalumno_id] || 0) + 1;
      }
    });

    let donantesNuevos = 0;
    let donantesRecurrentes = 0;
    
    Object.values(donacionesAgrupadas).forEach(count => {
      if (count === 1) {
        donantesNuevos++;
      } else if (count > 1) {
        donantesRecurrentes++;
      }
    });

    return NextResponse.json({
      data: {
        totalDonadoCRC,
        totalDonadoUSD,
        proyectosApoyados: matchesActivos + matchesCerradosExitosamente, // Aproximación
        matchesActivos,
        matchesCerradosExitosamente,
        estudiantesActivos,
        exalumnosActivos,
        graficosCarrera,
        graficosSede,
        donantesNuevos,
        donantesRecurrentes
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
