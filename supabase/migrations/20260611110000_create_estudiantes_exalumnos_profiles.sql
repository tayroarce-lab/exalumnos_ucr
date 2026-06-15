-- ============================================================================
-- Reintroduce/normaliza perfiles extendidos de estudiantes y exalumnos.
--
-- La migracion 20260608170000 consolido parte del perfil en public.users y
-- elimino estas tablas. La aplicacion aun necesita perfiles extendidos con FK
-- 1:1 hacia users para directorio, matching y formularios especializados.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Estudiantes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.estudiantes (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  carnet_ucr                 TEXT,
  carrera                    TEXT,
  escuela_facultad           TEXT,
  sede                       TEXT,
  anio_ingreso               INT,
  nivel_academico            TEXT,
  promedio_ponderado         DECIMAL,
  beca_socioeconomica        TEXT,
  proyecto_titulo            TEXT,
  proyecto_descripcion       TEXT,
  proyecto_area_tematica     TEXT,
  proyecto_tipo              TEXT,
  proyecto_porcentaje_avance INT,
  proyecto_necesidades       TEXT[],
  areas_de_interes           TEXT[],
  habilidades                TEXT[],
  busca_financiamiento       BOOLEAN DEFAULT FALSE,
  busca_mentoria             BOOLEAN DEFAULT FALSE,
  busca_empleo               BOOLEAN DEFAULT FALSE,
  busca_pasantia             BOOLEAN DEFAULT FALSE,
  proyecto_activo            BOOLEAN DEFAULT TRUE,
  visible_en_directorio      BOOLEAN DEFAULT TRUE,
  perfil_completo            BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.estudiantes
  ADD COLUMN IF NOT EXISTS id                         UUID DEFAULT uuid_generate_v4(),
  ADD COLUMN IF NOT EXISTS carnet_ucr                 TEXT,
  ADD COLUMN IF NOT EXISTS carrera                    TEXT,
  ADD COLUMN IF NOT EXISTS escuela_facultad           TEXT,
  ADD COLUMN IF NOT EXISTS sede                       TEXT,
  ADD COLUMN IF NOT EXISTS anio_ingreso               INT,
  ADD COLUMN IF NOT EXISTS nivel_academico            TEXT,
  ADD COLUMN IF NOT EXISTS promedio_ponderado         DECIMAL,
  ADD COLUMN IF NOT EXISTS beca_socioeconomica        TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_titulo            TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_descripcion       TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_area_tematica     TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_tipo              TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_porcentaje_avance INT,
  ADD COLUMN IF NOT EXISTS proyecto_necesidades       TEXT[],
  ADD COLUMN IF NOT EXISTS areas_de_interes           TEXT[],
  ADD COLUMN IF NOT EXISTS habilidades                TEXT[],
  ADD COLUMN IF NOT EXISTS busca_financiamiento       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS busca_mentoria             BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS busca_empleo               BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS busca_pasantia             BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS proyecto_activo            BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS visible_en_directorio      BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS perfil_completo            BOOLEAN DEFAULT FALSE;

UPDATE public.estudiantes
SET id = uuid_generate_v4()
WHERE id IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'estudiantes'
      AND constraint_name = 'estudiantes_pkey'
      AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE public.estudiantes DROP CONSTRAINT estudiantes_pkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'estudiantes'
      AND constraint_name = 'estudiantes_pkey'
      AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE public.estudiantes ADD CONSTRAINT estudiantes_pkey PRIMARY KEY (id);
  END IF;
END $$;

ALTER TABLE public.estudiantes
  ALTER COLUMN busca_financiamiento SET DEFAULT FALSE,
  ALTER COLUMN busca_mentoria SET DEFAULT FALSE,
  ALTER COLUMN busca_empleo SET DEFAULT FALSE,
  ALTER COLUMN busca_pasantia SET DEFAULT FALSE,
  ALTER COLUMN proyecto_activo SET DEFAULT TRUE,
  ALTER COLUMN visible_en_directorio SET DEFAULT TRUE,
  ALTER COLUMN perfil_completo SET DEFAULT FALSE;

UPDATE public.estudiantes e
SET
  carrera = COALESCE(e.carrera, ''),
  escuela_facultad = COALESCE(e.escuela_facultad, ''),
  sede = COALESCE(e.sede, ''),
  anio_ingreso = COALESCE(e.anio_ingreso, EXTRACT(YEAR FROM CURRENT_DATE)::INT),
  nivel_academico = COALESCE(e.nivel_academico, 'bachillerato'),
  proyecto_titulo = COALESCE(e.proyecto_titulo, ''),
  proyecto_descripcion = COALESCE(e.proyecto_descripcion, ''),
  proyecto_area_tematica = COALESCE(e.proyecto_area_tematica, ''),
  proyecto_tipo = COALESCE(e.proyecto_tipo, 'tfg'),
  proyecto_necesidades = COALESCE(e.proyecto_necesidades, ARRAY[]::TEXT[]),
  areas_de_interes = COALESCE(e.areas_de_interes, ARRAY[]::TEXT[]),
  habilidades = COALESCE(e.habilidades, ARRAY[]::TEXT[]),
  busca_financiamiento = COALESCE(e.busca_financiamiento, FALSE),
  busca_mentoria = COALESCE(e.busca_mentoria, FALSE),
  busca_empleo = COALESCE(e.busca_empleo, FALSE),
  busca_pasantia = COALESCE(e.busca_pasantia, FALSE),
  proyecto_activo = COALESCE(e.proyecto_activo, TRUE),
  visible_en_directorio = COALESCE(e.visible_en_directorio, TRUE),
  perfil_completo = COALESCE(e.perfil_completo, FALSE);

UPDATE public.estudiantes e
SET carnet_ucr = COALESCE(e.carnet_ucr, 'PEND-' || REPLACE(e.user_id::TEXT, '-', ''))
WHERE e.carnet_ucr IS NULL;

ALTER TABLE public.estudiantes
  DROP CONSTRAINT IF EXISTS estudiantes_nivel_academico_check,
  DROP CONSTRAINT IF EXISTS estudiantes_beca_socioeconomica_check,
  DROP CONSTRAINT IF EXISTS estudiantes_proyecto_tipo_check,
  DROP CONSTRAINT IF EXISTS estudiantes_proyecto_porcentaje_avance_check,
  DROP CONSTRAINT IF EXISTS estudiantes_promedio_ponderado_check;

ALTER TABLE public.estudiantes
  ADD CONSTRAINT estudiantes_nivel_academico_check
    CHECK (nivel_academico IN ('bachillerato','licenciatura','maestria','doctorado')),
  ADD CONSTRAINT estudiantes_beca_socioeconomica_check
    CHECK (beca_socioeconomica IS NULL OR beca_socioeconomica IN ('ninguna','nivel1','nivel2','nivel3','nivel4','nivel5')),
  ADD CONSTRAINT estudiantes_proyecto_tipo_check
    CHECK (proyecto_tipo IN ('tfg','tesis','practica_dirigida','seminario')),
  ADD CONSTRAINT estudiantes_proyecto_porcentaje_avance_check
    CHECK (proyecto_porcentaje_avance IS NULL OR proyecto_porcentaje_avance BETWEEN 0 AND 100),
  ADD CONSTRAINT estudiantes_promedio_ponderado_check
    CHECK (promedio_ponderado IS NULL OR promedio_ponderado BETWEEN 0 AND 10);

ALTER TABLE public.estudiantes
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN carnet_ucr SET NOT NULL,
  ALTER COLUMN carrera SET NOT NULL,
  ALTER COLUMN escuela_facultad SET NOT NULL,
  ALTER COLUMN sede SET NOT NULL,
  ALTER COLUMN anio_ingreso SET NOT NULL,
  ALTER COLUMN nivel_academico SET NOT NULL,
  ALTER COLUMN proyecto_titulo SET NOT NULL,
  ALTER COLUMN proyecto_descripcion SET NOT NULL,
  ALTER COLUMN proyecto_area_tematica SET NOT NULL,
  ALTER COLUMN proyecto_tipo SET NOT NULL,
  ALTER COLUMN areas_de_interes SET NOT NULL,
  ALTER COLUMN busca_financiamiento SET NOT NULL,
  ALTER COLUMN busca_mentoria SET NOT NULL,
  ALTER COLUMN busca_empleo SET NOT NULL,
  ALTER COLUMN busca_pasantia SET NOT NULL,
  ALTER COLUMN proyecto_activo SET NOT NULL,
  ALTER COLUMN visible_en_directorio SET NOT NULL,
  ALTER COLUMN perfil_completo SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS estudiantes_carnet_ucr_key
  ON public.estudiantes (carnet_ucr);

CREATE UNIQUE INDEX IF NOT EXISTS estudiantes_user_id_key
  ON public.estudiantes (user_id);

-- ---------------------------------------------------------------------------
-- Exalumnos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exalumnos (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  carrera_ucr              TEXT,
  escuela_facultad         TEXT,
  anio_graduacion          INT,
  empresa_actual           TEXT,
  cargo_actual             TEXT,
  sector_industria         TEXT[],
  areas_de_interes         TEXT[],
  pais_ciudad              TEXT,
  anios_experiencia        INT,
  linkedin_url             TEXT,
  bio                      TEXT,
  ofrece_mentoria          BOOLEAN DEFAULT FALSE,
  horas_mes_mentoria       INT,
  ofrece_empleo            BOOLEAN DEFAULT FALSE,
  ofrece_pasantia          BOOLEAN DEFAULT FALSE,
  ofrece_proyecto          BOOLEAN DEFAULT FALSE,
  ofrece_donacion_dinero   BOOLEAN DEFAULT FALSE,
  monto_maximo_donacion    DECIMAL,
  moneda_donacion          TEXT,
  visible_en_directorio    BOOLEAN DEFAULT TRUE,
  perfil_completo          BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.exalumnos
  ADD COLUMN IF NOT EXISTS id                       UUID DEFAULT uuid_generate_v4(),
  ADD COLUMN IF NOT EXISTS carrera_ucr              TEXT,
  ADD COLUMN IF NOT EXISTS escuela_facultad         TEXT,
  ADD COLUMN IF NOT EXISTS anio_graduacion          INT,
  ADD COLUMN IF NOT EXISTS empresa_actual           TEXT,
  ADD COLUMN IF NOT EXISTS cargo_actual             TEXT,
  ADD COLUMN IF NOT EXISTS sector_industria         TEXT[],
  ADD COLUMN IF NOT EXISTS areas_de_interes         TEXT[],
  ADD COLUMN IF NOT EXISTS pais_ciudad              TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url             TEXT,
  ADD COLUMN IF NOT EXISTS bio                      TEXT,
  ADD COLUMN IF NOT EXISTS ofrece_mentoria          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS horas_mes_mentoria       INT,
  ADD COLUMN IF NOT EXISTS ofrece_empleo            BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ofrece_pasantia          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ofrece_proyecto          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ofrece_donacion_dinero   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS monto_maximo_donacion    DECIMAL,
  ADD COLUMN IF NOT EXISTS moneda_donacion          TEXT,
  ADD COLUMN IF NOT EXISTS visible_en_directorio    BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS perfil_completo          BOOLEAN DEFAULT FALSE;

UPDATE public.exalumnos
SET id = uuid_generate_v4()
WHERE id IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'exalumnos'
      AND constraint_name = 'exalumnos_pkey'
      AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE public.exalumnos DROP CONSTRAINT exalumnos_pkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'exalumnos'
      AND constraint_name = 'exalumnos_pkey'
      AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE public.exalumnos ADD CONSTRAINT exalumnos_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'exalumnos'
      AND column_name = 'anos_experiencia'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'exalumnos'
      AND column_name = 'anios_experiencia'
  ) THEN
    ALTER TABLE public.exalumnos RENAME COLUMN anos_experiencia TO anios_experiencia;
  ELSE
    ALTER TABLE public.exalumnos ADD COLUMN IF NOT EXISTS anios_experiencia INT;
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'exalumnos'
        AND column_name = 'anos_experiencia'
    ) THEN
      UPDATE public.exalumnos
      SET anios_experiencia = COALESCE(anios_experiencia, anos_experiencia);
      ALTER TABLE public.exalumnos DROP COLUMN anos_experiencia;
    END IF;
  END IF;
END $$;

ALTER TABLE public.exalumnos
  ALTER COLUMN ofrece_mentoria SET DEFAULT FALSE,
  ALTER COLUMN ofrece_empleo SET DEFAULT FALSE,
  ALTER COLUMN ofrece_pasantia SET DEFAULT FALSE,
  ALTER COLUMN ofrece_proyecto SET DEFAULT FALSE,
  ALTER COLUMN ofrece_donacion_dinero SET DEFAULT FALSE,
  ALTER COLUMN visible_en_directorio SET DEFAULT TRUE,
  ALTER COLUMN perfil_completo SET DEFAULT FALSE;

UPDATE public.exalumnos e
SET
  carrera_ucr = COALESCE(e.carrera_ucr, ''),
  escuela_facultad = COALESCE(e.escuela_facultad, ''),
  anio_graduacion = COALESCE(e.anio_graduacion, EXTRACT(YEAR FROM CURRENT_DATE)::INT),
  empresa_actual = COALESCE(e.empresa_actual, ''),
  cargo_actual = COALESCE(e.cargo_actual, ''),
  sector_industria = COALESCE(e.sector_industria, ARRAY[]::TEXT[]),
  areas_de_interes = COALESCE(e.areas_de_interes, ARRAY[]::TEXT[]),
  pais_ciudad = COALESCE(e.pais_ciudad, ''),
  anios_experiencia = COALESCE(e.anios_experiencia, 0),
  linkedin_url = COALESCE(e.linkedin_url, ''),
  ofrece_mentoria = COALESCE(e.ofrece_mentoria, FALSE),
  ofrece_empleo = COALESCE(e.ofrece_empleo, FALSE),
  ofrece_pasantia = COALESCE(e.ofrece_pasantia, FALSE),
  ofrece_proyecto = COALESCE(e.ofrece_proyecto, FALSE),
  ofrece_donacion_dinero = COALESCE(e.ofrece_donacion_dinero, FALSE),
  visible_en_directorio = COALESCE(e.visible_en_directorio, TRUE),
  perfil_completo = COALESCE(e.perfil_completo, FALSE);

ALTER TABLE public.exalumnos
  DROP CONSTRAINT IF EXISTS exalumnos_moneda_donacion_check,
  DROP CONSTRAINT IF EXISTS exalumnos_anios_experiencia_check,
  DROP CONSTRAINT IF EXISTS exalumnos_anos_experiencia_check,
  DROP CONSTRAINT IF EXISTS exalumnos_horas_mes_mentoria_check,
  DROP CONSTRAINT IF EXISTS exalumnos_monto_maximo_donacion_check;

ALTER TABLE public.exalumnos
  ADD CONSTRAINT exalumnos_moneda_donacion_check
    CHECK (moneda_donacion IS NULL OR moneda_donacion IN ('CRC', 'USD')),
  ADD CONSTRAINT exalumnos_anios_experiencia_check
    CHECK (anios_experiencia >= 0),
  ADD CONSTRAINT exalumnos_horas_mes_mentoria_check
    CHECK (horas_mes_mentoria IS NULL OR horas_mes_mentoria >= 0),
  ADD CONSTRAINT exalumnos_monto_maximo_donacion_check
    CHECK (monto_maximo_donacion IS NULL OR monto_maximo_donacion >= 0);

ALTER TABLE public.exalumnos
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN carrera_ucr SET NOT NULL,
  ALTER COLUMN escuela_facultad SET NOT NULL,
  ALTER COLUMN anio_graduacion SET NOT NULL,
  ALTER COLUMN empresa_actual SET NOT NULL,
  ALTER COLUMN cargo_actual SET NOT NULL,
  ALTER COLUMN sector_industria SET NOT NULL,
  ALTER COLUMN areas_de_interes SET NOT NULL,
  ALTER COLUMN pais_ciudad SET NOT NULL,
  ALTER COLUMN anios_experiencia SET NOT NULL,
  ALTER COLUMN linkedin_url SET NOT NULL,
  ALTER COLUMN ofrece_mentoria SET NOT NULL,
  ALTER COLUMN ofrece_empleo SET NOT NULL,
  ALTER COLUMN ofrece_pasantia SET NOT NULL,
  ALTER COLUMN ofrece_proyecto SET NOT NULL,
  ALTER COLUMN ofrece_donacion_dinero SET NOT NULL,
  ALTER COLUMN visible_en_directorio SET NOT NULL,
  ALTER COLUMN perfil_completo SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS exalumnos_user_id_key
  ON public.exalumnos (user_id);

-- ---------------------------------------------------------------------------
-- RLS e indices
-- ---------------------------------------------------------------------------
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exalumnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "estudiantes_select" ON public.estudiantes;
DROP POLICY IF EXISTS "estudiantes_select_full" ON public.estudiantes;
CREATE POLICY "estudiantes_select"
  ON public.estudiantes FOR SELECT
  TO authenticated
  USING (
    visible_en_directorio = TRUE
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
    )
  );

DROP POLICY IF EXISTS "estudiantes_insert_own" ON public.estudiantes;
CREATE POLICY "estudiantes_insert_own"
  ON public.estudiantes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "estudiantes_update_own" ON public.estudiantes;
CREATE POLICY "estudiantes_update_own"
  ON public.estudiantes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
    )
  );

DROP POLICY IF EXISTS "exalumnos_select" ON public.exalumnos;
CREATE POLICY "exalumnos_select"
  ON public.exalumnos FOR SELECT
  TO authenticated
  USING (
    visible_en_directorio = TRUE
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
    )
  );

DROP POLICY IF EXISTS "exalumnos_insert_own" ON public.exalumnos;
CREATE POLICY "exalumnos_insert_own"
  ON public.exalumnos FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "exalumnos_update_own" ON public.exalumnos;
CREATE POLICY "exalumnos_update_own"
  ON public.exalumnos FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_estudiantes_user_id ON public.estudiantes(user_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_visible ON public.estudiantes(user_id) WHERE visible_en_directorio = TRUE;
CREATE INDEX IF NOT EXISTS idx_estudiantes_carrera ON public.estudiantes(carrera);
CREATE INDEX IF NOT EXISTS idx_estudiantes_proyecto_activo ON public.estudiantes(user_id) WHERE proyecto_activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_estudiantes_areas_de_interes ON public.estudiantes USING GIN (areas_de_interes);
CREATE INDEX IF NOT EXISTS idx_estudiantes_habilidades ON public.estudiantes USING GIN (habilidades);

CREATE INDEX IF NOT EXISTS idx_exalumnos_user_id ON public.exalumnos(user_id);
CREATE INDEX IF NOT EXISTS idx_exalumnos_visible ON public.exalumnos(user_id) WHERE visible_en_directorio = TRUE;
CREATE INDEX IF NOT EXISTS idx_exalumnos_ofrece_mentoria ON public.exalumnos(user_id) WHERE ofrece_mentoria = TRUE;
CREATE INDEX IF NOT EXISTS idx_exalumnos_ofrece_empleo ON public.exalumnos(user_id) WHERE ofrece_empleo = TRUE;
CREATE INDEX IF NOT EXISTS idx_exalumnos_areas_de_interes ON public.exalumnos USING GIN (areas_de_interes);
CREATE INDEX IF NOT EXISTS idx_exalumnos_sector_industria ON public.exalumnos USING GIN (sector_industria);

COMMIT;
