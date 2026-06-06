-- =============================================================================
-- MIGRACIÓN 11: Matching Extendido (Estudiante - Posición)
-- Descripción : Algoritmo para calcular la compatibilidad entre el perfil
--               de un estudiante y una posición/vacante específica.
-- Autor       : Sistema de Gestión Alumni UCR
-- =============================================================================

-- Para garantizar que la tabla soporte los criterios exactos del matching extendido,
-- agregamos las columnas necesarias si no existen (idempotente).
ALTER TABLE public.posiciones 
  ADD COLUMN IF NOT EXISTS carrera_requerida VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sede_requerida VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tipo_posicion VARCHAR(50); -- Ej: mentoria, empleo, pasantia

-- =============================================================================
-- [VERDE - FUNCION: calcular_score_posicion_extendido]
-- Función almacenada que ejecuta el algoritmo de puntuación (0-100) evaluando:
-- 1. Carrera Requerida (40 pts)
-- 2. Sede de la Posición (20 pts)
-- 3. Tipo de Apoyo / Modalidad (20 pts)
-- 4. Áreas de Interés / Sector (20 pts)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calcular_score_posicion_extendido(
    p_estudiante_id UUID,
    p_posicion_id   UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Datos del Estudiante
    v_carrera_est         VARCHAR;
    v_sede_est            VARCHAR;
    v_areas_interes_est   TEXT[];
    v_busca_mentoria      BOOLEAN;
    v_busca_empleo        BOOLEAN;
    v_busca_pasantia      BOOLEAN;
    
    -- Datos de la Posición
    v_carrera_req         VARCHAR;
    v_sede_req            VARCHAR;
    v_tipo_posicion       VARCHAR;
    v_sectores_pos        TEXT[];
    
    -- Variables de Cálculo
    v_score               INTEGER := 0;
    v_interseccion_areas  INTEGER := 0;
    v_total_req_areas     INTEGER := 0;
    v_puntaje_areas       INTEGER := 0;
BEGIN
    -- ── CARGA DATOS DEL ESTUDIANTE ──────────────────────────────────────────
    SELECT 
        e.carrera, e.sede, e.areas_de_interes, 
        e.busca_mentoria, e.busca_empleo, e.busca_pasantia
    INTO 
        v_carrera_est, v_sede_est, v_areas_interes_est, 
        v_busca_mentoria, v_busca_empleo, v_busca_pasantia
    FROM public.estudiantes e
    WHERE e.user_id = p_estudiante_id;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CARGA DATOS DE LA POSICIÓN ──────────────────────────────────────────
    SELECT 
        p.carrera_requerida, p.sede_requerida, p.tipo_posicion, p.sector
    INTO 
        v_carrera_req, v_sede_req, v_tipo_posicion, v_sectores_pos
    FROM public.posiciones p
    WHERE p.id = p_posicion_id AND p.estado = 'abierta';

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── 1. CARRERA REQUERIDA (40 pts) ───────────────────────────────────────
    IF v_carrera_req IS NULL OR LOWER(TRIM(v_carrera_est)) = LOWER(TRIM(v_carrera_req)) THEN
        v_score := v_score + 40;
    END IF;

    -- ── 2. SEDE DE LA POSICIÓN (20 pts) ─────────────────────────────────────
    IF v_sede_req IS NULL OR LOWER(TRIM(v_sede_est)) = LOWER(TRIM(v_sede_req)) THEN
        v_score := v_score + 20;
    END IF;

    -- ── 3. TIPO DE APOYO / MODALIDAD (20 pts) ───────────────────────────────
    IF v_tipo_posicion IS NOT NULL THEN
        IF (LOWER(v_tipo_posicion) = 'mentoria' AND v_busca_mentoria) OR
           (LOWER(v_tipo_posicion) = 'empleo' AND v_busca_empleo) OR
           (LOWER(v_tipo_posicion) = 'pasantia' AND v_busca_pasantia) THEN
            v_score := v_score + 20;
        END IF;
    ELSE
        -- Si la posición no especifica, asumimos compatibilidad general
        v_score := v_score + 20;
    END IF;

    -- ── 4. ÁREAS DE INTERÉS / SECTOR (20 pts, proporcional) ─────────────────
    v_total_req_areas := COALESCE(array_length(v_sectores_pos, 1), 0);
    
    IF v_total_req_areas > 0 AND v_areas_interes_est IS NOT NULL THEN
        SELECT COUNT(*) INTO v_interseccion_areas
        FROM unnest(v_sectores_pos) AS req_area
        WHERE req_area = ANY(v_areas_interes_est);

        v_puntaje_areas := ROUND((v_interseccion_areas::NUMERIC / v_total_req_areas) * 20);
        v_score := v_score + v_puntaje_areas;
    ELSIF v_total_req_areas = 0 THEN
        v_score := v_score + 20;
    END IF;

    -- ── RETORNO: Score acotado a 100 ────────────────────────────────────────
    RETURN LEAST(100, GREATEST(0, v_score));
END;
$$;

COMMENT ON FUNCTION public.calcular_score_posicion_extendido(UUID, UUID)
    IS 'Calcula el match (0-100) entre un estudiante y una posición. Evalúa carrera, sede, tipo y áreas.';

-- =============================================================================
-- [VERDE - FUNCION: view_student_position_matches]
-- Vista segura que expone cruces activos entre estudiantes y posiciones.
-- Filtra exclusivamente combinaciones con un score > 30 (Regla de Exclusión).
-- =============================================================================
CREATE OR REPLACE VIEW public.view_student_position_matches AS
SELECT 
    e.user_id AS estudiante_id,
    p.id AS posicion_id,
    p.empresa,
    p.descripcion_general,
    p.sector,
    p.carrera_requerida,
    p.sede_requerida,
    p.tipo_posicion,
    p.created_at,
    public.calcular_score_posicion_extendido(e.user_id, p.id) AS score_match
FROM 
    public.estudiantes e
CROSS JOIN 
    public.posiciones p
WHERE 
    p.estado = 'abierta' 
    AND public.calcular_score_posicion_extendido(e.user_id, p.id) > 30;

-- Documentación de la vista
COMMENT ON VIEW public.view_student_position_matches IS 'Pre-cálculo de matches recomendados entre estudiantes y vacantes/mentorías (>30 pts).';
