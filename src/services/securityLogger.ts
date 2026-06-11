// =============================================================================
// ARCHIVO: src/services/securityLogger.ts
// Descripción: Servicio para registrar eventos de seguridad en la tabla
//              `security_events` usando el cliente admin (service_role).
//              Se usa exclusivamente desde el middleware Edge — nunca desde
//              componentes de cliente.
//              La inserción ocurre vía la función RPC `registrar_evento_seguridad`
//              (SECURITY DEFINER) que bypasea RLS para garantizar inmutabilidad.
// =============================================================================

import { createClient } from '@supabase/supabase-js'

// Tipos de eventos permitidos (espejo del CHECK constraint en la BD)
export type TipoEventoSeguridad =
  | 'login_exitoso'
  | 'acceso_admin'
  | 'acceso_denegado_rol'
  | 'cuenta_suspendida_intento'
  | 'open_redirect_attempt'
  | 'rate_limit_superado'
  | 'sesion_cerrada'

export interface EventoSeguridad {
  tipo:       TipoEventoSeguridad
  usuarioId?: string
  ip:         string
  ruta?:      string
  metadata?:  Record<string, unknown>
}

// Cliente admin lazy-initialized — compatible con Edge Runtime
// Se usa el service_role key para bypasear RLS en la inserción
function crearAdminEdgeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

// [VERDE - FUNCION: registrarEventoSeguridad]
// Registra un evento de seguridad de forma asíncrona y silenciosa.
// Nunca lanza excepciones — el middleware nunca debe bloquearse por un fallo de log.
export async function registrarEventoSeguridad(evento: EventoSeguridad): Promise<void> {
  try {
    const admin = crearAdminEdgeClient()

    // Llamar a la función RPC SECURITY DEFINER en lugar de insertar directamente
    // Esto garantiza que el cliente no necesita políticas INSERT en security_events
    await admin.rpc('registrar_evento_seguridad', {
      p_tipo:       evento.tipo,
      p_usuario_id: evento.usuarioId ?? null,
      p_ip:         evento.ip,
      p_ruta:       evento.ruta ?? null,
      p_metadata:   evento.metadata ? JSON.stringify(evento.metadata) : null,
    })
  } catch (err) {
    // Silencioso — nunca bloquear el flujo del middleware
    console.warn('[SecurityLogger] Error al registrar evento:', err)
  }
}
