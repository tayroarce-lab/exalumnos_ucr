-- ============================================================
-- MIGRACIÓN 02: Tabla intermedia carrera_campus
--               Refactorización de estudiantes y exalumnos
-- Proyecto: Plataforma Digital Fundación Exalumnos UCR
-- Fecha: 2026-06-05
-- ============================================================
-- REQUISITO PREVIO: Las tablas `ucr_campuses` y `carreras`
--   deben existir antes de ejecutar este script.
--   La tabla `carreras` usa id_carreras INT (SERIAL/INT PK).
--   La tabla `ucr_campuses` usa id UUID PK.
-- ============================================================


-- ============================================================
-- BLOQUE 1: TABLA INTERMEDIA carrera_campus
--   Restricción explícita de la regla de negocio:
--   una carrera solo puede ser cursada en sedes habilitadas.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.carrera_campus (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  id_carrera  INT     NOT NULL REFERENCES public.carreras(id_carreras) ON DELETE CASCADE,
  campus_id   UUID    NOT NULL REFERENCES public.ucr_campuses(id)      ON DELETE CASCADE,

  -- Evita insertar la misma pareja dos veces
  CONSTRAINT uq_carrera_campus UNIQUE (id_carrera, campus_id)
);

COMMENT ON TABLE  public.carrera_campus            IS 'Tabla intermedia que modela la regla de negocio: qué carreras se imparten en qué sedes/recintos de la UCR.';
COMMENT ON COLUMN public.carrera_campus.id_carrera IS 'Referencia a carreras.id_carreras (INT).';
COMMENT ON COLUMN public.carrera_campus.campus_id  IS 'Referencia a ucr_campuses.id (UUID).';


-- ============================================================
-- BLOQUE 2: RLS para carrera_campus
--   Catálogo de solo lectura: cualquier usuario autenticado
--   puede leer, pero solo service_role/admin puede escribir.
-- ============================================================

ALTER TABLE public.carrera_campus ENABLE ROW LEVEL SECURITY;

-- Lectura pública para usuarios autenticados (formularios de registro)
CREATE POLICY "carrera_campus_select_authenticated"
  ON public.carrera_campus FOR SELECT
  TO authenticated
  USING (TRUE);

-- Escritura restringida a administradores
CREATE POLICY "carrera_campus_insert_admin"
  ON public.carrera_campus FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
  );

CREATE POLICY "carrera_campus_update_admin"
  ON public.carrera_campus FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
  );

CREATE POLICY "carrera_campus_delete_admin"
  ON public.carrera_campus FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
  );


-- ============================================================
-- BLOQUE 3: ÍNDICES de rendimiento para carrera_campus
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_carrera_campus_carrera ON public.carrera_campus(id_carrera);
CREATE INDEX IF NOT EXISTS idx_carrera_campus_campus  ON public.carrera_campus(campus_id);


-- ============================================================
-- BLOQUE 4: REFACTORIZACIÓN de tabla estudiantes
--   Se elimina la información de texto libre y se reemplaza
--   por una FK directa a carrera_campus, que garantiza que
--   la combinación carrera+sede sea válida a nivel de BD.
-- ============================================================

-- Paso 4.1: Eliminar columnas obsoletas (MVP: no hay datos históricos)
ALTER TABLE public.estudiantes
  DROP COLUMN IF EXISTS carrera,
  DROP COLUMN IF EXISTS sede,
  DROP COLUMN IF EXISTS escuela_facultad;

-- Paso 4.2: Añadir la nueva FK hacia carrera_campus
ALTER TABLE public.estudiantes
  ADD COLUMN id_carrera_campus UUID
    REFERENCES public.carrera_campus(id)
    ON DELETE RESTRICT; -- No borrar una combinación si hay estudiantes vinculados

-- Paso 4.3: Constraint NOT NULL diferido (aplicable después del seeding de usuarios)
-- En MVP se deja NULLABLE temporalmente para no bloquear inserts existentes.
-- Una vez estabilizado el formulario de registro, ejecutar:
--   ALTER TABLE public.estudiantes ALTER COLUMN id_carrera_campus SET NOT NULL;

COMMENT ON COLUMN public.estudiantes.id_carrera_campus IS 'FK a carrera_campus.id. Garantiza que la combinación carrera+sede que eligió el estudiante exista en el catálogo oficial UCR.';


-- ============================================================
-- BLOQUE 5: REFACTORIZACIÓN de tabla exalumnos
--   Un exalumno puede tener múltiples titulaciones (RF-01.2).
--   Se crea una tabla de unión exalumno_carreras.
-- ============================================================

-- Paso 5.1: Eliminar columnas de texto libre de exalumnos
ALTER TABLE public.exalumnos
  DROP COLUMN IF EXISTS carrera_ucr,
  DROP COLUMN IF EXISTS escuela_facultad;

-- Paso 5.2: Mover anio_graduacion a la tabla de unión
--   (el año de graduación es por carrera, no global del exalumno)
-- Nota: Se elimina aquí porque pasa al registro por carrera en la nueva tabla.
ALTER TABLE public.exalumnos
  DROP COLUMN IF EXISTS anio_graduacion;

-- Paso 5.3: Crear la tabla de unión exalumno_carreras
CREATE TABLE IF NOT EXISTS public.exalumno_carreras (
  id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  exalumno_id        UUID    NOT NULL REFERENCES public.exalumnos(user_id) ON DELETE CASCADE,
  id_carrera_campus  UUID    NOT NULL REFERENCES public.carrera_campus(id)  ON DELETE RESTRICT,
  anio_graduacion    INT     NOT NULL CHECK (anio_graduacion >= 1950),

  -- Un exalumno no puede registrar la misma combinación carrera+sede dos veces
  CONSTRAINT uq_exalumno_carrera_campus UNIQUE (exalumno_id, id_carrera_campus)
);

COMMENT ON TABLE  public.exalumno_carreras                   IS 'Registra los títulos obtenidos por un exalumno. Soporta múltiples titulaciones (RF-01.2).';
COMMENT ON COLUMN public.exalumno_carreras.id_carrera_campus IS 'FK a carrera_campus.id. Valida que la carrera haya sido impartida en la sede indicada.';
COMMENT ON COLUMN public.exalumno_carreras.anio_graduacion   IS 'Año de graduación para esta carrera específica.';


-- ============================================================
-- BLOQUE 6: RLS para exalumno_carreras
-- ============================================================

ALTER TABLE public.exalumno_carreras ENABLE ROW LEVEL SECURITY;

-- Lectura: el propio exalumno y administradores
CREATE POLICY "ex_carreras_select"
  ON public.exalumno_carreras FOR SELECT
  TO authenticated
  USING (
    exalumno_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
    -- Exalumnos con match activo también pueden ver los títulos del peer
    OR EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.exalumno_id = auth.uid()
        AND m.estudiante_id = public.exalumno_carreras.exalumno_id
        AND m.estado = 'activo'
    )
  );

-- Inserción: solo el propio exalumno puede agregar sus carreras
CREATE POLICY "ex_carreras_insert_own"
  ON public.exalumno_carreras FOR INSERT
  TO authenticated
  WITH CHECK (exalumno_id = auth.uid());

-- Actualización: solo el propio exalumno
CREATE POLICY "ex_carreras_update_own"
  ON public.exalumno_carreras FOR UPDATE
  TO authenticated
  USING (exalumno_id = auth.uid());

-- Eliminación: el exalumno o un admin
CREATE POLICY "ex_carreras_delete_own"
  ON public.exalumno_carreras FOR DELETE
  TO authenticated
  USING (
    exalumno_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
  );


-- ============================================================
-- BLOQUE 7: ÍNDICES de rendimiento para exalumno_carreras
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_ex  ON public.exalumno_carreras(exalumno_id);
CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_cc  ON public.exalumno_carreras(id_carrera_campus);
CREATE INDEX IF NOT EXISTS idx_exalumno_carreras_ano ON public.exalumno_carreras(anio_graduacion);


-- ============================================================
-- BLOQUE 8: SEEDING COMPLETO
--   Orden de inserción:
--     8.1  Sedes y recintos  → ucr_campuses
--     8.2  Carreras          → carreras
--     8.3  Mapeo oficial     → carrera_campus
-- ============================================================
-- NOTA IMPORTANTE:
--   Los UUIDs de ucr_campuses son literales fijos para garantizar
--   idempotencia al re-ejecutar el script (ON CONFLICT DO NOTHING).
--   Los IDs de carreras son SERIAL/INT autogenerados; usamos
--   variables CTE para capturarlos y cruzarlos con los UUIDs.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 8.1 SEDES Y RECINTOS (ucr_campuses)
-- ─────────────────────────────────────────────────────────────
-- Asumimos que la tabla ucr_campuses tiene: id UUID PK, name TEXT, short_name TEXT, created_at TIMESTAMPTZ
-- Se usa INSERT ... ON CONFLICT (id) DO NOTHING para idempotencia.

INSERT INTO public.ucr_campuses (id, name, short_name) VALUES
  -- Sede Central
  ('a0000000-0000-0000-0000-000000000001', 'Sede Rodrigo Facio (Central - San Pedro)', 'Rodrigo Facio'),

  -- Sede de Occidente y sus recintos
  ('a0000000-0000-0000-0000-000000000002', 'Sede de Occidente - Recinto de San Ramón', 'San Ramón'),
  ('a0000000-0000-0000-0000-000000000003', 'Sede de Occidente - Recinto de Grecia',    'Grecia'),

  -- Sede del Atlántico y sus recintos
  ('a0000000-0000-0000-0000-000000000004', 'Sede del Atlántico - Recinto de Turrialba', 'Turrialba'),
  ('a0000000-0000-0000-0000-000000000005', 'Sede del Atlántico - Recinto de Paraíso',   'Paraíso'),
  ('a0000000-0000-0000-0000-000000000006', 'Sede del Atlántico - Recinto de Guápiles',  'Guápiles'),

  -- Sede de Guanacaste y sus recintos
  ('a0000000-0000-0000-0000-000000000007', 'Sede de Guanacaste - Recinto de Liberia',    'Liberia'),
  ('a0000000-0000-0000-0000-000000000008', 'Sede de Guanacaste - Recinto de Santa Cruz', 'Santa Cruz'),

  -- Sede del Caribe
  ('a0000000-0000-0000-0000-000000000009', 'Sede del Caribe (Limón)', 'Sede Caribe'),

  -- Sede del Sur
  ('a0000000-0000-0000-0000-000000000010', 'Sede del Sur (Golfito)', 'Sede Sur'),

  -- Sede Interuniversitaria de Alajuela
  ('a0000000-0000-0000-0000-000000000011', 'Sede Interuniversitaria de Alajuela', 'Alajuela')

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 8.2 CARRERAS (tabla carreras)
-- ─────────────────────────────────────────────────────────────
-- IMPORTANTE: `id_carreras` es SERIAL (autogenerado).
-- Se asume que la tabla ya tiene la columna `nombre` con un
-- UNIQUE constraint en `nombre` para hacer la inserción idempotente.
-- Si no existe el UNIQUE en nombre, agrega: ON CONFLICT (nombre) DO NOTHING
-- (o bien agrega: ALTER TABLE public.carreras ADD CONSTRAINT uq_carrera_nombre UNIQUE (nombre);)

INSERT INTO public.carreras (nombre) VALUES
  -- Ciencias Exactas e Ingenierías
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

  -- Ciencias de la Salud
  ('Medicina y Cirugía'),
  ('Microbiología y Química Clínica'),
  ('Farmacia'),
  ('Odontología'),
  ('Enfermería'),
  ('Nutrición'),
  ('Laboratorio Clínico'),

  -- Ciencias Económicas y Empresariales
  ('Dirección de Empresas'),
  ('Contaduría Pública'),
  ('Economía'),
  ('Estadística'),
  ('Administración Pública'),
  ('Administración Aduanera y Comercio Exterior'),

  -- Ciencias Sociales y Humanidades
  ('Derecho'),
  ('Psicología'),
  ('Sociología'),
  ('Trabajo Social'),
  ('Ciencias Políticas'),
  ('Relaciones Internacionales'),

  -- Comunicación y Diseño
  ('Comunicación Colectiva'),
  ('Periodismo'),
  ('Publicidad'),
  ('Relaciones Públicas'),
  ('Audiovisuales'),
  ('Diseño Gráfico'),

  -- Arquitectura y Artes
  ('Arquitectura'),
  ('Artes Plásticas'),
  ('Artes Musicales'),
  ('Artes Dramáticas'),

  -- Ciencias Básicas
  ('Biología'),
  ('Química'),
  ('Física'),
  ('Matemática'),
  ('Geología'),

  -- Educación y Enseñanza
  ('Enseñanza de la Matemática'),
  ('Enseñanza del Castellano'),
  ('Enseñanza de Estudios Sociales'),
  ('Enseñanza del Inglés'),
  ('Ciencias de la Educación con Concentración en Inglés'),

  -- Ciencias Agropecuarias y Recursos Naturales
  ('Agronomía'),
  ('Fitotecnia'),
  ('Zootecnia'),
  ('Economía Agrícola'),
  ('Gestión Integral del Recurso Hídrico'),

  -- Turismo y Cultura
  ('Turismo Ecológico'),
  ('Gestión Cultural')

ON CONFLICT (nombre) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 8.3 MAPEO carrera_campus
--   Usamos un bloque CTE para capturar los IDs autogenerados
--   de carreras y los UUIDs fijos de campus y cruzarlos.
-- ─────────────────────────────────────────────────────────────

WITH
  -- Capturar los IDs de todas las carreras por nombre
  c AS (
    SELECT id_carreras, nombre FROM public.carreras
  ),
  -- Alias cortos para los campus (UUIDs fijos del seeding)
  s AS (
    SELECT id, short_name FROM public.ucr_campuses
  )
INSERT INTO public.carrera_campus (id_carrera, campus_id)

-- ──────────────────────────────────────────
-- SEDE RODRIGO FACIO (Central - San Pedro)
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Rodrigo Facio'
  AND c.nombre IN (
    'Ciencias de la Computación e Informática',
    'Ingeniería Civil',
    'Ingeniería Eléctrica',
    'Ingeniería Industrial',
    'Ingeniería Mecánica',
    'Ingeniería Química',
    'Ingeniería Topográfica',
    'Dirección de Empresas',
    'Contaduría Pública',
    'Economía',
    'Estadística',
    'Administración Pública',
    'Administración Aduanera y Comercio Exterior',
    'Derecho',
    'Medicina y Cirugía',
    'Microbiología y Química Clínica',
    'Farmacia',
    'Odontología',
    'Enfermería',
    'Nutrición',
    'Arquitectura',
    'Ciencias Políticas',
    'Relaciones Internacionales',
    'Psicología',
    'Comunicación Colectiva',
    'Periodismo',
    'Publicidad',
    'Relaciones Públicas',
    'Audiovisuales',
    'Sociología',
    'Trabajo Social',
    'Biología',
    'Química',
    'Física',
    'Matemática',
    'Geología',
    'Diseño Gráfico',
    'Artes Plásticas',
    'Artes Musicales',
    'Artes Dramáticas',
    'Agronomía',
    'Fitotecnia',
    'Zootecnia',
    'Economía Agrícola'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DE OCCIDENTE - RECINTO DE SAN RAMÓN
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'San Ramón'
  AND c.nombre IN (
    'Informática Empresarial',
    'Laboratorio Clínico',
    'Enfermería',
    'Psicología',
    'Trabajo Social',
    'Derecho',
    'Dirección de Empresas',
    'Contaduría Pública',
    'Gestión Integral del Recurso Hídrico',
    'Ingeniería de Alimentos',
    'Enseñanza de la Matemática',
    'Enseñanza del Castellano',
    'Enseñanza de Estudios Sociales'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DE OCCIDENTE - RECINTO DE GRECIA
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Grecia'
  AND c.nombre IN (
    'Informática Empresarial',
    'Ingeniería Industrial',
    'Laboratorio Clínico',
    'Gestión Cultural'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DEL ATLÁNTICO - RECINTO DE TURRIALBA
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Turrialba'
  AND c.nombre IN (
    'Informática Empresarial',
    'Agronomía',
    'Dirección de Empresas',
    'Contaduría Pública',
    'Ingeniería en Topografía',
    'Enseñanza de la Matemática',
    'Enseñanza del Inglés',
    'Enseñanza de Estudios Sociales'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DEL ATLÁNTICO - RECINTO DE PARAÍSO
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Paraíso'
  AND c.nombre IN (
    'Informática Empresarial',
    'Turismo Ecológico',
    'Dirección de Empresas',
    'Enseñanza del Inglés'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DEL ATLÁNTICO - RECINTO DE GUÁPILES
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Guápiles'
  AND c.nombre IN (
    'Informática Empresarial',
    'Ingeniería en Desarrollo Sostenible',
    'Dirección de Empresas'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DE GUANACASTE - RECINTO DE LIBERIA
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Liberia'
  AND c.nombre IN (
    'Ciencias de la Computación e Informática',
    'Ingeniería Civil',
    'Ingeniería Eléctrica',
    'Derecho',
    'Dirección de Empresas',
    'Contaduría Pública',
    'Turismo Ecológico',
    'Enfermería',
    'Psicología',
    'Diseño Gráfico'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DE GUANACASTE - RECINTO DE SANTA CRUZ
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Santa Cruz'
  AND c.nombre IN (
    'Turismo Ecológico',
    'Dirección de Empresas'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DEL CARIBE (LIMÓN)
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Sede Caribe'
  AND c.nombre IN (
    'Ingeniería de la Marina Civil',
    'Informática Empresarial',
    'Dirección de Empresas',
    'Contaduría Pública',
    'Administración Aduanera y Comercio Exterior',
    'Turismo Ecológico',
    'Trabajo Social',
    'Gestión Cultural'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE DEL SUR (GOLFITO)
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Sede Sur'
  AND c.nombre IN (
    'Informática Empresarial',
    'Turismo Ecológico',
    'Dirección de Empresas',
    'Enfermería',
    'Ciencias de la Educación con Concentración en Inglés'
  )

UNION ALL

-- ──────────────────────────────────────────
-- SEDE INTERUNIVERSITARIA DE ALAJUELA
-- ──────────────────────────────────────────
SELECT c.id_carreras, s.id FROM c, s
WHERE s.short_name = 'Alajuela'
  AND c.nombre IN (
    'Informática Empresarial',
    'Ingeniería Industrial',
    'Dirección de Empresas'
  )

ON CONFLICT ON CONSTRAINT uq_carrera_campus DO NOTHING;


-- ============================================================
-- VERIFICACIÓN DE INTEGRIDAD REFERENCIAL (opcional / debug)
-- Ejecutar estas queries manualmente para validar el seeding.
-- ============================================================

/*
-- 1. ¿Cuántas combinaciones carrera-campus se insertaron?
SELECT COUNT(*) AS total_combinaciones FROM public.carrera_campus;

-- 2. ¿Qué carreras tiene cada sede?
SELECT
  uc.short_name  AS sede,
  ca.nombre      AS carrera
FROM public.carrera_campus cc
JOIN public.ucr_campuses   uc ON uc.id          = cc.campus_id
JOIN public.carreras       ca ON ca.id_carreras  = cc.id_carrera
ORDER BY uc.short_name, ca.nombre;

-- 3. ¿La Marina Civil está SOLO en Caribe?
SELECT uc.short_name FROM public.carrera_campus cc
JOIN public.carreras    ca ON ca.id_carreras = cc.id_carrera AND ca.nombre = 'Ingeniería de la Marina Civil'
JOIN public.ucr_campuses uc ON uc.id = cc.campus_id;
-- Debe retornar: solo 'Sede Caribe'

-- 4. Prueba de integridad: intentar insertar un estudiante con
--    una combinación inexistente debería fallar si el FK está activo.
--    (Solo prueba manual en el formulario de la app)
*/
