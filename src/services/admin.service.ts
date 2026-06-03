import * as adminRepo from '@/repositories/admin.repository';

export async function calculateDashboardMetrics() {
  // 1. Total donado en CRC y USD
  const donaciones = await adminRepo.fetchConfirmedDonations();
  
  let totalDonadoCRC = 0;
  let totalDonadoUSD = 0;
  const proyectosConDonacion = new Set<string>();

  donaciones.forEach(d => {
    if (d.moneda === 'CRC') totalDonadoCRC += Number(d.monto);
    if (d.moneda === 'USD') totalDonadoUSD += Number(d.monto);
    if (d.proyecto_estudiante_id) proyectosConDonacion.add(d.proyecto_estudiante_id);
  });

  // 2. Matches activos y cerrados
  const { count: matchesActivos, data: matchesDataActivos } = await adminRepo.fetchActiveMatchesCount();
  const { count: matchesCerrados, data: matchesDataCerrados } = await adminRepo.fetchClosedMatchesCount();

  // Consolidar proyectos apoyados
  matchesDataActivos.forEach(m => m.estudiante_id && proyectosConDonacion.add(m.estudiante_id));
  matchesDataCerrados.forEach(m => m.estudiante_id && proyectosConDonacion.add(m.estudiante_id));

  const proyectosApoyados = proyectosConDonacion.size;

  // 3. Usuarios activos
  const exalumnosActivos = await adminRepo.fetchActiveUsersCount('exalumno');
  const estudiantesActivos = await adminRepo.fetchActiveUsersCount('estudiante');

  // 4. Distribución por carrera y sede
  const estudiantesData = await adminRepo.fetchEstudiantesData();
  const distribucionCarrera: Record<string, number> = {};
  const distribucionSede: Record<string, number> = {};
  
  estudiantesData.forEach(e => {
    if (e.carrera) distribucionCarrera[e.carrera] = (distribucionCarrera[e.carrera] || 0) + 1;
    if (e.sede) distribucionSede[e.sede] = (distribucionSede[e.sede] || 0) + 1;
  });

  // 5. Donantes recurrentes vs nuevos
  const todasDonaciones = await adminRepo.fetchAllDonations();
  const donantesCount: Record<string, number> = {};

  todasDonaciones.forEach(d => {
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
    totalDonadoCRC,
    totalDonadoUSD,
    proyectosApoyados,
    matchesActivos,
    matchesCerrados,
    exalumnosActivos,
    estudiantesActivos,
    distribucionCarrera,
    distribucionSede,
    donantesNuevos,
    donantesRecurrentes
  };
}
