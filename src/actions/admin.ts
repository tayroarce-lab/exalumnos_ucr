'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Helper interno: verifica que el usuario autenticado sea admin
// ---------------------------------------------------------------------------
async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .eq('id', user.id)
    .single();

  if (profile?.tipo !== 'admin') {
    throw new Error('Solo los administradores tienen acceso a esta acción');
  }

  return { user, adminClient };
}

// ---------------------------------------------------------------------------
// Helper interno: obtiene el rol de un usuario por su ID (sin autenticación)
// ---------------------------------------------------------------------------
async function fetchUserRole(userId: string) {
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('tipo')
    .eq('id', userId)
    .single();
  return profile?.tipo;
}

// ---------------------------------------------------------------------------
// verificarRolAdmin (usado por otros actions que también llaman a esta función)
// ---------------------------------------------------------------------------
export async function verificarRolAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No autenticado');
  }

  const role = await fetchUserRole(user.id);
  if (role !== 'admin') {
    throw new Error('Solo los administradores tienen acceso a esta acción');
  }
}

// ---------------------------------------------------------------------------
// getDashboardMetrics
// ---------------------------------------------------------------------------
export async function getDashboardMetrics() {
  try {
    const { adminClient } = await getAuthenticatedAdmin();

    // 1. Donaciones confirmadas → totales CRC / USD y proyectos con donación
    const { data: donaciones } = await adminClient
      .from('donaciones')
      .select('monto, moneda, proyecto_estudiante_id')
      .eq('estado', 'confirmada');

    let totalDonadoCRC = 0;
    let totalDonadoUSD = 0;
    const proyectosConDonacion = new Set<string>();

    (donaciones ?? []).forEach((d) => {
      if (d.moneda === 'CRC') totalDonadoCRC += Number(d.monto);
      if (d.moneda === 'USD') totalDonadoUSD += Number(d.monto);
      if (d.proyecto_estudiante_id) proyectosConDonacion.add(d.proyecto_estudiante_id);
    });

    // 2. Matches activos
    const { count: matchesActivos, data: matchesDataActivos } = await adminClient
      .from('matches')
      .select('estudiante_id', { count: 'exact' })
      .eq('estado', 'activo');

    // 3. Matches cerrados exitosamente
    const { count: matchesCerrados, data: matchesDataCerrados } = await adminClient
      .from('matches')
      .select('estudiante_id', { count: 'exact' })
      .eq('estado', 'cerrado')
      .eq('resultado', 'exitoso');

    // Consolidar proyectos apoyados por matches
    (matchesDataActivos ?? []).forEach(
      (m) => m.estudiante_id && proyectosConDonacion.add(m.estudiante_id),
    );
    (matchesDataCerrados ?? []).forEach(
      (m) => m.estudiante_id && proyectosConDonacion.add(m.estudiante_id),
    );

    const proyectosApoyados = proyectosConDonacion.size;

    // 4. Usuarios activos por tipo
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

    // 5. Distribución por carrera y sede
    const { data: estudiantesData } = await adminClient
      .from('estudiantes')
      .select('carrera, sede');

    const distribucionCarrera: Record<string, number> = {};
    const distribucionSede: Record<string, number> = {};

    (estudiantesData ?? []).forEach((e) => {
      if (e.carrera) distribucionCarrera[e.carrera] = (distribucionCarrera[e.carrera] || 0) + 1;
      if (e.sede) distribucionSede[e.sede] = (distribucionSede[e.sede] || 0) + 1;
    });

    // 6. Donantes nuevos vs recurrentes
    const { data: todasDonaciones } = await adminClient
      .from('donaciones')
      .select('exalumno_id')
      .eq('estado', 'confirmada');

    const donantesCount: Record<string, number> = {};
    (todasDonaciones ?? []).forEach((d) => {
      if (d.exalumno_id) {
        donantesCount[d.exalumno_id] = (donantesCount[d.exalumno_id] || 0) + 1;
      }
    });

    let donantesNuevos = 0;
    let donantesRecurrentes = 0;
    Object.values(donantesCount).forEach((count) => {
      if (count === 1) donantesNuevos++;
      else if (count > 1) donantesRecurrentes++;
    });

    return {
      success: true,
      data: {
        totalDonadoCRC,
        totalDonadoUSD,
        proyectosApoyados,
        matchesActivos: matchesActivos ?? 0,
        matchesCerrados: matchesCerrados ?? 0,
        exalumnosActivos: exalumnosActivos ?? 0,
        estudiantesActivos: estudiantesActivos ?? 0,
        distribucionCarrera,
        distribucionSede,
        donantesNuevos,
        donantesRecurrentes,
      },
    };
  } catch (error: any) {
    console.error('Error en getDashboardMetrics:', error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// gestionarMatch
// ---------------------------------------------------------------------------
export async function gestionarMatch(
  matchId: string,
  estado: 'sugerido' | 'contactado' | 'activo' | 'cerrado',
  notas_admin?: string,
) {
  const { adminClient } = await getAuthenticatedAdmin();

  const { error } = await adminClient
    .from('matches')
    .update({ estado, notas_admin, updated_at: new Date().toISOString() })
    .eq('id', matchId);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ---------------------------------------------------------------------------
// listarMatchesAdmin
// ---------------------------------------------------------------------------
export async function listarMatchesAdmin(filtros?: { estado?: string; tipo_apoyo?: string }) {
  const { adminClient } = await getAuthenticatedAdmin();

  let query = adminClient
    .from('matches')
    .select(
      `*,
      exalumno:users!matches_exalumno_id_fkey(nombre, email),
      estudiante:users!matches_estudiante_id_fkey(nombre, email)`,
    )
    .order('created_at', { ascending: false });

  if (filtros?.estado) query = query.eq('estado', filtros.estado);
  if (filtros?.tipo_apoyo) query = query.eq('tipo_apoyo', filtros.tipo_apoyo);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// listarDonacionesPendientes
// ---------------------------------------------------------------------------
export async function listarDonacionesPendientes() {
  const { adminClient } = await getAuthenticatedAdmin();

  const { data, error } = await adminClient
    .from('donaciones')
    .select(
      `*,
      exalumno:users!donaciones_exalumno_id_fkey(nombre, email),
      estudiante:users!donaciones_proyecto_estudiante_id_fkey(nombre, email)`,
    )
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true }); // más antiguas primero

  if (error) throw new Error(error.message);
  return data;
}
