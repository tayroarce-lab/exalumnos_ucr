-- =============================================================================
-- MIGRACIÓN 17: Refactorización de Áreas de Interés
-- Descripción : Normaliza las áreas de interés migrando de TEXT[] a un modelo
--               relacional (Catálogo + Tabla Intermedia).
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. CREACIÓN DE CATÁLOGO Y TABLA RELACIONAL
-- =============================================================================
CREATE TABLE public.catalogo_areas_interes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    categoria VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Como la tabla users consolidó a estudiantes y exalumnos en la migración 12,
-- creamos una única tabla intermedia referenciando a users.
CREATE TABLE public.users_areas_interes (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    area_id UUID NOT NULL REFERENCES public.catalogo_areas_interes(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, area_id)
);

-- Habilitar RLS
ALTER TABLE public.catalogo_areas_interes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_areas_interes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "catalogo_areas_interes_select_all" 
  ON public.catalogo_areas_interes FOR SELECT 
  TO authenticated USING (TRUE);

CREATE POLICY "users_areas_interes_select_all" 
  ON public.users_areas_interes FOR SELECT 
  TO authenticated USING (TRUE);

CREATE POLICY "users_areas_interes_insert_own" 
  ON public.users_areas_interes FOR INSERT 
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_areas_interes_delete_own" 
  ON public.users_areas_interes FOR DELETE 
  TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- 2. INSERCIÓN DE DATOS INICIALES (SEMILLAS)
-- =============================================================================
INSERT INTO public.catalogo_areas_interes (nombre, categoria)
VALUES 
  ('Tecnología e Innovación', 'tecnologia'),
  ('Salud y Bienestar', 'salud'),
  ('Educación y Pedagogía', 'educacion'),
  ('Medio Ambiente y Sostenibilidad', 'ambiente'),
  ('Arte y Cultura', 'arte_cultura'),
  ('Ciencias Sociales', 'ciencias_sociales'),
  ('Agro y Alimentación', 'agro'),
  ('Emprendimiento y Negocios', 'emprendimiento'),
  ('Ingeniería y Construcción', 'ingenieria'),
  ('Derecho y Política Pública', 'derecho'),
  ('Economía y Finanzas', 'economia'),
  ('Comunicación y Medios', 'comunicacion'),
  ('Turismo y Patrimonio', 'turismo'),
  ('Investigación Científica', 'investigacion')
ON CONFLICT (nombre) DO NOTHING;

-- =============================================================================
-- 3. MIGRACIÓN DE DATOS EXISTENTES DESDE TEXT[]
-- =============================================================================
DO $$
BEGIN
    -- 3.1 Intentar recuperar desde public.estudiantes si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estudiantes' AND column_name='areas_de_interes') THEN
        EXECUTE '
        INSERT INTO public.catalogo_areas_interes (nombre, categoria)
        SELECT DISTINCT unnest(areas_de_interes) as nombre, ''personalizado'' as categoria
        FROM public.estudiantes
        WHERE areas_de_interes IS NOT NULL AND array_length(areas_de_interes, 1) > 0
        ON CONFLICT (nombre) DO NOTHING;

        INSERT INTO public.users_areas_interes (user_id, area_id)
        SELECT e.user_id, c.id
        FROM public.estudiantes e
        JOIN public.catalogo_areas_interes c ON c.nombre = ANY(e.areas_de_interes)
        WHERE e.areas_de_interes IS NOT NULL
        ON CONFLICT DO NOTHING;
        ';
    END IF;

    -- 3.2 Intentar recuperar desde public.exalumnos si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='exalumnos' AND column_name='areas_de_interes') THEN
        EXECUTE '
        INSERT INTO public.catalogo_areas_interes (nombre, categoria)
        SELECT DISTINCT unnest(areas_de_interes) as nombre, ''personalizado'' as categoria
        FROM public.exalumnos
        WHERE areas_de_interes IS NOT NULL AND array_length(areas_de_interes, 1) > 0
        ON CONFLICT (nombre) DO NOTHING;

        INSERT INTO public.users_areas_interes (user_id, area_id)
        SELECT e.user_id, c.id
        FROM public.exalumnos e
        JOIN public.catalogo_areas_interes c ON c.nombre = ANY(e.areas_de_interes)
        WHERE e.areas_de_interes IS NOT NULL
        ON CONFLICT DO NOTHING;
        ';
    END IF;

    -- 3.3 Intentar recuperar desde public.users si por alguna razón existiera
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='areas_de_interes') THEN
        EXECUTE '
        INSERT INTO public.catalogo_areas_interes (nombre, categoria)
        SELECT DISTINCT unnest(areas_de_interes) as nombre, ''personalizado'' as categoria
        FROM public.users
        WHERE areas_de_interes IS NOT NULL AND array_length(areas_de_interes, 1) > 0
        ON CONFLICT (nombre) DO NOTHING;

        INSERT INTO public.users_areas_interes (user_id, area_id)
        SELECT u.id, c.id
        FROM public.users u
        JOIN public.catalogo_areas_interes c ON c.nombre = ANY(u.areas_de_interes)
        WHERE u.areas_de_interes IS NOT NULL
        ON CONFLICT DO NOTHING;
        
        ALTER TABLE public.users DROP COLUMN areas_de_interes CASCADE;
        ';
    END IF;
END $$;

-- =============================================================================
-- 5. REESCRITURA DE FUNCIONES DE MATCHING PARA USAR LA NUEVA ESTRUCTURA
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
    -- Perfil del estudiante
    v_carrera_est_id        INTEGER;
    v_busca_mentoria        BOOLEAN;
    v_busca_empleo          BOOLEAN;
    v_busca_pasantia        BOOLEAN;
    v_busca_financiamiento  BOOLEAN;

    -- Perfil del exalumno
    v_carrera_exal_id       INTEGER;
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
    -- ── CARGA DATOS DEL ESTUDIANTE ──────────────────────────────────────────
    SELECT
        u.carrera_principal_id,
        u.busca_mentoria,
        u.busca_empleo,
        u.busca_pasantia,
        u.busca_financiamiento
    INTO
        v_carrera_est_id,
        v_busca_mentoria,
        v_busca_empleo,
        v_busca_pasantia,
        v_busca_financiamiento
    FROM public.users u
    WHERE u.id = p_estudiante_id
      AND u.rol = 'estudiante'
      AND u.deleted_at IS NULL;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CARGA DATOS DEL EXALUMNO ────────────────────────────────────────────
    SELECT
        u.carrera_principal_id,
        u.sector_industria,
        u.ofrece_mentoria,
        u.ofrece_empleo,
        u.ofrece_pasantia,
        u.ofrece_donacion_dinero
    INTO
        v_carrera_exal_id,
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
    IF v_carrera_est_id IS NOT NULL
       AND v_carrera_exal_id IS NOT NULL
       AND v_carrera_est_id = v_carrera_exal_id
    THEN
        v_score := v_score + 30;
    END IF;

    -- ── CRITERIO 2: ÁREAS DE INTERÉS EN COMÚN (máx +30 pts, proporcional) ───
    SELECT COUNT(*) INTO v_total_areas_est 
    FROM public.users_areas_interes 
    WHERE user_id = p_estudiante_id;

    IF v_total_areas_est > 0 THEN
        -- Calcular intersección usando las tablas pivot
        SELECT COUNT(*) INTO v_interseccion_areas
        FROM public.users_areas_interes ae
        JOIN public.users_areas_interes ax ON ae.area_id = ax.area_id
        WHERE ae.user_id = p_estudiante_id AND ax.user_id = p_exalumno_id;

        v_puntaje_areas := ROUND((v_interseccion_areas::NUMERIC / v_total_areas_est) * 30);
        v_score := v_score + v_puntaje_areas;
    END IF;

    -- ── CRITERIO 3: SECTOR EXALUMNO ↔ ÁREAS INTERÉS ESTUDIANTE (+20 pts) ────
    IF v_sector_industria IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM unnest(v_sector_industria) AS sec
            JOIN public.users_areas_interes ua ON ua.user_id = p_estudiante_id
            JOIN public.catalogo_areas_interes cat ON ua.area_id = cat.id
            WHERE LOWER(TRIM(sec)) = LOWER(TRIM(cat.nombre))
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
    v_busca_empleo          BOOLEAN;
    v_busca_pasantia        BOOLEAN;

    -- Habilidades técnicas del CV
    v_habilidades_cv_raw    JSONB;
    v_habilidades_cv        TEXT[];

    -- Datos de la posición
    v_sector_posicion       TEXT[];
    v_habilidades_req       TEXT[];

    -- Variables de cálculo
    v_score                 INTEGER := 0;
    v_interseccion          INTEGER := 0;
    v_total_req             INTEGER := 0;
BEGIN
    -- ── CARGA DATOS DEL ESTUDIANTE ───────────────────────────────────────────
    SELECT
        u.busca_empleo,
        u.busca_pasantia
    INTO
        v_busca_empleo,
        v_busca_pasantia
    FROM public.users u
    WHERE u.id = p_estudiante_id
      AND u.rol = 'estudiante'
      AND u.deleted_at IS NULL;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CARGA Habilidades TÉCNICAS DEL CV ────────────────────────────────────
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
        p.habilidades_requeridas
    INTO
        v_sector_posicion,
        v_habilidades_req
    FROM public.posiciones p
    WHERE p.id = p_posicion_id
      AND p.estado = 'activa'
      AND p.deleted_at IS NULL;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- ── CRITERIO 1: ÁREA ESTUDIANTE ⊆ SECTOR POSICIÓN (+35 pts) ─────────────
    IF v_sector_posicion IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM public.users_areas_interes ua
            JOIN public.catalogo_areas_interes cat ON ua.area_id = cat.id
            WHERE ua.user_id = p_estudiante_id
              AND LOWER(TRIM(cat.nombre)) = ANY(
                  SELECT LOWER(TRIM(s)) FROM unnest(v_sector_posicion) AS s
              )
        ) THEN
            v_score := v_score + 35;
        END IF;
    END IF;

    -- ── CRITERIO 2: HABILIDADES CV ∩ HABILIDADES REQ (+35 pts, prop.) ────────
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

    IF v_total_req > 0 THEN
        SELECT COUNT(*) INTO v_interseccion
        FROM unnest(v_sector_posicion) AS sec
        JOIN public.catalogo_areas_interes cat ON LOWER(TRIM(sec)) = LOWER(TRIM(cat.nombre))
        JOIN public.users_areas_interes ua ON ua.area_id = cat.id
        WHERE ua.user_id = p_estudiante_id;

        v_score := v_score + ROUND((v_interseccion::NUMERIC / v_total_req) * 20);
    END IF;

    -- ── CRITERIO 4: TIPO DE APOYO BUSCADO ↔ TIPO DE POSICIÓN (+10 pts) ──────
    -- Omitido temporalmente porque la columna 'tipo' no existe en 'posiciones'

    RETURN LEAST(100, GREATEST(0, v_score));
END;
$$;

COMMIT;


