-- =============================================================================
-- MIGRACIÓN 16: Corrección del Sistema de Matching (Schema Refactor Fix)
-- Descripción : Reescribe las funciones SQL de matching para operar sobre el
--               esquema actual. Las tablas `estudiantes` y `exalumnos` fueron
--               eliminadas en la migración 20260608170000 y sus campos fueron
--               absorbidos por `public.users` (con campo `rol`).
--
-- CAMBIOS CRÍTICOS:
--   1. calcular_score_matching()         → Lee de public.users (rol='estudiante'/'exalumno')
--   2. calcular_score_posicion_extendido() → Lee de public.users + public.curriculums
--   3. view_student_position_matches      → Reescrita con nuevo schema y estado 'activa'
--
-- DEPENDENCIA: Requiere migraciones 01, 08, 11, 20260608170000
-- Autor       : Sistema de Gestión Alumni UCR
-- =============================================================================

BEGIN;

-- =============================================================================
-- FUNCIÓN 1: calcular_score_matching (Mentoría: Estudiante ↔ Exalumno)
-- Ponderación (máx. 100 pts):
--   +30 → Misma carrera principal (carrera_principal_id)
--   +30 → Intersección proporcional de áreas de interés (TEXT[])
--   +20 → Sector del exalumno ↔ área temática del proyecto del estudiante
--   +20 → Al menos un tipo de apoyo coincide (ofrece ↔ busca)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.calcular_score_matching(
    p_estudiante_id UUID,
    p_exalumno_id   UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    -- Perfil del estudiante (desde public.users)
    v_carrera_est_id        INTEGER;
    v_areas_interes_est     TEXT[];
    v_busca_mentoria        BOOLEAN;
    v_busca_empleo          BOOLEAN;
    v_busca_pasantia        BOOLEAN;
    v_busca_financiamiento  BOOLEAN;

    -- Perfil del exalumno (desde public.users)
    v_carrera_exal_id       INTEGER;
    v_areas_interes_exal    TEXT[];
    v_sector_industria      TEXT[];
    v_ofrece_mentoria       BOOLEAN;
    v_ofrece_empleo         BOOLEAN;
    v_ofrece_pasantia       BOOLEAN;
    v_ofrece_donacion       BOOLEAN;

    -- Variables de cálculo
    v_score                 INTEGER := 0;
    v_interseccion_areas    INTEGER := 0;
    v_total_areas_est       INTEGER := 0;
    v_puntaje_areas         INTEGER := 0;
BEGIN
    -- ── CARGA DATOS DEL ESTUDIANTE (rol = 'estudiante') ─────────────────────
    SELECT
        u.carrera_principal_id,
        u.areas_de_interes,
        u.busca_mentoria,
        u.busca_empleo,
        u.busca_pasantia,
        u.busca_financiamiento
    INTO
        v_carrera_est_id,
        v_areas_interes_est,
        v_busca_mentoria,
        v_busca_empleo,
        v_busca_pasantia,
        v_busca_financiamiento
    FROM public.users u
    WHERE u.id = p_estudiante_id
      AND u.rol = 'estudiante'
      AND u.deleted_at IS NULL;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CARGA DATOS DEL EXALUMNO (rol = 'exalumno') ─────────────────────────
    SELECT
        u.carrera_principal_id,
        u.areas_de_interes,
        u.sector_industria,
        u.ofrece_mentoria,
        u.ofrece_empleo,
        u.ofrece_pasantia,
        u.ofrece_donacion_dinero
    INTO
        v_carrera_exal_id,
        v_areas_interes_exal,
        v_sector_industria,
        v_ofrece_mentoria,
        v_ofrece_empleo,
        v_ofrece_pasantia,
        v_ofrece_donacion
    FROM public.users u
    WHERE u.id = p_exalumno_id
      AND u.rol = 'exalumno'
      AND u.deleted_at IS NULL;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CRITERIO 1: MISMA CARRERA PRINCIPAL (+30 pts) ────────────────────────
    -- Compara por ID de carrera_campus (ambos apuntan a la misma tabla)
    IF v_carrera_est_id IS NOT NULL
       AND v_carrera_exal_id IS NOT NULL
       AND v_carrera_est_id = v_carrera_exal_id
    THEN
        v_score := v_score + 30;
    END IF;

    -- ── CRITERIO 2: ÁREAS DE INTERÉS EN COMÚN (máx +30 pts, proporcional) ───
    v_total_areas_est := COALESCE(array_length(v_areas_interes_est, 1), 0);

    IF v_total_areas_est > 0 AND v_areas_interes_exal IS NOT NULL THEN
        SELECT COUNT(*) INTO v_interseccion_areas
        FROM unnest(v_areas_interes_est) AS area_est
        WHERE LOWER(TRIM(area_est)) = ANY(
            SELECT LOWER(TRIM(a)) FROM unnest(v_areas_interes_exal) AS a
        );

        v_puntaje_areas := ROUND((v_interseccion_areas::NUMERIC / v_total_areas_est) * 30);
        v_score := v_score + v_puntaje_areas;
    END IF;

    -- ── CRITERIO 3: SECTOR EXALUMNO ↔ ÁREAS INTERÉS ESTUDIANTE (+20 pts) ────
    -- Verifica si algún sector del exalumno está entre las áreas del estudiante
    IF v_sector_industria IS NOT NULL AND v_areas_interes_est IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM unnest(v_sector_industria) AS sec
            WHERE LOWER(TRIM(sec)) = ANY(
                SELECT LOWER(TRIM(a)) FROM unnest(v_areas_interes_est) AS a
            )
        ) THEN
            v_score := v_score + 20;
        END IF;
    END IF;

    -- ── CRITERIO 4: TIPO DE APOYO OFRECIDO ↔ BUSCADO (+20 pts) ─────────────
    IF (v_ofrece_mentoria  AND v_busca_mentoria)
    OR (v_ofrece_empleo    AND v_busca_empleo)
    OR (v_ofrece_pasantia  AND v_busca_pasantia)
    OR (v_ofrece_donacion  AND v_busca_financiamiento)
    THEN
        v_score := v_score + 20;
    END IF;

    RETURN LEAST(100, GREATEST(0, v_score));
END;
$$;

COMMENT ON FUNCTION public.calcular_score_matching(UUID, UUID) IS
    'Calcula el score de compatibilidad mentoría (0-100) entre estudiante y exalumno.
     Opera sobre public.users con campo rol. Requiere schema v20260608.';

-- =============================================================================
-- FUNCIÓN 2: calcular_score_posicion_extendido (Estudiante ↔ Posición)
-- Ponderación unificada con matching.ts TypeScript (máx. 100 pts):
--   +35 → Sector de la posición contiene la carrera/área del estudiante
--   +35 → Habilidades técnicas CV ∩ habilidades requeridas (proporcional)
--   +20 → Áreas de interés del estudiante ∩ sector de la posición (proporcional)
--   +10 → Tipo de apoyo buscado coincide con tipo de posición
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
    -- Datos del estudiante (desde public.users)
    v_areas_interes_est     TEXT[];
    v_busca_empleo          BOOLEAN;
    v_busca_pasantia        BOOLEAN;

    -- Habilidades técnicas del CV (desde public.curriculums)
    v_habilidades_cv_raw    JSONB;
    v_habilidades_cv        TEXT[];

    -- Datos de la posición (desde public.posiciones)
    v_sector_posicion       TEXT[];
    v_habilidades_req       TEXT[];
    v_tipo_posicion         TEXT;

    -- Variables de cálculo
    v_score                 INTEGER := 0;
    v_interseccion          INTEGER := 0;
    v_total_req             INTEGER := 0;
    v_hab_key               TEXT;
BEGIN
    -- ── CARGA DATOS DEL ESTUDIANTE ───────────────────────────────────────────
    SELECT
        u.areas_de_interes,
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
    -- curriculums.habilidades_tecnicas es JSONB: {"React": "avanzado", ...}
    -- Extraemos las claves (nombres de habilidades) como array de texto
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
      AND p.estado = 'activa'           -- Solo posiciones activas (no 'abierta')
      AND p.deleted_at IS NULL;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CRITERIO 1: ÁREA ESTUDIANTE ⊆ SECTOR POSICIÓN (+35 pts) ─────────────
    -- Verifica si alguna área de interés del estudiante está en el sector de la posición
    IF v_areas_interes_est IS NOT NULL AND v_sector_posicion IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM unnest(v_areas_interes_est) AS area
            WHERE LOWER(TRIM(area)) = ANY(
                SELECT LOWER(TRIM(s)) FROM unnest(v_sector_posicion) AS s
            )
        ) THEN
            v_score := v_score + 35;
        END IF;
    END IF;

    -- ── CRITERIO 2: HABILIDADES CV ∩ HABILIDADES REQUERIDAS (+35 pts, prop.) ─
    v_total_req := COALESCE(array_length(v_habilidades_req, 1), 0);

    IF v_total_req > 0 AND array_length(v_habilidades_cv, 1) > 0 THEN
        SELECT COUNT(*) INTO v_interseccion
        FROM unnest(v_habilidades_req) AS req
        WHERE LOWER(TRIM(req)) = ANY(
            SELECT LOWER(TRIM(h)) FROM unnest(v_habilidades_cv) AS h
        );

        v_score := v_score + ROUND((v_interseccion::NUMERIC / v_total_req) * 35);
    END IF;

    -- ── CRITERIO 3: ÁREAS INTERÉS ∩ SECTOR POSICIÓN (+20 pts, proporcional) ─
    v_total_req := COALESCE(array_length(v_sector_posicion, 1), 0);

    IF v_total_req > 0 AND v_areas_interes_est IS NOT NULL THEN
        SELECT COUNT(*) INTO v_interseccion
        FROM unnest(v_sector_posicion) AS sec
        WHERE LOWER(TRIM(sec)) = ANY(
            SELECT LOWER(TRIM(a)) FROM unnest(v_areas_interes_est) AS a
        );

        v_score := v_score + ROUND((v_interseccion::NUMERIC / v_total_req) * 20);
    END IF;

    -- ── CRITERIO 4: TIPO DE APOYO BUSCADO ↔ TIPO DE POSICIÓN (+10 pts) ──────
    IF (LOWER(v_tipo_posicion) = 'empleo'   AND v_busca_empleo)
    OR (LOWER(v_tipo_posicion) = 'pasantia' AND v_busca_pasantia)
    THEN
        v_score := v_score + 10;
    END IF;

    RETURN LEAST(100, GREATEST(0, v_score));
END;
$$;

COMMENT ON FUNCTION public.calcular_score_posicion_extendido(UUID, UUID) IS
    'Calcula el score de compatibilidad posición (0-100) entre estudiante y vacante.
     Ponderación alineada con calcularScorePuesto() en matching.ts.
     Opera sobre public.users + public.curriculums. Requiere schema v20260608.';

-- =============================================================================
-- VISTA 3: view_student_position_matches (Reescrita)
-- Usa el schema actual: estado='activa', deleted_at IS NULL, curriculums (no curriculum)
-- Aplica un umbral de score > 30 para filtrar ruido.
-- =============================================================================

DROP VIEW IF EXISTS public.view_student_position_matches;

CREATE OR REPLACE VIEW public.view_student_position_matches AS
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

COMMENT ON VIEW public.view_student_position_matches IS
    'Cruces estudiante ↔ posición con score > 30. Opera sobre schema v20260608.
     Reemplaza la versión anterior que usaba la tabla eliminada `estudiantes`.';

COMMIT;
