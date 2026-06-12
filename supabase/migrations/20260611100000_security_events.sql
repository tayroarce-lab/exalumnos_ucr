-- =============================================================================
-- MIGRACIÓN 19: Sistema de Seguridad de Acceso
-- Descripción : Amplía el modelo de seguridad con:
--   1. Tabla `security_events` — audit inmutable de accesos y eventos sospechosos.
--      Registra: logins exitosos, accesos a /admin, intentos de acceso suspendido,
--      intentos de rol insuficiente, y open-redirect attempts.
--   2. Columna `suspension_reason` en `users` — motivo legible de suspensión.
--   3. Función RPC `registrar_evento_seguridad` — callable desde el Edge sin RLS.
-- Autor       : Sistema de Gestión Alumni UCR
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- SECCIÓN 1: Ampliar tabla users con motivo de suspensión
-- -----------------------------------------------------------------------------

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS suspended_at      TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.users.suspension_reason IS
  'Motivo legible de la suspensión de la cuenta (auto-reportes, admin manual, etc.).';
COMMENT ON COLUMN public.users.suspended_at IS
  'Fecha exacta en que se suspendió la cuenta. NULL = cuenta activa.';

-- Sincronizar: si activo=false pero suspended_at es null, marcarlo ahora
UPDATE public.users
SET suspended_at = NOW()
WHERE activo = FALSE AND suspended_at IS NULL;

-- -----------------------------------------------------------------------------
-- SECCIÓN 2: Tabla de Eventos de Seguridad
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.security_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Tipo de evento (catálogo cerrado para filtrado eficiente)
    tipo            TEXT        NOT NULL CHECK (tipo IN (
                        'login_exitoso',
                        'acceso_admin',
                        'acceso_denegado_rol',
                        'cuenta_suspendida_intento',
                        'open_redirect_attempt',
                        'rate_limit_superado',
                        'sesion_cerrada'
                    )),
    -- Identificador del usuario (puede ser NULL si no hay sesión)
    usuario_id      UUID        NULL REFERENCES public.users(id) ON DELETE SET NULL,
    -- IP del cliente (obtenida de x-forwarded-for o x-real-ip)
    ip              TEXT        NOT NULL DEFAULT 'desconocida',
    -- Ruta que se intentó acceder
    ruta            TEXT        NULL,
    -- Metadata adicional en formato JSON (user-agent, redirectTo, etc.)
    metadata        JSONB       NULL,
    -- Timestamp del evento
    ocurrido_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.security_events IS
  'Registro inmutable de eventos de seguridad de acceso. Alimentado por el middleware Edge.';
COMMENT ON COLUMN public.security_events.tipo IS
  'Categoría del evento: login, acceso admin, cuenta suspendida, intento de open-redirect, etc.';
COMMENT ON COLUMN public.security_events.usuario_id IS
  'UUID del usuario involucrado. NULL si no había sesión activa al momento del evento.';
COMMENT ON COLUMN public.security_events.ip IS
  'Dirección IP del cliente. Prioriza x-forwarded-for (Vercel/Cloudflare).';
COMMENT ON COLUMN public.security_events.metadata IS
  'Información adicional estructurada: user-agent, parámetro redirectTo, motivo de denegación, etc.';

-- Índices para el panel de administración y alertas
CREATE INDEX IF NOT EXISTS idx_security_events_tipo       ON public.security_events (tipo);
CREATE INDEX IF NOT EXISTS idx_security_events_usuario    ON public.security_events (usuario_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip         ON public.security_events (ip);
CREATE INDEX IF NOT EXISTS idx_security_events_ocurrido   ON public.security_events (ocurrido_at DESC);
-- Índice compuesto para detección de ataques por IP + tipo en ventana de tiempo
CREATE INDEX IF NOT EXISTS idx_security_events_ip_tipo    ON public.security_events (ip, tipo, ocurrido_at DESC);

-- -----------------------------------------------------------------------------
-- SECCIÓN 3: RLS — Inmutabilidad total
-- Los clientes NO pueden insertar, modificar ni borrar eventos de seguridad.
-- La inserción se hace ÚNICAMENTE vía la función RPC con SECURITY DEFINER.
-- Los admins pueden leer. Los usuarios ven solo sus propios eventos.
-- -----------------------------------------------------------------------------

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin lee todos los eventos de seguridad"
    ON public.security_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.rol = 'admin'
        )
    );

CREATE POLICY "Usuario ve sus propios eventos de seguridad"
    ON public.security_events FOR SELECT
    USING (auth.uid() = usuario_id);

-- CRÍTICO: No hay política INSERT/UPDATE/DELETE para authenticated o anon.
-- Solo la función SECURITY DEFINER puede insertar (bypasea RLS).

-- -----------------------------------------------------------------------------
-- SECCIÓN 4: Función RPC para insertar eventos (SECURITY DEFINER)
-- El middleware Edge llama a esta función a través del service_role client.
-- Separar la lógica de inserción del cliente evita exponer credenciales admin.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.registrar_evento_seguridad(
    p_tipo          TEXT,
    p_usuario_id    UUID        DEFAULT NULL,
    p_ip            TEXT        DEFAULT 'desconocida',
    p_ruta          TEXT        DEFAULT NULL,
    p_metadata      JSONB       DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.security_events (tipo, usuario_id, ip, ruta, metadata)
    VALUES (p_tipo, p_usuario_id, p_ip, p_ruta, p_metadata)
    RETURNING id INTO v_id;

    RETURN v_id;
EXCEPTION
    WHEN OTHERS THEN
        -- El log de seguridad nunca debe bloquear el flujo principal
        RAISE WARNING '[SECURITY] Error registrando evento %: %', p_tipo, SQLERRM;
        RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.registrar_evento_seguridad IS
  'Función SECURITY DEFINER para insertar eventos de seguridad desde el middleware Edge.
   Bypasea RLS para garantizar inmutabilidad: ningún cliente puede insertar directamente.
   Nunca bloquea el flujo principal aunque falle.';

-- -----------------------------------------------------------------------------
-- SECCIÓN 5: Vista de resumen para el panel de administración
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.security_events_resumen AS
SELECT
    tipo,
    ip,
    COUNT(*)                                        AS total,
    MAX(ocurrido_at)                                AS ultimo_evento,
    COUNT(DISTINCT usuario_id)                      AS usuarios_unicos
FROM public.security_events
WHERE ocurrido_at > NOW() - INTERVAL '24 hours'
GROUP BY tipo, ip
ORDER BY total DESC;

COMMENT ON VIEW public.security_events_resumen IS
  'Vista de actividad de seguridad de las últimas 24 horas. Útil para detectar IPs sospechosas.';

COMMIT;
