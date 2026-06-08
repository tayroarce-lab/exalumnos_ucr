-- =============================================================================
-- MIGRACIÓN 14: Disparadores de Auditoría por Tabla (Audit Triggers)
-- Descripción : Vincula la función registrar_auditoria() a cada tabla crítica
--               de la plataforma. Cada trigger cubre los 3 eventos DML relevantes.
--
-- TABLAS CUBIERTAS:
--   1. applications → Estados del ciclo de vida de candidatos
--   2. posiciones   → Apertura, modificación y cierre de posiciones
--   3. matches      → Confirmaciones de mentorías por administradores
--   4. donaciones   → Transacciones y cambios de estado de donaciones
--
-- DEPENDENCIA: Requiere migración 13 (tabla audit_logs + función registrar_auditoria)
-- Autor       : Sistema de Gestión Alumni UCR
-- =============================================================================

-- =============================================================================
-- TABLA 1: applications
-- Evento crítico: Exalumno rechaza un candidato (status → 'descartado')
--                 Exalumno selecciona un candidato (status → 'seleccionado')
--                 Estudiante envía aplicación (INSERT)
--                 Estudiante retira aplicación (DELETE)
-- =============================================================================

DROP TRIGGER IF EXISTS disparador_auditoria_applications ON public.applications;

CREATE TRIGGER disparador_auditoria_applications
    AFTER INSERT OR UPDATE OR DELETE
    ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_auditoria();

COMMENT ON TRIGGER disparador_auditoria_applications ON public.applications IS
    'Registra en audit_logs toda modificación al ciclo de vida de las aplicaciones:
     inserción al postular, cambio de estado por el exalumno y retiro por el estudiante.';

-- =============================================================================
-- TABLA 2: posiciones
-- Evento crítico: Administrador aprueba/rechaza una posición publicada
--                 Exalumno crea, edita o cierra una posición
-- =============================================================================

DROP TRIGGER IF EXISTS disparador_auditoria_posiciones ON public.posiciones;

CREATE TRIGGER disparador_auditoria_posiciones
    AFTER INSERT OR UPDATE OR DELETE
    ON public.posiciones
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_auditoria();

COMMENT ON TRIGGER disparador_auditoria_posiciones ON public.posiciones IS
    'Registra en audit_logs la creación, edición, aprobación o eliminación
     de posiciones laborales y de mentoría.';

-- =============================================================================
-- TABLA 3: matches
-- Evento crítico: Administrador confirma o cancela un match entre estudiante
--                 y exalumno/posición
-- =============================================================================

DROP TRIGGER IF EXISTS disparador_auditoria_matches ON public.matches;

CREATE TRIGGER disparador_auditoria_matches
    AFTER INSERT OR UPDATE OR DELETE
    ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_auditoria();

COMMENT ON TRIGGER disparador_auditoria_matches ON public.matches IS
    'Registra en audit_logs toda acción sobre el sistema de matches:
     confirmaciones manuales de admin, cancelaciones y cambios de estado.';

-- =============================================================================
-- TABLA 4: donaciones
-- Evento crítico: Cambio de estado de una donación (pendiente → confirmada → rechazada)
-- =============================================================================

DROP TRIGGER IF EXISTS disparador_auditoria_donaciones ON public.donaciones;

CREATE TRIGGER disparador_auditoria_donaciones
    AFTER INSERT OR UPDATE OR DELETE
    ON public.donaciones
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_auditoria();

COMMENT ON TRIGGER disparador_auditoria_donaciones ON public.donaciones IS
    'Registra en audit_logs todos los eventos del ciclo de vida de donaciones,
     incluyendo el registro inicial y cambios de estado de confirmación.';

-- =============================================================================
-- SECCIÓN AUXILIAR: Vista de Auditoría para el Panel de Administración
-- Descripción : Vista desnormalizada que facilita la consulta de logs desde
--               el frontend sin necesidad de JOINs manuales.
-- =============================================================================

CREATE OR REPLACE VIEW public.vista_auditoria_detallada AS
SELECT
    al.id                                               AS log_id,
    al.tabla_afectada,
    al.registro_id,
    al.accion,
    al.valor_viejo,
    al.valor_nuevo,
    -- Extraer solo el campo 'status' del JSON si existe (para filtros rápidos)
    al.valor_viejo  ->> 'status'                        AS estado_anterior,
    al.valor_nuevo  ->> 'status'                        AS estado_nuevo,
    -- Datos del usuario responsable de la acción
    al.usuario_id,
    u.nombre                                            AS nombre_usuario,
    u.email                                             AS email_usuario,
    u.rol                                               AS rol_usuario,
    al.fecha_registro
FROM
    public.audit_logs al
    LEFT JOIN public.users u ON u.id = al.usuario_id
ORDER BY
    al.fecha_registro DESC;

COMMENT ON VIEW public.vista_auditoria_detallada IS
    'Vista desnormalizada para el panel administrativo. Expone los logs de
     auditoría junto con la información del usuario responsable de cada acción.
     No incluye datos sensibles adicionales; solo los campos del perfil público.';

-- Seguridad RLS para la vista (hereda las políticas de audit_logs + users)
-- Los administradores pueden consultar esta vista directamente desde el dashboard.

-- =============================================================================
-- VERIFICACIÓN: Confirmar que los triggers fueron creados correctamente
-- =============================================================================

DO $$
DECLARE
    v_total_triggers INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_total_triggers
    FROM information_schema.triggers
    WHERE trigger_name LIKE 'disparador_auditoria_%'
      AND event_object_schema = 'public';

    IF v_total_triggers = 4 THEN
        RAISE NOTICE '[AUDITORÍA] ✓ Los 4 disparadores de auditoría fueron creados exitosamente.';
    ELSE
        RAISE WARNING '[AUDITORÍA] ⚠ Solo se encontraron % de 4 disparadores esperados.', v_total_triggers;
    END IF;
END;
$$;
