-- =============================================================================
-- MIGRACIÓN 08: Sistema de Matching Automatizado Alumni-Estudiante UCR
-- Descripción : Crea el ENUM de estados, la tabla `matches` con RLS, y la
--               función almacenada `calcular_score_matching` que implementa
--               el algoritmo de puntuación de 0 a 100 puntos.
-- Nota        : La tabla `matches` ya existe en el schema inicial (01_init_db).
--               Esta migración agrega el ENUM tipado y la función de scoring.
-- Autor       : Sistema de Gestión Alumni UCR
-- Fecha       : 2026-06-05
-- =============================================================================

-- =============================================================================
-- [VERDE - FUNCION: crear_enum_estado_match]
-- Define el ciclo de vida de un match como un tipo enumerado de PostgreSQL.
-- Valores: sugerido -> contactado -> activo -> cerrado
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE public.estado_match AS ENUM (
    'sugerido',   -- El sistema sugirió el match, aún no hay acción humana
    'contactado', -- El exalumno o la plataforma ya contactó al estudiante
    'activo',     -- Ambas partes aceptaron y la conexión está en progreso
    'cerrado'     -- El match fue finalizado (exitoso o cancelado)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL; -- Idempotente: ignora si el tipo ya existe
END $$;

COMMENT ON TYPE public.estado_match IS 'Ciclo de vida de una conexión entre exalumno y estudiante UCR.';

-- =============================================================================
-- [VERDE - FUNCION: crear_tabla_matches]
-- Tabla principal de conexiones. Relaciona estudiantes con exalumnos mediante
-- un score calculado y un estado de ciclo de vida tipado.
-- Nota: Si la tabla ya existe del migration 01, se omite su creación.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Referencia al perfil del estudiante UCR
    estudiante_id UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Referencia al perfil del exalumno UCR
    exalumno_id   UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Puntaje calculado por el algoritmo (0-100)
    score_match   SMALLINT     NOT NULL CHECK (score_match >= 0 AND score_match <= 100),
    -- Estado actual del match en su ciclo de vida
    estado        TEXT         NOT NULL DEFAULT 'sugerido',
    -- Tipo principal de apoyo que origina la conexión
    tipo_apoyo    TEXT         NOT NULL DEFAULT '',
    -- Indica quién inició el contacto (exalumno_id o 'sistema')
    iniciado_por  TEXT         NOT NULL DEFAULT 'sistema',
    -- Resultado final del match al cerrarse (nullable hasta cierre)
    resultado     TEXT         NULL,
    -- Notas internas del administrador (uso exclusivo admin)
    notas_admin   TEXT         NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- Evitar duplicados del mismo par alumni-estudiante activos simultáneamente
    CONSTRAINT matches_par_unico UNIQUE (estudiante_id, exalumno_id)
);

COMMENT ON TABLE  public.matches              IS 'Conexiones entre exalumnos y estudiantes generadas por el algoritmo de matching.';
COMMENT ON COLUMN public.matches.score_match  IS 'Puntaje de compatibilidad calculado (0-100). Nunca se almacena un score de 0.';
COMMENT ON COLUMN public.matches.estado       IS 'Estado del ciclo de vida: sugerido, contactado, activo, cerrado.';

-- -----------------------------------------------------------------------------
-- [VERDE - FUNCION: activar_rls_matches]
-- RLS sobre matches: cada usuario solo puede ver sus propios matches.
-- El service_role (backend) puede leer y escribir sin restricciones.
-- -----------------------------------------------------------------------------
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Política: el estudiante puede ver los matches donde él es el estudiante
CREATE POLICY "Estudiante ve sus propios matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = estudiante_id);

-- Política: el exalumno puede ver los matches donde él es el exalumno
CREATE POLICY "Exalumno ve sus propios matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = exalumno_id);

-- Política: solo el backend (service_role) puede insertar o actualizar matches
CREATE POLICY "Solo el sistema puede crear matches"
    ON public.matches FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Solo el sistema puede actualizar matches"
    ON public.matches FOR UPDATE
    USING (auth.role() = 'service_role');

-- =============================================================================
-- [VERDE - FUNCION: calcular_score_matching]
-- Función almacenada que ejecuta el algoritmo de puntuación de compatibilidad
-- entre un estudiante y un exalumno UCR. Retorna un entero de 0 a 100.
--
-- TABLA DE PUNTUACIÓN:
--   +30 pts → Misma carrera UCR (coincidencia exacta)
--   +30 pts → Áreas de interés en común (proporcional a la intersección)
--   +20 pts → Sector del exalumno ↔ área temática del proyecto (exacta)
--   +20 pts → Tipo de apoyo ofrecido ↔ buscado (al menos 1 coincidencia)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calcular_score_matching(
    p_estudiante_id UUID,
    p_exalumno_id   UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Datos del perfil del estudiante
    v_carrera_est         TEXT;
    v_areas_interes_est   TEXT[];
    v_area_tematica_proy  TEXT;
    v_necesidades_proy    TEXT[];

    -- Datos del perfil del exalumno
    v_carrera_exal        TEXT;
    v_areas_interes_exal  TEXT[];
    v_sectores_exal       TEXT[];
    v_ofrece_mentoria     BOOLEAN;
    v_ofrece_empleo       BOOLEAN;
    v_ofrece_pasantia     BOOLEAN;
    v_ofrece_donacion     BOOLEAN;
    v_ofrece_proyecto     BOOLEAN;

    -- Variables de cálculo
    v_score               INTEGER := 0;
    v_interseccion_areas  INTEGER := 0;
    v_total_areas_est     INTEGER := 0;
    v_puntaje_areas       INTEGER := 0;
    v_hay_apoyo_match     BOOLEAN := FALSE;
    v_sector              TEXT;
    v_necesidad           TEXT;
BEGIN
    -- ── CARGA DATOS DEL ESTUDIANTE ──────────────────────────────────────────
    SELECT
        e.carrera,
        e.areas_de_interes,
        e.proyecto_area_tematica,
        e.proyecto_necesidades
    INTO
        v_carrera_est,
        v_areas_interes_est,
        v_area_tematica_proy,
        v_necesidades_proy
    FROM public.estudiantes e
    WHERE e.user_id = p_estudiante_id;

    -- Retorna 0 si no existe el perfil del estudiante
    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CARGA DATOS DEL EXALUMNO ────────────────────────────────────────────
    SELECT
        ex.carrera_ucr,
        ex.areas_de_interes,
        ex.sector_industria,
        ex.ofrece_mentoria,
        ex.ofrece_empleo,
        ex.ofrece_pasantia,
        ex.ofrece_donacion_dinero,
        ex.ofrece_proyecto
    INTO
        v_carrera_exal,
        v_areas_interes_exal,
        v_sectores_exal,
        v_ofrece_mentoria,
        v_ofrece_empleo,
        v_ofrece_pasantia,
        v_ofrece_donacion,
        v_ofrece_proyecto
    FROM public.exalumnos ex
    WHERE ex.user_id = p_exalumno_id;

    -- Retorna 0 si no existe el perfil del exalumno
    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CRITERIO 1: MISMA CARRERA UCR (+30 pts) ─────────────────────────────
    -- Coincidencia exacta (case-insensitive) entre carrera de ambos perfiles
    IF LOWER(TRIM(v_carrera_est)) = LOWER(TRIM(v_carrera_exal)) THEN
        v_score := v_score + 30;
    END IF;

    -- ── CRITERIO 2: ÁREAS DE INTERÉS EN COMÚN (máx +30 pts, proporcional) ──
    -- Calcula la intersección del array de áreas de interés de ambos perfiles.
    -- Fórmula: (intersección / total_áreas_estudiante) × 30
    v_total_areas_est := COALESCE(array_length(v_areas_interes_est, 1), 0);

    IF v_total_areas_est > 0 AND v_areas_interes_exal IS NOT NULL THEN
        SELECT COUNT(*) INTO v_interseccion_areas
        FROM unnest(v_areas_interes_est) AS area_est
        WHERE area_est = ANY(v_areas_interes_exal);

        v_puntaje_areas := ROUND((v_interseccion_areas::NUMERIC / v_total_areas_est) * 30);
        v_score := v_score + v_puntaje_areas;
    END IF;

    -- ── CRITERIO 3: SECTOR EXALUMNO ↔ ÁREA TEMÁTICA PROYECTO (+20 pts) ─────
    -- Verifica si alguno de los sectores industriales del exalumno coincide
    -- exactamente con el área temática del proyecto del estudiante.
    IF v_area_tematica_proy IS NOT NULL AND v_sectores_exal IS NOT NULL THEN
        FOREACH v_sector IN ARRAY v_sectores_exal LOOP
            IF LOWER(TRIM(v_sector)) = LOWER(TRIM(v_area_tematica_proy)) THEN
                v_score := v_score + 20;
                EXIT; -- Solo se puntúa una vez aunque haya múltiples coincidencias
            END IF;
        END LOOP;
    END IF;

    -- ── CRITERIO 4: TIPO DE APOYO OFRECIDO ↔ BUSCADO (+20 pts) ─────────────
    -- Al menos 1 coincidencia entre lo que ofrece el exalumno y lo que
    -- necesita el proyecto del estudiante (project_necesidades).
    IF v_necesidades_proy IS NOT NULL THEN
        FOREACH v_necesidad IN ARRAY v_necesidades_proy LOOP
            CASE LOWER(TRIM(v_necesidad))
                WHEN 'mentoria', 'mentoría', 'mentoría profesional' THEN
                    IF v_ofrece_mentoria THEN v_hay_apoyo_match := TRUE; END IF;
                WHEN 'empleo', 'ofrece_empleo' THEN
                    IF v_ofrece_empleo THEN v_hay_apoyo_match := TRUE; END IF;
                WHEN 'pasantia', 'pasantía' THEN
                    IF v_ofrece_pasantia THEN v_hay_apoyo_match := TRUE; END IF;
                WHEN 'donacion', 'donación', 'apoyo financiero' THEN
                    IF v_ofrece_donacion THEN v_hay_apoyo_match := TRUE; END IF;
                WHEN 'proyecto', 'colaboracion', 'colaboración' THEN
                    IF v_ofrece_proyecto THEN v_hay_apoyo_match := TRUE; END IF;
                ELSE NULL;
            END CASE;
            EXIT WHEN v_hay_apoyo_match; -- Ya encontró 1 match, no sigue buscando
        END LOOP;
    END IF;

    IF v_hay_apoyo_match THEN
        v_score := v_score + 20;
    END IF;

    -- ── RETORNO: Score final acotado entre 0 y 100 ──────────────────────────
    RETURN LEAST(100, GREATEST(0, v_score));
END;
$$;

COMMENT ON FUNCTION public.calcular_score_matching(UUID, UUID)
    IS 'Calcula el score de compatibilidad (0-100) entre un estudiante y un exalumno UCR basado en carrera, áreas de interés, sector e tipo de apoyo.';
