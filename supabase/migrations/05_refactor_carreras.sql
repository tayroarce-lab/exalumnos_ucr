-- ============================================================
-- MIGRACIÓN 05: Tabla intermedia carrera_campus
--               Refactorización de estudiantes y exalumnos
-- Proyecto: Plataforma Digital Fundación Exalumnos UCR
-- Autor: Tayro (rama tayro)
-- ============================================================
-- ESQUEMA REMOTO REAL (verificado vía API 2026-06-05):
--
--   carreras:    id_carreras BIGINT PK, nombre VARCHAR,
--                descripcion TEXT, id_facultades BIGINT, created_at
--
--   ucr_campuses: id UUID PK, name TEXT, short_name TEXT, created_at
--
--   ucr_faculties: id UUID PK, name TEXT, created_at
--
--   estudiantes: ya tiene id_carreras BIGINT (FK a carreras),
--                y sede TEXT (aún en texto libre)
--
--   exalumnos:   ya tiene id_carreras BIGINT (FK a carreras),
--                y anio_graduacion INT
-- ============================================================


-- ============================================================
-- BLOQUE 1: CONSTRAINT ÚNICO EN carreras.nombre
--   Necesario para que el INSERT ... ON CONFLICT funcione.
--   Usamos DO $$ para hacerlo idempotente.
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_carrera_nombre'
      AND conrelid = 'public.carreras'::regclass
  ) THEN
    ALTER TABLE public.carreras ADD CONSTRAINT uq_carrera_nombre UNIQUE (nombre);
  END IF;
END $$;


-- ============================================================
-- BLOQUE 2: TABLA INTERMEDIA carrera_campus
--   FK a carreras(id_carreras BIGINT) y ucr_campuses(id UUID).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carrera_campus (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  id_carrera  BIGINT  NOT NULL REFERENCES public.carreras(id_carreras) ON DELETE CASCADE,
  campus_id   UUID    NOT NULL REFERENCES public.ucr_campuses(id)      ON DELETE CASCADE,

  CONSTRAINT uq_carrera_campus UNIQUE (id_carrera, campus_id)
);

COMMENT ON TABLE  public.carrera_campus           IS 'Tabla intermedia: qué carreras se imparten en qué sedes UCR.';
COMMENT ON COLUMN public.carrera_campus.id_carrera IS 'FK a carreras.id_carreras (BIGINT).';
COMMENT ON COLUMN public.carrera_campus.campus_id  IS 'FK a ucr_campuses.id (UUID).';

-- RLS (idempotente)
ALTER TABLE public.carrera_campus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carrera_campus_select_authenticated" ON public.carrera_campus;
CREATE POLICY "carrera_campus_select_authenticated"
  ON public.carrera_campus FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "carrera_campus_write_admin" ON public.carrera_campus;
CREATE POLICY "carrera_campus_write_admin"
  ON public.carrera_campus FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_carrera_campus_carrera ON public.carrera_campus(id_carrera);
CREATE INDEX IF NOT EXISTS idx_carrera_campus_campus  ON public.carrera_campus(campus_id);


-- ============================================================
-- BLOQUE 3: REFACTORIZACIÓN de tabla estudiantes
--   La columna id_carreras BIGINT ya existe (FK a carreras).
--   Solo necesitamos:
--     a) Agregar id_carrera_campus UUID → la tabla intermedia.
--     b) Eliminar el campo sede TEXT (reemplazado por el campus
--        que ya está implícito en carrera_campus).
-- ============================================================

-- Agregar FK a la tabla intermedia (idempotente con IF NOT EXISTS)
ALTER TABLE public.estudiantes
  ADD COLUMN IF NOT EXISTS id_carrera_campus UUID
    REFERENCES public.carrera_campus(id)
    ON DELETE RESTRICT;

COMMENT ON COLUMN public.estudiantes.id_carrera_campus
  IS 'FK a carrera_campus.id. Garantiza que la carrera elegida se imparta en la sede seleccionada.';

CREATE INDEX IF NOT EXISTS idx_estudiantes_carrera_campus ON public.estudiantes(id_carrera_campus);

-- Nota: NO eliminamos sede TEXT ni id_carreras todavía.
-- Se eliminan cuando el formulario de registro esté migrado al nuevo campo.
-- Ejecutar entonces:
--   ALTER TABLE public.estudiantes DROP COLUMN IF EXISTS sede;
--   ALTER TABLE public.estudiantes DROP COLUMN IF EXISTS id_carreras;


-- ============================================================
-- BLOQUE 4: REFACTORIZACIÓN de tabla exalumnos
--   id_carreras BIGINT ya existe (una sola carrera).
--   Creamos exalumno_carreras para soportar múltiples títulos (RF-01.2).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exalumno_carreras (
  id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  exalumno_id        UUID    NOT NULL REFERENCES public.exalumnos(user_id) ON DELETE CASCADE,
  id_carrera_campus  UUID    NOT NULL REFERENCES public.carrera_campus(id)  ON DELETE RESTRICT,
  anio_graduacion    INT     NOT NULL CHECK (anio_graduacion >= 1950),

  CONSTRAINT uq_exalumno_carrera_campus UNIQUE (exalumno_id, id_carrera_campus)
);

COMMENT ON TABLE  public.exalumno_carreras
  IS 'Historial de titulaciones de un exalumno. Soporta múltiples títulos (RF-01.2).';
COMMENT ON COLUMN public.exalumno_carreras.id_carrera_campus
  IS 'FK a carrera_campus.id. Valida que la carrera se haya impartido en esa sede.';
COMMENT ON COLUMN public.exalumno_carreras.anio_graduacion
  IS 'Año de graduación para esta carrera específica.';

-- RLS (idempotente)
ALTER TABLE public.exalumno_carreras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ex_carreras_select" ON public.exalumno_carreras;
CREATE POLICY "ex_carreras_select"
  ON public.exalumno_carreras FOR SELECT
  TO authenticated
  USING (
    exalumno_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
  );

DROP POLICY IF EXISTS "ex_carreras_insert_own" ON public.exalumno_carreras;
CREATE POLICY "ex_carreras_insert_own"
  ON public.exalumno_carreras FOR INSERT
  TO authenticated
  WITH CHECK (exalumno_id = auth.uid());

DROP POLICY IF EXISTS "ex_carreras_update_own" ON public.exalumno_carreras;
CREATE POLICY "ex_carreras_update_own"
  ON public.exalumno_carreras FOR UPDATE
  TO authenticated
  USING (exalumno_id = auth.uid());

DROP POLICY IF EXISTS "ex_carreras_delete_own" ON public.exalumno_carreras;
CREATE POLICY "ex_carreras_delete_own"
  ON public.exalumno_carreras FOR DELETE
  TO authenticated
  USING (
    exalumno_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_ex  ON public.exalumno_carreras(exalumno_id);
CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_cc  ON public.exalumno_carreras(id_carrera_campus);
CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_ano ON public.exalumno_carreras(anio_graduacion);


-- ============================================================
-- BLOQUE 5: SEEDING DE CARRERAS
--   Las sedes ya están en ucr_campuses (script 03).
--   Insertamos las carreras usando ON CONFLICT (nombre) DO NOTHING.
--   id_facultades se deja NULL porque la tabla usa BIGINT, no UUID.
-- ============================================================
INSERT INTO public.carreras (nombre) VALUES
  -- Ingeniería
  ('Ciencias de la Computación e Informática'),
  ('Informática Empresarial'),
  ('Ingeniería Civil'),
  ('Ingeniería Eléctrica'),
  ('Ingeniería Industrial'),
  ('Ingeniería Mecánica'),
  ('Ingeniería Química'),
  ('Ingeniería Topográfica'),
  ('Ingeniería en Topografía'),
  ('Ingeniería en Desarrollo Sostenible'),
  ('Ingeniería de Alimentos'),
  ('Ingeniería de la Marina Civil'),
  -- Salud
  ('Medicina y Cirugía'),
  ('Microbiología y Química Clínica'),
  ('Farmacia'),
  ('Odontología'),
  ('Enfermería'),
  ('Nutrición'),
  ('Laboratorio Clínico'),
  -- Ciencias Económicas
  ('Dirección de Empresas'),
  ('Contaduría Pública'),
  ('Economía'),
  ('Estadística'),
  ('Administración Pública'),
  ('Administración Aduanera y Comercio Exterior'),
  -- Derecho y Sociales
  ('Derecho'),
  ('Psicología'),
  ('Sociología'),
  ('Trabajo Social'),
  ('Ciencias Políticas'),
  ('Relaciones Internacionales'),
  ('Comunicación Colectiva'),
  ('Periodismo'),
  ('Publicidad'),
  ('Relaciones Públicas'),
  ('Audiovisuales'),
  -- Artes y Letras
  ('Arquitectura'),
  ('Diseño Gráfico'),
  ('Artes Plásticas'),
  ('Artes Musicales'),
  ('Artes Dramáticas'),
  ('Gestión Cultural'),
  -- Ciencias Básicas
  ('Biología'),
  ('Química'),
  ('Física'),
  ('Matemática'),
  ('Geología'),
  -- Educación
  ('Enseñanza de la Matemática'),
  ('Enseñanza del Castellano'),
  ('Enseñanza de Estudios Sociales'),
  ('Enseñanza del Inglés'),
  ('Ciencias de la Educación con Concentración en Inglés'),
  -- Ciencias Agroalimentarias
  ('Agronomía'),
  ('Fitotecnia'),
  ('Zootecnia'),
  ('Economía Agrícola'),
  ('Gestión Integral del Recurso Hídrico'),
  ('Turismo Ecológico')
ON CONFLICT (nombre) DO NOTHING;


-- ============================================================
-- BLOQUE 6: MAPEO OFICIAL CARRERA-CAMPUS
--   CTE cruza nombre de carrera → id_carreras BIGINT
--           y short_name de campus → id UUID
-- ============================================================
WITH
  c AS (SELECT id_carreras, nombre FROM public.carreras),
  s AS (SELECT id, short_name FROM public.ucr_campuses)
INSERT INTO public.carrera_campus (id_carrera, campus_id)

-- ── Sede Rodrigo Facio ─────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Rodrigo Facio' AND c.nombre IN (
  'Ciencias de la Computación e Informática', 'Ingeniería Civil', 'Ingeniería Eléctrica',
  'Ingeniería Industrial', 'Ingeniería Mecánica', 'Ingeniería Química', 'Ingeniería Topográfica',
  'Dirección de Empresas', 'Contaduría Pública', 'Economía', 'Estadística',
  'Administración Pública', 'Administración Aduanera y Comercio Exterior',
  'Derecho', 'Medicina y Cirugía', 'Microbiología y Química Clínica', 'Farmacia',
  'Odontología', 'Enfermería', 'Nutrición', 'Arquitectura', 'Ciencias Políticas',
  'Relaciones Internacionales', 'Psicología', 'Comunicación Colectiva', 'Periodismo',
  'Publicidad', 'Relaciones Públicas', 'Audiovisuales', 'Sociología', 'Trabajo Social',
  'Biología', 'Química', 'Física', 'Matemática', 'Geología', 'Diseño Gráfico',
  'Artes Plásticas', 'Artes Musicales', 'Artes Dramáticas', 'Agronomía',
  'Fitotecnia', 'Zootecnia', 'Economía Agrícola'
)

UNION ALL

-- ── Sede de Occidente (San Ramón + Grecia) ─────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Occidente' AND c.nombre IN (
  'Informática Empresarial', 'Laboratorio Clínico', 'Enfermería', 'Psicología',
  'Trabajo Social', 'Derecho', 'Dirección de Empresas', 'Contaduría Pública',
  'Gestión Integral del Recurso Hídrico', 'Ingeniería de Alimentos',
  'Enseñanza de la Matemática', 'Enseñanza del Castellano', 'Enseñanza de Estudios Sociales',
  'Ingeniería Industrial', 'Gestión Cultural'
)

UNION ALL

-- ── Sede del Atlántico (Turrialba + Paraíso + Guápiles) ────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Atlántico' AND c.nombre IN (
  'Informática Empresarial', 'Agronomía', 'Dirección de Empresas', 'Contaduría Pública',
  'Ingeniería en Topografía', 'Enseñanza de la Matemática', 'Enseñanza del Inglés',
  'Enseñanza de Estudios Sociales', 'Turismo Ecológico', 'Ingeniería en Desarrollo Sostenible'
)

UNION ALL

-- ── Sede de Guanacaste (Liberia + Santa Cruz) ──────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Guanacaste' AND c.nombre IN (
  'Ciencias de la Computación e Informática', 'Ingeniería Civil', 'Ingeniería Eléctrica',
  'Derecho', 'Dirección de Empresas', 'Contaduría Pública',
  'Turismo Ecológico', 'Enfermería', 'Psicología', 'Diseño Gráfico'
)

UNION ALL

-- ── Sede del Caribe (Limón) ────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Caribe' AND c.nombre IN (
  'Ingeniería de la Marina Civil',
  'Informática Empresarial', 'Dirección de Empresas', 'Contaduría Pública',
  'Administración Aduanera y Comercio Exterior',
  'Turismo Ecológico', 'Trabajo Social', 'Gestión Cultural'
)

UNION ALL

-- ── Sede del Sur (Golfito) ─────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Sur' AND c.nombre IN (
  'Informática Empresarial', 'Turismo Ecológico', 'Dirección de Empresas',
  'Enfermería', 'Ciencias de la Educación con Concentración en Inglés'
)

UNION ALL

-- ── Sede Interuniversitaria de Alajuela ────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Interuniversitaria' AND c.nombre IN (
  'Informática Empresarial', 'Ingeniería Industrial', 'Dirección de Empresas'
)

ON CONFLICT ON CONSTRAINT uq_carrera_campus DO NOTHING;


-- ============================================================
-- QUERIES DE VERIFICACIÓN (descomentar en SQL Editor)
-- ============================================================
/*
SELECT COUNT(*) AS total_combinaciones FROM public.carrera_campus;

SELECT uc.short_name AS sede, ca.nombre AS carrera
FROM public.carrera_campus cc
JOIN public.ucr_campuses uc ON uc.id           = cc.campus_id
JOIN public.carreras      ca ON ca.id_carreras  = cc.id_carrera
ORDER BY uc.short_name, ca.nombre;

-- Marina Civil debe aparecer SOLO en Caribe
SELECT uc.short_name FROM public.carrera_campus cc
JOIN public.carreras     ca ON ca.id_carreras = cc.id_carrera AND ca.nombre = 'Ingeniería de la Marina Civil'
JOIN public.ucr_campuses uc ON uc.id = cc.campus_id;
*/
