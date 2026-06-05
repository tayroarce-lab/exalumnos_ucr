-- ============================================================
-- MIGRACIÓN 05: Tabla intermedia carrera_campus
--               Tabla de carreras UCR
--               Refactorización de estudiantes y exalumnos
-- Proyecto: Plataforma Digital Fundación Exalumnos UCR
-- Autor: Tayro (rama tayro)
-- Contexto: Este script corre DESPUÉS de:
--   - 01_init_db.sql         (tablas base del sistema)
--   - 03_ucr_academic_structure.sql (crea ucr_campuses y ucr_faculties)
-- ============================================================


-- ============================================================
-- BLOQUE 1: TABLA DE CARRERAS
--   Si ya existe (creada manualmente en el dashboard), la extendemos.
--   Si no existe, la creamos completa.
-- ============================================================

-- Paso 1.1: Crear tabla si no existe (sin facultad_id para compatibilidad)
CREATE TABLE IF NOT EXISTS public.carreras (
  id          SERIAL      PRIMARY KEY,
  nombre      TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_carrera_nombre UNIQUE (nombre)
);

-- Paso 1.2: Agregar columna facultad_id si no existe (ALTER idempotente)
ALTER TABLE public.carreras
  ADD COLUMN IF NOT EXISTS facultad_id UUID
    REFERENCES public.ucr_faculties(id) ON DELETE SET NULL;

COMMENT ON TABLE  public.carreras             IS 'Catálogo de carreras ofrecidas por la UCR.';
COMMENT ON COLUMN public.carreras.facultad_id  IS 'FK a ucr_faculties.id. Indica a qué facultad pertenece la carrera.';

-- Paso 1.3: RLS (DROP antes de CREATE para idempotencia)
ALTER TABLE public.carreras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carreras_select_authenticated" ON public.carreras;
CREATE POLICY "carreras_select_authenticated"
  ON public.carreras FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "carreras_write_admin" ON public.carreras;
CREATE POLICY "carreras_write_admin"
  ON public.carreras FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

-- Índice para búsquedas por facultad
CREATE INDEX IF NOT EXISTS idx_carreras_facultad ON public.carreras(facultad_id);


-- ============================================================
-- BLOQUE 2: TABLA INTERMEDIA carrera_campus
--   Modela la regla de negocio: una carrera se imparte
--   solo en ciertas sedes. Sin un registro aquí, esa
--   combinación no puede ser seleccionada por un usuario.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.carrera_campus (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  carrera_id  INT     NOT NULL REFERENCES public.carreras(id)      ON DELETE CASCADE,
  campus_id   UUID    NOT NULL REFERENCES public.ucr_campuses(id)  ON DELETE CASCADE,

  CONSTRAINT uq_carrera_campus UNIQUE (carrera_id, campus_id)
);

COMMENT ON TABLE  public.carrera_campus           IS 'Tabla intermedia: qué carreras se imparten en qué sedes UCR.';
COMMENT ON COLUMN public.carrera_campus.carrera_id IS 'FK a carreras.id (INT serial).';
COMMENT ON COLUMN public.carrera_campus.campus_id  IS 'FK a ucr_campuses.id (UUID).';

-- RLS (DROP antes de CREATE para idempotencia)
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

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_carrera_campus_carrera ON public.carrera_campus(carrera_id);
CREATE INDEX IF NOT EXISTS idx_carrera_campus_campus  ON public.carrera_campus(campus_id);


-- ============================================================
-- BLOQUE 3: REFACTORIZACIÓN de tabla estudiantes
--   Se eliminan los campos de texto libre y se reemplaza
--   por una FK a carrera_campus, garantizando integridad
--   referencial: la combinación carrera+sede debe ser válida.
-- ============================================================

-- Eliminar columnas de texto libre (MVP: sin datos históricos)
ALTER TABLE public.estudiantes
  DROP COLUMN IF EXISTS carrera,
  DROP COLUMN IF EXISTS sede,
  DROP COLUMN IF EXISTS escuela_facultad;

-- Agregar FK a la tabla intermedia
-- Se deja NULLABLE en MVP para no bloquear filas existentes.
-- Cuando el formulario esté estable, ejecutar:
--   ALTER TABLE public.estudiantes ALTER COLUMN id_carrera_campus SET NOT NULL;
ALTER TABLE public.estudiantes
  ADD COLUMN IF NOT EXISTS id_carrera_campus UUID
    REFERENCES public.carrera_campus(id)
    ON DELETE RESTRICT;

COMMENT ON COLUMN public.estudiantes.id_carrera_campus
  IS 'FK a carrera_campus.id. Garantiza que la carrera elegida se imparta en la sede seleccionada.';

CREATE INDEX IF NOT EXISTS idx_estudiantes_carrera_campus ON public.estudiantes(id_carrera_campus);


-- ============================================================
-- BLOQUE 4: REFACTORIZACIÓN de tabla exalumnos
--   Un exalumno puede tener múltiples títulos (RF-01.2).
--   Se elimina el campo único carrera_ucr y se crea la
--   tabla exalumno_carreras para soportar n titulaciones.
-- ============================================================

-- Eliminar columnas obsoletas de texto libre
ALTER TABLE public.exalumnos
  DROP COLUMN IF EXISTS carrera_ucr,
  DROP COLUMN IF EXISTS escuela_facultad,
  DROP COLUMN IF EXISTS anio_graduacion; -- Se mueve a exalumno_carreras (es por carrera, no global)

-- Tabla de unión: historial académico del exalumno
CREATE TABLE IF NOT EXISTS public.exalumno_carreras (
  id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  exalumno_id        UUID    NOT NULL REFERENCES public.exalumnos(user_id) ON DELETE CASCADE,
  id_carrera_campus  UUID    NOT NULL REFERENCES public.carrera_campus(id)  ON DELETE RESTRICT,
  anio_graduacion    INT     NOT NULL CHECK (anio_graduacion >= 1950),

  -- Un exalumno no puede registrar la misma carrera+sede dos veces
  CONSTRAINT uq_exalumno_carrera_campus UNIQUE (exalumno_id, id_carrera_campus)
);

COMMENT ON TABLE  public.exalumno_carreras
  IS 'Historial de titulaciones de un exalumno. Soporta múltiples títulos (RF-01.2).';
COMMENT ON COLUMN public.exalumno_carreras.id_carrera_campus
  IS 'FK a carrera_campus.id. Valida que la carrera se haya impartido en esa sede.';
COMMENT ON COLUMN public.exalumno_carreras.anio_graduacion
  IS 'Año de graduación para esta carrera específica (no del perfil global).';

-- RLS (DROP antes de CREATE para idempotencia)
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_ex  ON public.exalumno_carreras(exalumno_id);
CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_cc  ON public.exalumno_carreras(id_carrera_campus);
CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_ano ON public.exalumno_carreras(anio_graduacion);


-- ============================================================
-- BLOQUE 5: SEEDING — CARRERAS
--   Las sedes ya fueron insertadas en 03_ucr_academic_structure.sql.
--   Aquí solo insertamos las carreras y el mapeo carrera_campus.
--
--   NOTA: Las sedes en ucr_campuses usan el modelo de sede agrupada
--   (ej: "Sede de Occidente (San Ramón)") según el script de tu
--   compañero. El mapeo abajo usa ese mismo modelo.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 5.1 INSERTAR CARRERAS con referencia a facultades
--     ON CONFLICT (nombre) DO NOTHING = idempotente
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.carreras (nombre, facultad_id)
SELECT nombre, f.id
FROM (VALUES
  -- Ingeniería
  ('Ciencias de la Computación e Informática',      'Ingeniería'),
  ('Informática Empresarial',                        'Ingeniería'),
  ('Ingeniería Civil',                               'Ingeniería'),
  ('Ingeniería Eléctrica',                           'Ingeniería'),
  ('Ingeniería Industrial',                          'Ingeniería'),
  ('Ingeniería Mecánica',                            'Ingeniería'),
  ('Ingeniería Química',                             'Ingeniería'),
  ('Ingeniería Topográfica',                         'Ingeniería'),
  ('Ingeniería en Topografía',                       'Ingeniería'),
  ('Ingeniería en Desarrollo Sostenible',            'Ingeniería'),
  ('Ingeniería de Alimentos',                        'Ingeniería'),
  ('Ingeniería de la Marina Civil',                  'Ingeniería'),

  -- Salud
  ('Medicina y Cirugía',                             'Salud'),
  ('Microbiología y Química Clínica',                'Salud'),
  ('Farmacia',                                       'Salud'),
  ('Odontología',                                    'Salud'),
  ('Enfermería',                                     'Salud'),
  ('Nutrición',                                      'Salud'),
  ('Laboratorio Clínico',                            'Salud'),

  -- Ciencias Económicas
  ('Dirección de Empresas',                          'Ciencias Económicas'),
  ('Contaduría Pública',                             'Ciencias Económicas'),
  ('Economía',                                       'Ciencias Económicas'),
  ('Estadística',                                    'Ciencias Económicas'),
  ('Administración Pública',                         'Ciencias Económicas'),
  ('Administración Aduanera y Comercio Exterior',    'Ciencias Económicas'),

  -- Derecho
  ('Derecho',                                        'Derecho'),

  -- Ciencias Sociales
  ('Psicología',                                     'Ciencias Sociales'),
  ('Sociología',                                     'Ciencias Sociales'),
  ('Trabajo Social',                                 'Ciencias Sociales'),
  ('Ciencias Políticas',                             'Ciencias Sociales'),
  ('Relaciones Internacionales',                     'Ciencias Sociales'),
  ('Comunicación Colectiva',                         'Ciencias Sociales'),
  ('Periodismo',                                     'Ciencias Sociales'),
  ('Publicidad',                                     'Ciencias Sociales'),
  ('Relaciones Públicas',                            'Ciencias Sociales'),
  ('Audiovisuales',                                  'Ciencias Sociales'),

  -- Artes y Letras
  ('Arquitectura',                                   'Artes y Letras'),
  ('Diseño Gráfico',                                 'Artes y Letras'),
  ('Artes Plásticas',                                'Artes y Letras'),
  ('Artes Musicales',                                'Artes y Letras'),
  ('Artes Dramáticas',                               'Artes y Letras'),
  ('Gestión Cultural',                               'Artes y Letras'),

  -- Ciencias Básicas
  ('Biología',                                       'Ciencias Básicas'),
  ('Química',                                        'Ciencias Básicas'),
  ('Física',                                         'Ciencias Básicas'),
  ('Matemática',                                     'Ciencias Básicas'),
  ('Geología',                                       'Ciencias Básicas'),

  -- Educación
  ('Enseñanza de la Matemática',                     'Educación'),
  ('Enseñanza del Castellano',                       'Educación'),
  ('Enseñanza de Estudios Sociales',                 'Educación'),
  ('Enseñanza del Inglés',                           'Educación'),
  ('Ciencias de la Educación con Concentración en Inglés', 'Educación'),

  -- Ciencias Agroalimentarias
  ('Agronomía',                                      'Ciencias Agroalimentarias'),
  ('Fitotecnia',                                     'Ciencias Agroalimentarias'),
  ('Zootecnia',                                      'Ciencias Agroalimentarias'),
  ('Economía Agrícola',                              'Ciencias Agroalimentarias'),
  ('Gestión Integral del Recurso Hídrico',           'Ciencias Agroalimentarias'),
  ('Turismo Ecológico',                              'Ciencias Agroalimentarias')

) AS v(nombre, facultad_nombre)
JOIN public.ucr_faculties f ON f.name = v.facultad_nombre
ON CONFLICT (nombre) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 5.2 MAPEO OFICIAL CARRERA-CAMPUS
--   Usa las sedes agrupadas tal como las insertó el script 03.
--   CTE para cruzar nombres de carrera → id INT
--              y nombres de sede   → id UUID
-- ─────────────────────────────────────────────────────────────
WITH
  c AS (SELECT id, nombre FROM public.carreras),
  s AS (SELECT id, short_name FROM public.ucr_campuses)
INSERT INTO public.carrera_campus (carrera_id, campus_id)

-- ── Sede Rodrigo Facio ─────────────────────────────────────
SELECT c.id, s.id FROM c, s
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

-- ── Sede de Occidente ──────────────────────────────────────
-- Agrupa San Ramón y Grecia; incluimos la unión de ambos recintos
SELECT c.id, s.id FROM c, s
WHERE s.short_name = 'Occidente' AND c.nombre IN (
  'Informática Empresarial', 'Laboratorio Clínico', 'Enfermería', 'Psicología',
  'Trabajo Social', 'Derecho', 'Dirección de Empresas', 'Contaduría Pública',
  'Gestión Integral del Recurso Hídrico', 'Ingeniería de Alimentos',
  'Enseñanza de la Matemática', 'Enseñanza del Castellano', 'Enseñanza de Estudios Sociales',
  'Ingeniería Industrial', 'Gestión Cultural'  -- Recinto Grecia
)

UNION ALL

-- ── Sede del Atlántico ─────────────────────────────────────
-- Agrupa Turrialba, Paraíso y Guápiles
SELECT c.id, s.id FROM c, s
WHERE s.short_name = 'Atlántico' AND c.nombre IN (
  'Informática Empresarial', 'Agronomía', 'Dirección de Empresas', 'Contaduría Pública',
  'Ingeniería en Topografía', 'Enseñanza de la Matemática', 'Enseñanza del Inglés',
  'Enseñanza de Estudios Sociales',   -- Turrialba
  'Turismo Ecológico',                 -- Paraíso y Guápiles comparten
  'Ingeniería en Desarrollo Sostenible' -- Guápiles
)

UNION ALL

-- ── Sede de Guanacaste ─────────────────────────────────────
-- Agrupa Liberia y Santa Cruz
SELECT c.id, s.id FROM c, s
WHERE s.short_name = 'Guanacaste' AND c.nombre IN (
  'Ciencias de la Computación e Informática', 'Ingeniería Civil', 'Ingeniería Eléctrica',
  'Derecho', 'Dirección de Empresas', 'Contaduría Pública',
  'Turismo Ecológico', 'Enfermería', 'Psicología', 'Diseño Gráfico'
)

UNION ALL

-- ── Sede del Caribe ────────────────────────────────────────
SELECT c.id, s.id FROM c, s
WHERE s.short_name = 'Caribe' AND c.nombre IN (
  'Ingeniería de la Marina Civil', -- exclusiva del Caribe
  'Informática Empresarial', 'Dirección de Empresas', 'Contaduría Pública',
  'Administración Aduanera y Comercio Exterior',
  'Turismo Ecológico', 'Trabajo Social', 'Gestión Cultural'
)

UNION ALL

-- ── Sede del Sur ───────────────────────────────────────────
SELECT c.id, s.id FROM c, s
WHERE s.short_name = 'Sur' AND c.nombre IN (
  'Informática Empresarial', 'Turismo Ecológico', 'Dirección de Empresas',
  'Enfermería', 'Ciencias de la Educación con Concentración en Inglés'
)

UNION ALL

-- ── Sede Interuniversitaria de Alajuela ────────────────────
SELECT c.id, s.id FROM c, s
WHERE s.short_name = 'Interuniversitaria' AND c.nombre IN (
  'Informática Empresarial', 'Ingeniería Industrial', 'Dirección de Empresas'
)

ON CONFLICT ON CONSTRAINT uq_carrera_campus DO NOTHING;


-- ============================================================
-- QUERIES DE VERIFICACIÓN (descomentar y ejecutar en Supabase)
-- ============================================================
/*
-- ¿Cuántas combinaciones se insertaron?
SELECT COUNT(*) AS total FROM public.carrera_campus;

-- ¿Qué carreras tiene cada sede? (vista completa)
SELECT uc.short_name AS sede, ca.nombre AS carrera
FROM public.carrera_campus cc
JOIN public.ucr_campuses uc ON uc.id  = cc.campus_id
JOIN public.carreras      ca ON ca.id = cc.carrera_id
ORDER BY uc.short_name, ca.nombre;

-- La Marina Civil debe aparecer SOLO en 'Caribe'
SELECT uc.short_name FROM public.carrera_campus cc
JOIN public.carreras     ca ON ca.id = cc.carrera_id AND ca.nombre = 'Ingeniería de la Marina Civil'
JOIN public.ucr_campuses uc ON uc.id = cc.campus_id;
*/
