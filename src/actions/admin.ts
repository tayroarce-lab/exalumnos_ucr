'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendMatchStatusUpdateEmail } from '@/services/email-service';

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
    .select('tipo').is('deleted_at', null)
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
    .select('tipo').is('deleted_at', null)
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
      .select('monto, moneda, proyecto_destino').is('deleted_at', null)
      .eq('estado', 'confirmada');

    let totalDonadoCRC = 0;
    let totalDonadoUSD = 0;
    const proyectosConDonacion = new Set<string>();

    (donaciones ?? []).forEach((d) => {
      if (d.moneda === 'CRC') totalDonadoCRC += Number(d.monto);
      if (d.moneda === 'USD') totalDonadoUSD += Number(d.monto);
      if (d.proyecto_destino) proyectosConDonacion.add(d.proyecto_destino);
    });

    // 2. Matches activos
    const { count: matchesActivos, data: matchesDataActivos } = await adminClient
      .from('matches')
      .select('estudiante_id', { count: 'exact' }).is('deleted_at', null)
      .eq('estado', 'activo');

    // 3. Matches cerrados exitosamente
    const { count: matchesCerrados, data: matchesDataCerrados } = await adminClient
      .from('matches')
      .select('estudiante_id', { count: 'exact' }).is('deleted_at', null)
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
      .select('id', { count: 'exact', head: true }).is('deleted_at', null)
      .eq('tipo', 'exalumno')
      .eq('activo', true);

    const { count: estudiantesActivos } = await adminClient
      .from('users')
      .select('id', { count: 'exact', head: true }).is('deleted_at', null)
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
      .select('alumni_id').is('deleted_at', null)
      .eq('estado', 'confirmada');

    const donantesCount: Record<string, number> = {};
    (todasDonaciones ?? []).forEach((d) => {
      if (d.alumni_id) {
        donantesCount[d.alumni_id] = (donantesCount[d.alumni_id] || 0) + 1;
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

  if (estado === 'activo' || estado === 'cerrado') {
    const { data } = await adminClient
      .from('matches')
      .select(`
        exalumno:users!matches_exalumno_id_fkey(nombre, email),
        estudiante:users!matches_estudiante_id_fkey(nombre, email)
      `)
      .eq('id', matchId)
      .single();
    const matchDetails = data as any;

    if (matchDetails) {
      const exNombre = Array.isArray(matchDetails.exalumno) ? matchDetails.exalumno[0]?.nombre : matchDetails.exalumno?.nombre;
      const exEmail = Array.isArray(matchDetails.exalumno) ? matchDetails.exalumno[0]?.email : matchDetails.exalumno?.email;
      const estNombre = Array.isArray(matchDetails.estudiante) ? matchDetails.estudiante[0]?.nombre : matchDetails.estudiante?.nombre;
      const estEmail = Array.isArray(matchDetails.estudiante) ? matchDetails.estudiante[0]?.email : matchDetails.estudiante?.email;

      if (exEmail && exNombre) await sendMatchStatusUpdateEmail(exEmail, exNombre, estado);
      if (estEmail && estNombre) await sendMatchStatusUpdateEmail(estEmail, estNombre, estado);
    }
  }

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
    ).is('deleted_at', null)
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
      exalumno:profiles!donaciones_alumni_id_fkey(full_name, email)`
    ).is('deleted_at', null)
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true }); // más antiguas primero

  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// listarTodasLasVacantes — lista todas las posiciones sin importar el estado
// Usa el cliente admin para bypassear RLS y ver posiciones de todos los exalumnos
// ---------------------------------------------------------------------------
export async function listarTodasLasVacantes(filtros?: {
  estado?: string;
  tipo?: string;
}) {
  const { adminClient } = await getAuthenticatedAdmin();

  let query = adminClient
    .from('posiciones')
    .select(
      `*,
      exalumno:users!posiciones_exalumno_id_fkey(nombre, email)`
    )
    .order('created_at', { ascending: false });

  if (filtros?.estado) query = query.eq('estado', filtros.estado);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// actualizarEstadoVacanteAdmin — permite al admin cambiar estado de cualquier vacante
// ---------------------------------------------------------------------------
export async function actualizarEstadoVacanteAdmin(
  id: string,
  estado: 'activa' | 'pausada' | 'cerrada' | 'cubierta'
) {
  const { adminClient } = await getAuthenticatedAdmin();

  const { error } = await adminClient
    .from('posiciones')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { success: true };
}

