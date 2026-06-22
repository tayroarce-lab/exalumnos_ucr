-- =============================================================================
-- MIGRACIÓN 20260611000000: Limpieza de duplicado + Tabla de Baneos
-- Descripción : Elimina la tabla profile_reports (duplicado de reportes_perfil
--               que ya existe con trigger de auto-suspensión en 01_init_db.sql)
--               y crea la tabla user_bans para historial de baneos manuales.
-- =============================================================================

-- Eliminar tabla duplicada si fue aplicada por error
DROP TABLE IF EXISTS public.profile_reports CASCADE;
DROP TYPE IF EXISTS report_reason_enum CASCADE;
DROP TYPE IF EXISTS report_status_enum CASCADE;

-- =============================================================================
-- TABLA: user_bans
-- Historial de baneos manuales aplicados por administradores.
-- Complementa el campo activo=FALSE de users con contexto, duración y auditoría.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_bans (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    banned_by   UUID        NOT NULL REFERENCES public.users(id),
    reason      TEXT        NOT NULL,
    expires_at  TIMESTAMPTZ,                  -- NULL = baneo permanente
    lifted_at   TIMESTAMPTZ,                  -- NULL = sigue activo
    lifted_by   UUID        REFERENCES public.users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id   ON public.user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_banned_by ON public.user_bans(banned_by);
CREATE INDEX IF NOT EXISTS idx_user_bans_active     ON public.user_bans(user_id) WHERE lifted_at IS NULL;

-- RLS
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer el historial completo
CREATE POLICY "user_bans_select_admin"
ON public.user_bans FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
);

-- Solo admins pueden insertar baneos
CREATE POLICY "user_bans_insert_admin"
ON public.user_bans FOR INSERT
TO authenticated
WITH CHECK (
    banned_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
);

-- Solo admins pueden actualizar (levantar un baneo)
CREATE POLICY "user_bans_update_admin"
ON public.user_bans FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
);

-- Conectar con audit trail existente
CREATE TRIGGER disparador_auditoria_user_bans
    AFTER INSERT OR UPDATE OR DELETE
    ON public.user_bans
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_auditoria();

COMMENT ON TABLE public.user_bans IS
    'Historial de baneos manuales por administradores. Cada fila representa
     un evento de suspensión con su motivo, duración y quién lo aplicó.
     Complementa el campo activo en users que el trigger de reportes maneja.';

COMMENT ON COLUMN public.user_bans.expires_at IS 'NULL indica baneo permanente';
COMMENT ON COLUMN public.user_bans.lifted_at  IS 'NULL indica que el baneo sigue activo';
