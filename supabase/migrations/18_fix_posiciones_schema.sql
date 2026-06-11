-- =============================================================================
-- MIGRACIÓN 18: Corrección de Esquema (Drift) en Posiciones
-- Descripción : Añade las columnas faltantes en public.posiciones que el código
--               ya espera utilizar (titulo, tipo, modalidad, jornada, lugar).
--               Rehabilita las vistas y funciones matemáticas correspondientes.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. AÑADIR COLUMNAS FALTANTES A POSICIONES
-- =============================================================================
ALTER TABLE public.posiciones
    ADD COLUMN IF NOT EXISTS titulo TEXT NOT NULL DEFAULT 'Posición sin título',
    ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('empleo', 'pasantia')),
    ADD COLUMN IF NOT EXISTS modalidad TEXT CHECK (modalidad IN ('presencial', 'remoto', 'hibrido')),
    ADD COLUMN IF NOT EXISTS jornada TEXT CHECK (jornada IN ('tiempo_completo', 'medio_tiempo', 'por_proyecto')),
    ADD COLUMN IF NOT EXISTS lugar TEXT;

-- Quitar el valor por defecto forzado de título para futuras inserciones, 
-- obligando a que se envíe explícitamente desde el frontend.
ALTER TABLE public.posiciones ALTER COLUMN titulo DROP DEFAULT;

-- =============================================================================
-- 2. AÑADIR COLUMNAS FALTANTES A USERS
-- =============================================================================
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS busca_pasantia BOOLEAN DEFAULT false;

-- =============================================================================
-- 3. REHABILITAR FUNCIÓN DE PUNTAJE (MATCHING)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.calcular_score_posicion_extendido(
    p_estudiante_id UUID,
    p_posicion_id   UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    -- Datos del estudiante
    v_areas_interes_est     TEXT[];
    v_habilidades_cv_raw    JSONB;
    v_habilidades_cv        TEXT[];
    v_busca_empleo          BOOLEAN;
    v_busca_pasantia        BOOLEAN;

    -- Datos de la posición
    v_sector_posicion       TEXT[];
    v_habilidades_req       TEXT[];
    v_tipo_posicion         TEXT;

    -- Variables de cálculo
    v_score                 INTEGER := 0;
    v_match_areas           BOOLEAN := FALSE;
    v_match_habs            INTEGER := 0;
    v_total_habs_req        INTEGER := 0;
BEGIN
    -- ── CARGA DATOS DEL ESTUDIANTE ───────────────────────────────────────────
    SELECT
        ARRAY(
            SELECT c.nombre 
            FROM public.users_areas_interes uai
            JOIN public.catalogo_areas_interes c ON c.id = uai.area_id
            WHERE uai.user_id = p_estudiante_id
        ),
        u.busca_empleo,
        u.busca_pasantia
    INTO
        v_areas_interes_est,
        v_busca_empleo,
        v_busca_pasantia
    FROM public.users u
    WHERE u.id = p_estudiante_id
      AND u.rol = 'estudiante'
      AND u.deleted_at IS NULL;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CARGA HABILIDADES TÉCNICAS DEL CV ────────────────────────────────────
    SELECT cv.habilidades_tecnicas
    INTO   v_habilidades_cv_raw
    FROM   public.curriculums cv
    WHERE  cv.user_id = p_estudiante_id;

    IF v_habilidades_cv_raw IS NOT NULL THEN
        SELECT ARRAY(
            SELECT jsonb_object_keys(v_habilidades_cv_raw)
        ) INTO v_habilidades_cv;
    ELSE
        v_habilidades_cv := ARRAY[]::TEXT[];
    END IF;

    -- ── CARGA DATOS DE LA POSICIÓN ───────────────────────────────────────────
    SELECT
        p.sector,
        p.habilidades_requeridas,
        p.tipo
    INTO
        v_sector_posicion,
        v_habilidades_req,
        v_tipo_posicion
    FROM public.posiciones p
    WHERE p.id = p_posicion_id
      AND p.estado = 'activa'
      AND p.deleted_at IS NULL;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CRITERIO 1: ÁREA ESTUDIANTE ⊆ SECTOR POSICIÓN (+35 pts) ─────────────
    IF v_areas_interes_est IS NOT NULL AND v_sector_posicion IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 
            FROM unnest(v_areas_interes_est) a
            JOIN unnest(v_sector_posicion) s ON a ILIKE s
        ) INTO v_match_areas;

        IF v_match_areas THEN
            v_score := v_score + 35;
        END IF;
    END IF;

    -- ── CRITERIO 2: COINCIDENCIA DE HABILIDADES (+40 pts máximo) ────────────
    IF v_habilidades_req IS NOT NULL AND array_length(v_habilidades_req, 1) > 0 THEN
        v_total_habs_req := array_length(v_habilidades_req, 1);
        
        IF v_habilidades_cv IS NOT NULL AND array_length(v_habilidades_cv, 1) > 0 THEN
            SELECT count(*)
            INTO v_match_habs
            FROM unnest(v_habilidades_req) req
            JOIN unnest(v_habilidades_cv) cv ON req ILIKE cv;

            v_score := v_score + ((v_match_habs::FLOAT / v_total_habs_req) * 40)::INTEGER;
        END IF;
    ELSE
        v_score := v_score + 40;
    END IF;

    -- ── CRITERIO 3: BUSCA MENTORÍA O EMPLEO/PASANTÍA (+15 pts base) ─────────
    IF v_busca_empleo OR v_busca_pasantia THEN
        v_score := v_score + 15;
    END IF;

    -- ── CRITERIO 4: TIPO DE APOYO BUSCADO ↔ TIPO DE POSICIÓN (+10 pts) ──────
    IF v_tipo_posicion IS NOT NULL THEN
        IF (LOWER(v_tipo_posicion) = 'empleo'   AND v_busca_empleo)
        OR (LOWER(v_tipo_posicion) = 'pasantia' AND v_busca_pasantia)
        THEN
            v_score := v_score + 10;
        END IF;
    END IF;

    RETURN LEAST(100, GREATEST(0, v_score));
END;
$$;

-- =============================================================================
-- 4. REHABILITAR VISTA DE MATCHING CON CAMPOS NUEVOS
-- =============================================================================

DROP VIEW IF EXISTS public.view_student_position_matches;

CREATE VIEW public.view_student_position_matches AS
SELECT
    u.id                                                          AS estudiante_id,
    p.id                                                          AS posicion_id,
    p.empresa,
    p.titulo,
    p.descripcion_general,
    p.sector,
    p.tipo                                                        AS tipo_posicion,
    p.modalidad,
    p.lugar,
    p.created_at,
    public.calcular_score_posicion_extendido(u.id, p.id)          AS score_match
FROM
    public.users u
    CROSS JOIN public.posiciones p
WHERE
    u.rol = 'estudiante'
    AND u.deleted_at IS NULL
    AND u.visible_en_directorio = TRUE
    AND (u.busca_empleo = TRUE OR u.busca_pasantia = TRUE)
    AND p.estado = 'activa'
    AND p.deleted_at IS NULL
    AND public.calcular_score_posicion_extendido(u.id, p.id) > 30;

COMMIT;
