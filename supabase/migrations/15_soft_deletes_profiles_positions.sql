-- =============================================================================
-- MIGRACIÓN 15: Formalización del Borrado Lógico en Perfiles y Posiciones
-- Descripción : Consolida y refuerza el sistema de Soft Delete para las tablas
--               `users` (perfiles) y `posiciones`. Añade índices parciales para
--               consultas eficientes, una función de restauración y una función
--               auxiliar de borrado para uso exclusivo del backend (SECURITY DEFINER).
--
-- NOTA: La columna `deleted_at` ya existe en ambas tablas (migración 20260605150600).
--       Este script agrega las capas de seguridad, rendimiento y utilidad que faltaban.
-- Autor       : Sistema de Gestión Alumni UCR
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECCIÓN 1: Índices Parciales para Consultas de Soft Delete
-- Descripción : Los índices parciales con `WHERE deleted_at IS NULL` reducen
--               drásticamente el tamaño del índice y aceleran las consultas
--               más frecuentes: "dame todos los perfiles/posiciones activos".
-- =============================================================================

-- Índices para la tabla `users` (perfiles)
CREATE INDEX IF NOT EXISTS idx_users_activos_rol
    ON public.users (rol, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_activos_email
    ON public.users (email)
    WHERE deleted_at IS NULL;

-- Índice para recuperación: localizar registros eliminados recientemente
CREATE INDEX IF NOT EXISTS idx_users_eliminados
    ON public.users (deleted_at DESC)
    WHERE deleted_at IS NOT NULL;

-- Índices para la tabla `posiciones`
CREATE INDEX IF NOT EXISTS idx_posiciones_activas_exalumno
    ON public.posiciones (exalumno_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posiciones_activas_estado
    ON public.posiciones (estado, created_at DESC)
    WHERE deleted_at IS NULL;

-- Índice para recuperación de posiciones eliminadas (auditoría / admin)
CREATE INDEX IF NOT EXISTS idx_posiciones_eliminadas
    ON public.posiciones (deleted_at DESC)
    WHERE deleted_at IS NOT NULL;

-- =============================================================================
-- SECCIÓN 2: Función de Borrado Lógico de Perfiles
-- Descripción : Estampa `deleted_at` en el perfil del usuario autenticado.
--               Uso: SECURITY DEFINER para que el trigger de cascada pueda
--               propagarse a posiciones, matches y donaciones relacionadas.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.eliminar_perfil_logico(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validar que el perfil exista y no esté ya eliminado
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = p_user_id AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Perfil no encontrado o ya fue eliminado: %', p_user_id;
    END IF;

    -- Estampar la fecha actual como marca de borrado lógico
    -- El trigger `trigger_soft_delete_users` propagará en cascada a posiciones,
    -- matches y donaciones relacionadas automáticamente.
    UPDATE public.users
    SET deleted_at = NOW()
    WHERE id = p_user_id;

    RAISE NOTICE '[SOFT DELETE] Perfil % marcado como eliminado en %', p_user_id, NOW();
END;
$$;

COMMENT ON FUNCTION public.eliminar_perfil_logico(UUID) IS
    'Ejecuta el borrado lógico de un perfil de usuario. El trigger en cascada
     propagará deleted_at a posiciones, matches y donaciones del mismo usuario.
     Solo debe llamarse desde el backend con service_role o desde un admin action.';

-- =============================================================================
-- SECCIÓN 3: Función de Borrado Lógico de Posiciones
-- Descripción : Estampa `deleted_at` en una posición específica.
--               Valida que el exalumno solicitante sea el dueño de la posición.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.eliminar_posicion_logica(
    p_posicion_id UUID,
    p_exalumno_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validar propiedad: solo el exalumno dueño puede borrar lógicamente su posición
    IF NOT EXISTS (
        SELECT 1 FROM public.posiciones
        WHERE id = p_posicion_id
          AND exalumno_id = p_exalumno_id
          AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION
            'Posición no encontrada, no autorizada o ya eliminada. posicion_id=%, exalumno_id=%',
            p_posicion_id, p_exalumno_id;
    END IF;

    -- Estampar marca de borrado lógico
    -- El trigger `trigger_soft_delete_posiciones` propagará a matches relacionados.
    UPDATE public.posiciones
    SET deleted_at = NOW()
    WHERE id = p_posicion_id AND exalumno_id = p_exalumno_id;

    RAISE NOTICE '[SOFT DELETE] Posición % marcada como eliminada en %', p_posicion_id, NOW();
END;
$$;

COMMENT ON FUNCTION public.eliminar_posicion_logica(UUID, UUID) IS
    'Ejecuta el borrado lógico de una posición validando la propiedad del exalumno.
     El trigger en cascada propagará deleted_at a los matches asociados a la posición.';

-- =============================================================================
-- SECCIÓN 4: Función de Restauración (Recuperación de Datos)
-- Descripción : Permite revertir un borrado lógico, poniendo deleted_at a NULL.
--               Exclusiva para administradores (service_role).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.restaurar_registro(
    p_tabla   TEXT,
    p_id      UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validar que la tabla sea una de las permitidas (evitar SQL injection)
    IF p_tabla NOT IN ('users', 'posiciones', 'matches', 'donaciones') THEN
        RAISE EXCEPTION 'Tabla no permitida para restauración: %', p_tabla;
    END IF;

    -- Ejecutar restauración dinámica según la tabla indicada
    EXECUTE format(
        'UPDATE public.%I SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
        p_tabla
    ) USING p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró registro eliminado para restaurar. tabla=%, id=%', p_tabla, p_id;
    END IF;

    RAISE NOTICE '[RESTAURACIÓN] Registro % en tabla % restaurado exitosamente.', p_id, p_tabla;
END;
$$;

COMMENT ON FUNCTION public.restaurar_registro(TEXT, UUID) IS
    'Revierte un borrado lógico sobre tablas críticas (users, posiciones, matches, donaciones).
     Uso exclusivo de administradores vía service_role. Valida la tabla con whitelist
     para prevenir inyección SQL dinámica.';

-- =============================================================================
-- SECCIÓN 5: Vista Auxiliar — Registros Recientemente Eliminados (Admin)
-- Descripción : Consolida en una sola vista los perfiles y posiciones borrados
--               lógicamente, útil para el panel de recuperación de datos del admin.
-- =============================================================================

CREATE OR REPLACE VIEW public.vista_registros_eliminados AS
    SELECT
        'perfil'            AS tipo_registro,
        u.id                AS registro_id,
        u.nombre            || ' ' || COALESCE(u.apellidos, '')  AS descripcion,
        u.email             AS detalle,
        u.deleted_at        AS eliminado_en,
        NULL::UUID          AS eliminado_por  -- Disponible vía audit_logs si se cruza
    FROM public.users u
    WHERE u.deleted_at IS NOT NULL

    UNION ALL

    SELECT
        'posicion'          AS tipo_registro,
        p.id                AS registro_id,
        p.titulo            AS descripcion,
        p.empresa           AS detalle,
        p.deleted_at        AS eliminado_en,
        NULL::UUID          AS eliminado_por
    FROM public.posiciones p
    WHERE p.deleted_at IS NOT NULL

ORDER BY eliminado_en DESC;

COMMENT ON VIEW public.vista_registros_eliminados IS
    'Vista consolidada de perfiles y posiciones con borrado lógico activo.
     Uso exclusivo del panel administrativo para recuperación y auditoría.
     Cruzar con vista_auditoria_detallada para obtener quién realizó el borrado.';

COMMIT;
