// =============================================================================
// SERVICIO: profileService
// Descripción : Lógica de negocio para la gestión de perfiles de usuario con
//               soporte completo de Borrado Lógico (Soft Delete).
//               Todas las lecturas filtran registros eliminados (deleted_at IS NULL).
//               Las eliminaciones son lógicas: estampan deleted_at, nunca hacen DELETE.
// =============================================================================

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logError } from '@/lib/logger';

// -----------------------------------------------------------------------------
// Tipos del Servicio
// -----------------------------------------------------------------------------

export interface PerfilUsuario {
  id: string;
  nombre: string;
  apellidos?: string;
  email: string;
  rol: 'estudiante' | 'exalumno' | 'admin';
  foto_url?: string;
  telefono?: string;
  linkedin?: string;
  busca_mentoria: boolean;
  busca_empleo: boolean;
  ofrece_mentoria: boolean;
  visible_en_directorio: boolean;
  activo: boolean;
  deleted_at: string | null;
  created_at: string;
}

export interface RespuestaPerfil {
  exito: boolean;
  mensaje: string;
  datos?: PerfilUsuario | PerfilUsuario[] | null;
}

// =============================================================================
// FUNCIÓN: buscarPerfilesActivos
// Descripción : Lista todos los perfiles donde deleted_at IS NULL.
//               Filtra opcionalmente por rol. Uso: panel administrativo y directorio.
// =============================================================================
export async function buscarPerfilesActivos(
  filtros?: { rol?: 'estudiante' | 'exalumno' | 'admin'; activo?: boolean }
): Promise<RespuestaPerfil> {
  const adminClient = createAdminClient();

  let query = adminClient
    .from('users')
    .select('*')
    .is('deleted_at', null)          // Filtro principal de Soft Delete
    .order('created_at', { ascending: false });

  if (filtros?.rol) {
    query = query.eq('rol', filtros.rol);
  }
  if (filtros?.activo !== undefined) {
    query = query.eq('activo', filtros.activo);
  }

  const { data, error } = await query;
  if (error) {
    logError('profileService.ts/buscarPerfilesActivos', error);
    return { exito: false, mensaje: `Error al listar perfiles: ${error.message}` };
  }

  return { exito: true, mensaje: `${data?.length ?? 0} perfiles encontrados`, datos: data as PerfilUsuario[] };
}

// =============================================================================
// FUNCIÓN: obtenerPerfilPorId
// Descripción : Retorna un único perfil activo por su UUID.
//               Devuelve null si el perfil está eliminado o no existe.
// =============================================================================
export async function obtenerPerfilPorId(userId: string): Promise<RespuestaPerfil> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .is('deleted_at', null)          // Ignorar perfiles con borrado lógico activo
    .eq('id', userId)
    .single();

  if (error) {
    logError('profileService.ts/obtenerPerfilPorId', error, { targetUserId: userId });
    return { exito: false, mensaje: `Perfil no encontrado: ${error.message}`, datos: null };
  }

  return { exito: true, mensaje: 'Perfil obtenido', datos: data as PerfilUsuario };
}

// =============================================================================
// FUNCIÓN: actualizarPerfil
// Descripción : Actualiza los datos de un perfil. Solo opera sobre perfiles activos.
//               El campo `updated_at` es gestionado por el trigger `set_users_updated_at`.
// =============================================================================
export async function actualizarPerfil(
  userId: string,
  cambios: Partial<Pick<PerfilUsuario, 'nombre' | 'apellidos' | 'telefono' | 'linkedin' | 'busca_mentoria' | 'busca_empleo' | 'ofrece_mentoria' | 'visible_en_directorio'>>
): Promise<RespuestaPerfil> {
  const supabase = await createClient();

  // Verificar autenticación: el usuario solo puede editar su propio perfil
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== userId) {
    if (authError) logError('profileService.ts/actualizarPerfil', authError);
    return { exito: false, mensaje: 'No autorizado para modificar este perfil' };
  }

  const { data, error } = await supabase
    .from('users')
    .update(cambios)
    .eq('id', userId)
    .is('deleted_at', null)          // No editar perfiles ya eliminados
    .select()
    .single();

  if (error) {
    logError('profileService.ts/actualizarPerfil', error, { targetUserId: userId });
    return { exito: false, mensaje: `Error al actualizar perfil: ${error.message}` };
  }

  return { exito: true, mensaje: 'Perfil actualizado exitosamente', datos: data };
}

// =============================================================================
// FUNCIÓN: eliminarPerfilLogico
// Descripción : Ejecuta el BORRADO LÓGICO del perfil del usuario autenticado.
//               NO hace DELETE físico. Estampa deleted_at = NOW().
//               El trigger de cascada (migración 20260605152000) propagará el
//               deleted_at a posiciones, matches y donaciones del usuario.
// =============================================================================
export async function eliminarPerfilLogico(userId: string): Promise<RespuestaPerfil> {
  const supabase = await createClient();

  // Verificar que sea el propio usuario quien solicita el borrado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== userId) {
    if (authError) logError('profileService.ts/eliminarPerfilLogico', authError);
    return { exito: false, mensaje: 'No autorizado para eliminar este perfil' };
  }

  // Llamar a la función SQL de borrado lógico (SECURITY DEFINER en la migración 15)
  const { error } = await supabase.rpc('eliminar_perfil_logico' as any, {
    p_user_id: userId
  });

  if (error) {
    logError('profileService.ts/eliminarPerfilLogico', error, { targetUserId: userId });
    return { exito: false, mensaje: `Error al eliminar perfil: ${error.message}` };
  }

  return {
    exito: true,
    mensaje: 'Cuenta eliminada exitosamente. Los datos serán conservados por 30 días antes de eliminación definitiva.'
  };
}

// =============================================================================
// FUNCIÓN: eliminarPerfilLogicoAdmin
// Descripción : Versión administrativa del borrado lógico. Permite a un admin
//               eliminar el perfil de cualquier usuario. Requiere rol='admin'.
//               Invoca la función SQL con el cliente de servicio (bypass RLS).
// =============================================================================
export async function eliminarPerfilLogicoAdmin(
  targetUserId: string
): Promise<RespuestaPerfil> {
  const adminClient = createAdminClient();

  // Verificar que el perfil objetivo exista y esté activo antes de proceder
  const { data: perfilExistente, error: verificacionError } = await adminClient
    .from('users')
    .select('id, nombre, rol')
    .is('deleted_at', null)
    .eq('id', targetUserId)
    .single();

  if (verificacionError || !perfilExistente) {
    if (verificacionError) logError('profileService.ts/eliminarPerfilLogicoAdmin', verificacionError, { targetUserId });
    return { exito: false, mensaje: 'Usuario objetivo no encontrado o ya fue eliminado' };
  }

  // Protección: no permitir eliminar a otros administradores por esta vía
  if (perfilExistente.rol === 'admin') {
    return { exito: false, mensaje: 'No se puede eliminar lógicamente a otro administrador por esta vía' };
  }

  const { error } = await adminClient.rpc('eliminar_perfil_logico' as any, {
    p_user_id: targetUserId
  });

  if (error) {
    logError('profileService.ts/eliminarPerfilLogicoAdmin', error, { targetUserId });
    return { exito: false, mensaje: `Error en eliminación administrativa: ${error.message}` };
  }

  return {
    exito: true,
    mensaje: `Perfil de "${perfilExistente.nombre}" eliminado lógicamente. Posiciones y matches asociados también fueron desactivados.`
  };
}

// =============================================================================
// FUNCIÓN: restaurarPerfilAdmin
// Descripción : Revierte el borrado lógico de un perfil. Uso exclusivo de admins.
//               Llama a la función SQL `restaurar_registro` (migración 15).
// =============================================================================
export async function restaurarPerfilAdmin(userId: string): Promise<RespuestaPerfil> {
  const adminClient = createAdminClient();

  const { error } = await adminClient.rpc('restaurar_registro' as any, {
    p_table_name: 'users',
    p_record_id: userId
  });

  if (error) {
    logError('profileService.ts/restaurarPerfilAdmin', error, { targetUserId: userId });
    return { exito: false, mensaje: `Error al restaurar perfil: ${error.message}` };
  }

  return { exito: true, mensaje: 'Perfil restaurado exitosamente. El usuario puede volver a iniciar sesión.' };
}
