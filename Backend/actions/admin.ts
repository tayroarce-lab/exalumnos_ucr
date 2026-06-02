'use server';

import { createAdminClient } from '../lib/supabase/admin';
import { createClient } from '../lib/supabase/server';

export async function getDashboardMetrics() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  const adminClient = createAdminClient();

  // Validar permisos de administrador
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .eq('id', user.id)
    .single();

  if (profile?.tipo !== 'admin') {
    throw new Error('Solo los administradores pueden ver el dashboard');
  }

  // 1. Total donado en CRC y USD (solo confirmadas)
  const { data: donaciones } = await adminClient
    .from('donaciones')
    .select('monto, moneda, proyecto_estudiante_id')
    .eq('estado', 'confirmada');

  let totalDonadoCRC = 0;
  let totalDonadoUSD = 0;
  const proyectosConDonacion = new Set<string>();

  donaciones?.forEach(d => {
    if (d.moneda === 'CRC') totalDonadoCRC += Number(d.monto);
    if (d.moneda === 'USD') totalDonadoUSD += Number(d.monto);
    if (d.proyecto_estudiante_id) proyectosConDonacion.add(d.proyecto_estudiante_id);
  });

  // 2. Matches activos y cerrados
  const { count: matchesActivos, data: matchesDataActivos } = await adminClient
    .from('matches')
    .select('estudiante_id', { count: 'exact' })
    .eq('estado', 'activo');

  const { count: matchesCerrados, data: matchesDataCerrados } = await adminClient
    .from('matches')
    .select('estudiante_id', { count: 'exact' })
    .eq('estado', 'cerrado')
    .eq('resultado', 'exitoso');

  // Consolidar proyectos apoyados (donaciones confirmadas + matches activos/exitosos)
  matchesDataActivos?.forEach(m => proyectosConDonacion.add(m.estudiante_id));
  matchesDataCerrados?.forEach(m => proyectosConDonacion.add(m.estudiante_id));

  const proyectosApoyados = proyectosConDonacion.size;

  // 3. Usuarios activos
  const { count: exalumnosActivos } = await adminClient
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', 'exalumno')
    .eq('activo', true);

  const { count: estudiantesActivos } = await adminClient
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', 'estudiante')
    .eq('activo', true);

  // 4. Distribución por carrera y sede (estudiantes)
  const { data: estudiantesData } = await adminClient
    .from('estudiantes')
    .select('carrera, sede');
    
  const distribucionCarrera: Record<string, number> = {};
  const distribucionSede: Record<string, number> = {};
  
  estudiantesData?.forEach(e => {
    if (e.carrera) distribucionCarrera[e.carrera] = (distribucionCarrera[e.carrera] || 0) + 1;
    if (e.sede) distribucionSede[e.sede] = (distribucionSede[e.sede] || 0) + 1;
  });

  // 5. Donantes recurrentes vs nuevos (opcional, cálculo simple)
  const donantesCount: Record<string, number> = {};
  const { data: todasDonaciones } = await adminClient
    .from('donaciones')
    .select('exalumno_id')
    .eq('estado', 'confirmada');

  todasDonaciones?.forEach(d => {
    if (d.exalumno_id) {
      donantesCount[d.exalumno_id] = (donantesCount[d.exalumno_id] || 0) + 1;
    }
  });

  let donantesNuevos = 0;
  let donantesRecurrentes = 0;
  Object.values(donantesCount).forEach(count => {
    if (count === 1) donantesNuevos++;
    else if (count > 1) donantesRecurrentes++;
  });

  return {
    success: true,
    data: {
      totalDonadoCRC,
      totalDonadoUSD,
      proyectosApoyados,
      matchesActivos: matchesActivos || 0,
      matchesCerrados: matchesCerrados || 0,
      exalumnosActivos: exalumnosActivos || 0,
      estudiantesActivos: estudiantesActivos || 0,
      distribucionCarrera,
      distribucionSede,
      donantesNuevos,
      donantesRecurrentes
    }
  };
}
