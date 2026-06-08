-- =============================================================================
-- MIGRACIÓN 13: Sistema de Auditoría (Audit Trails)
-- Descripción : Crea la tabla central de logs de auditoría y la función
--               reutilizable que alimenta todos los triggers de auditoría.
--               Registra toda modificación crítica de estado en la plataforma:
--               quién ejecutó la acción, sobre qué registro, qué cambió y cuándo.
-- Tablas auditadas: applications, posiciones, matches, donaciones
-- Autor       : Sistema de Gestión Alumni UCR
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECCIÓN 1: Tabla Principal de Logs de Auditoría
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_afectada  TEXT        NOT NULL,
    registro_id     UUID        NOT NULL,
    accion          TEXT        NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
    valor_viejo     JSONB       NULL,   -- NULL en INSERT (no había valor previo)
    valor_nuevo     JSONB       NULL,   -- NULL en DELETE (no hay valor posterior)
    usuario_id      UUID        NULL,   -- NULL si es acción de sistema/trigger en cascada
    fecha_registro  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.audit_logs IS 'Registro inmutable de todas las modificaciones a estados críticos de la plataforma.';
COMMENT ON COLUMN public.audit_logs.tabla_afectada IS 'Nombre de la tabla donde ocurrió el evento (ej: applications, posiciones).';
COMMENT ON COLUMN public.audit_logs.registro_id   IS 'PK del registro afectado en la tabla correspondiente.';
COMMENT ON COLUMN public.audit_logs.accion        IS 'Tipo de operación DML ejecutada: INSERT, UPDATE o DELETE.';
COMMENT ON COLUMN public.audit_logs.valor_viejo   IS 'Snapshot JSON del registro ANTES del cambio. NULL en INSERT.';
COMMENT ON COLUMN public.audit_logs.valor_nuevo   IS 'Snapshot JSON del registro DESPUÉS del cambio. NULL en DELETE.';
COMMENT ON COLUMN public.audit_logs.usuario_id    IS 'UUID del usuario autenticado que originó la acción (auth.uid()).';
COMMENT ON COLUMN public.audit_logs.fecha_registro IS 'Timestamp UTC exacto del evento. Generado automáticamente por el servidor.';

-- Índices para consultas frecuentes (tablero de auditoría, filtros por usuario/fecha)
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabla    ON public.audit_logs (tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_audit_logs_registro ON public.audit_logs (registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario  ON public.audit_logs (usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha    ON public.audit_logs (fecha_registro DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_accion   ON public.audit_logs (accion);

-- -----------------------------------------------------------------------------
-- SECCIÓN 2: Seguridad — La tabla de auditoría es de solo lectura para el rol
--             anon y authenticated. Solo el rol service_role puede insertar.
--             Ningún usuario puede UPDATE ni DELETE sobre logs (inmutabilidad).
-- -----------------------------------------------------------------------------

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Los administradores pueden leer todos los logs
CREATE POLICY "Administrador lee todos los logs de auditoria"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.rol = 'admin'
        )
    );

-- Política: Un usuario puede ver los logs que le conciernen directamente
CREATE POLICY "Usuario ve sus propios logs de auditoria"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = usuario_id);

-- CRÍTICO: Ningún cliente puede insertar directamente — solo los triggers (SECURITY DEFINER)
-- No se crea política INSERT para authenticated/anon. Solo service_role tiene bypass RLS.

-- -----------------------------------------------------------------------------
-- SECCIÓN 3: Función Reutilizable de Auditoría
-- Descripción : Función genérica invocada por TODOS los triggers de auditoría.
--               Detecta automáticamente el tipo de operación (INSERT/UPDATE/DELETE),
--               extrae el id del registro y captura el usuario autenticado actual.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Corre con permisos de superusuario para saltarse RLS en audit_logs
SET search_path = public
AS $$
DECLARE
    v_registro_id   UUID;
    v_valor_viejo   JSONB;
    v_valor_nuevo   JSONB;
    v_usuario_id    UUID;
BEGIN
    -- Capturar el usuario autenticado via sesión de Supabase Auth
    v_usuario_id := auth.uid();

    -- Determinar el snapshot según el tipo de operación
    IF (TG_OP = 'INSERT') THEN
        v_registro_id := NEW.id;
        v_valor_viejo := NULL;
        v_valor_nuevo := to_jsonb(NEW);

    ELSIF (TG_OP = 'UPDATE') THEN
        v_registro_id := NEW.id;
        v_valor_viejo := to_jsonb(OLD);
        v_valor_nuevo := to_jsonb(NEW);

        -- Optimización: Solo registrar si hubo un cambio real en los datos
        IF v_valor_viejo = v_valor_nuevo THEN
            RETURN NEW;
        END IF;

    ELSIF (TG_OP = 'DELETE') THEN
        v_registro_id := OLD.id;
        v_valor_viejo := to_jsonb(OLD);
        v_valor_nuevo := NULL;
    END IF;

    -- Insertar el log de manera atómica con la operación original
    INSERT INTO public.audit_logs (
        tabla_afectada,
        registro_id,
        accion,
        valor_viejo,
        valor_nuevo,
        usuario_id
    ) VALUES (
        TG_TABLE_NAME,   -- Nombre de la tabla que disparó el trigger
        v_registro_id,
        TG_OP,
        v_valor_viejo,
        v_valor_nuevo,
        v_usuario_id
    );

    -- Retornar el registro correcto según la operación para no bloquear el flujo
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;

EXCEPTION
    -- Si el log falla, NO se debe bloquear la operación principal de negocio
    WHEN OTHERS THEN
        RAISE WARNING '[AUDITORÍA] Error al registrar log para tabla=%s, operacion=%s: %s',
            TG_TABLE_NAME, TG_OP, SQLERRM;
        IF (TG_OP = 'DELETE') THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
END;
$$;

COMMENT ON FUNCTION public.registrar_auditoria() IS
    'Función genérica SECURITY DEFINER para auditoría. Es invocada por múltiples triggers.
     Registra automáticamente el estado anterior/posterior y el usuario responsable.
     En caso de fallo, emite un WARNING pero NO bloquea la transacción original.';
