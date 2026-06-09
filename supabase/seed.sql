-- ============================================================
-- SEED DATA — Plataforma Digital Fundación Exalumnos UCR
-- Archivo : supabase/seed.sql
-- Esquema : Estado post-migración 20260608170000_schema_refactor
-- Autor   : QA / Data Engineering
-- Fecha   : 2026-06-08
-- ============================================================
-- CONVENCIONES DE IDs FIJOS
--   Admins       : aa000001-... / aa000002-...
--   Exalumnos    : ex000001-... → ex000006-...
--   Estudiantes  : st000001-... → st000007-...
--   Posiciones   : po000001-... → po000004-...
--   Matches      : ma000001-... → ma000005-...
--   Donations    : do000001-... → do000004-...
--   Curriculums  : cv000001-... → cv000003-...
-- ============================================================

-- ============================================================
-- PASO 0: DESHABILITAR TRIGGERS PROBLEMÁTICOS PARA EL SEED
-- El trigger on_auth_user_created sincroniza auth.users → public.users.
-- Como insertaremos directamente en public.users, lo deshabilitamos
-- temporalmente para evitar duplicados / conflictos.
-- ============================================================
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created_trigger;

-- ============================================================
-- BLOQUE 1: ESTRUCTURA ACADÉMICA UCR (campus, facultades, carreras)
-- Nota: Las migraciones ya insertan estos datos. Usamos ON CONFLICT
-- para hacer el seed idempotente. La migración 20260608 renombra
-- campus_v2 → campus y facultades_v2 → facultades.
-- ============================================================

-- 1.1 Campus (smallint PK, generado por identity)
INSERT INTO public.campus (nombre) VALUES
  ('Rodrigo Facio'),
  ('Occidente'),
  ('Atlántico'),
  ('Guanacaste'),
  ('Pacífico'),
  ('Caribe'),
  ('Sur'),
  ('Interuniversitaria')
ON CONFLICT (nombre) DO NOTHING;

-- 1.2 Facultades (smallint PK, generado por identity)
INSERT INTO public.facultades (nombre) VALUES
  ('Ingeniería'),
  ('Ciencias Económicas'),
  ('Ciencias Sociales'),
  ('Ciencias Básicas'),
  ('Letras'),
  ('Medicina'),
  ('Derecho'),
  ('Educación'),
  ('Ciencias Agroalimentarias')
ON CONFLICT (nombre) DO NOTHING;

-- 1.3 Carreras vinculadas a facultades
INSERT INTO public.carreras (nombre, facultad_id)
SELECT c.nombre, f.id
FROM (VALUES
  ('Ciencias de la Computación e Informática', 'Ingeniería'),
  ('Ingeniería Eléctrica',                     'Ingeniería'),
  ('Ingeniería Industrial',                    'Ingeniería'),
  ('Ingeniería Civil',                         'Ingeniería'),
  ('Informática Empresarial',                  'Ingeniería'),
  ('Dirección de Empresas',                    'Ciencias Económicas'),
  ('Contaduría Pública',                       'Ciencias Económicas'),
  ('Economía',                                 'Ciencias Económicas'),
  ('Administración Pública',                   'Ciencias Económicas'),
  ('Derecho',                                  'Derecho'),
  ('Psicología',                               'Ciencias Sociales'),
  ('Sociología',                               'Ciencias Sociales'),
  ('Trabajo Social',                           'Ciencias Sociales'),
  ('Comunicación Colectiva',                   'Letras'),
  ('Medicina y Cirugía',                       'Medicina'),
  ('Microbiología y Química Clínica',          'Medicina'),
  ('Biología',                                 'Ciencias Básicas'),
  ('Química',                                  'Ciencias Básicas'),
  ('Matemática',                               'Ciencias Básicas'),
  ('Agronomía',                                'Ciencias Agroalimentarias')
) AS c(nombre, facultad_nombre)
JOIN public.facultades f ON f.nombre = c.facultad_nombre
ON CONFLICT (nombre) DO NOTHING;

-- 1.4 Mapeo Carrera ↔ Campus (tabla intermedia carrera_campus)
-- Rodrigo Facio (id obtenido dinámicamente con subconsulta)
INSERT INTO public.carrera_campus (carrera_id, campus_id)
SELECT ca.id, cm.id
FROM public.carreras ca
CROSS JOIN public.campus cm
WHERE cm.nombre = 'Rodrigo Facio'
  AND ca.nombre IN (
    'Ciencias de la Computación e Informática',
    'Ingeniería Eléctrica', 'Ingeniería Industrial', 'Ingeniería Civil',
    'Dirección de Empresas', 'Contaduría Pública', 'Economía',
    'Administración Pública', 'Derecho', 'Psicología', 'Sociología',
    'Trabajo Social', 'Comunicación Colectiva', 'Medicina y Cirugía',
    'Microbiología y Química Clínica', 'Biología', 'Química', 'Matemática'
  )
ON CONFLICT (carrera_id, campus_id) DO NOTHING;

-- Occidente
INSERT INTO public.carrera_campus (carrera_id, campus_id)
SELECT ca.id, cm.id
FROM public.carreras ca
CROSS JOIN public.campus cm
WHERE cm.nombre = 'Occidente'
  AND ca.nombre IN (
    'Informática Empresarial', 'Dirección de Empresas', 'Contaduría Pública',
    'Derecho', 'Psicología', 'Trabajo Social', 'Ingeniería Industrial'
  )
ON CONFLICT (carrera_id, campus_id) DO NOTHING;

-- Atlántico
INSERT INTO public.carrera_campus (carrera_id, campus_id)
SELECT ca.id, cm.id
FROM public.carreras ca
CROSS JOIN public.campus cm
WHERE cm.nombre = 'Atlántico'
  AND ca.nombre IN (
    'Informática Empresarial', 'Agronomía', 'Dirección de Empresas', 'Contaduría Pública'
  )
ON CONFLICT (carrera_id, campus_id) DO NOTHING;

-- Guanacaste
INSERT INTO public.carrera_campus (carrera_id, campus_id)
SELECT ca.id, cm.id
FROM public.carreras ca
CROSS JOIN public.campus cm
WHERE cm.nombre = 'Guanacaste'
  AND ca.nombre IN (
    'Ciencias de la Computación e Informática', 'Ingeniería Civil',
    'Ingeniería Eléctrica', 'Derecho', 'Dirección de Empresas',
    'Contaduría Pública', 'Psicología'
  )
ON CONFLICT (carrera_id, campus_id) DO NOTHING;

-- Pacífico
INSERT INTO public.carrera_campus (carrera_id, campus_id)
SELECT ca.id, cm.id
FROM public.carreras ca
CROSS JOIN public.campus cm
WHERE cm.nombre = 'Pacífico'
  AND ca.nombre IN (
    'Informática Empresarial', 'Dirección de Empresas', 'Contaduría Pública'
  )
ON CONFLICT (carrera_id, campus_id) DO NOTHING;

-- ============================================================
-- BLOQUE 2: CATÁLOGOS DE MATCHING
-- interest_areas y industry_sectors ya fueron creados en las
-- migraciones 04/05. Se usa ON CONFLICT para idempotencia.
-- ============================================================

-- 2.1 Áreas de Interés (14 oficiales del proyecto)
INSERT INTO public.interest_areas (id, name) VALUES
  ('tecnologia',       'Tecnología e Innovación'),
  ('salud',            'Salud y Bienestar'),
  ('educacion',        'Educación y Pedagogía'),
  ('ambiente',         'Medio Ambiente y Sostenibilidad'),
  ('arte_cultura',     'Arte y Cultura'),
  ('ciencias_sociales','Ciencias Sociales'),
  ('agro',             'Agro y Alimentación'),
  ('emprendimiento',   'Emprendimiento y Negocios'),
  ('ingenieria',       'Ingeniería y Construcción'),
  ('derecho',          'Derecho y Política Pública'),
  ('economia',         'Economía y Finanzas'),
  ('comunicacion',     'Comunicación y Medios'),
  ('turismo',          'Turismo y Patrimonio'),
  ('investigacion',    'Investigación Científica')
ON CONFLICT (id) DO NOTHING;

-- 2.2 Sectores Industriales (12 existentes + ampliados a 15)
INSERT INTO public.industry_sectors (id, name) VALUES
  ('tecnologia_ti',            'Tecnología, Software y TI'),
  ('finanzas_banca',           'Finanzas, Banca y Seguros'),
  ('salud_medicina',           'Salud, Médica y Farmacéutica'),
  ('ingenieria_construccion',  'Ingeniería, Construcción y Arquitectura'),
  ('educacion_academia',       'Educación y Academia'),
  ('manufactura_industria',    'Manufactura y Producción'),
  ('logistica_transporte',     'Logística, Transporte y Distribución'),
  ('turismo_hospitalidad',     'Turismo, Hotelería y Gastronomía'),
  ('agro_alimentos',           'Agropecuario y Alimentos'),
  ('comercio_retail',          'Comercio, Ventas y Retail'),
  ('gobierno_publico',         'Gobierno y Sector Público'),
  ('servicios_profesionales',  'Consultoría y Servicios Profesionales'),
  ('dispositivos_medicos',     'Dispositivos Médicos y MedTech'),
  ('energia_utilities',        'Energía y Servicios Públicos'),
  ('investigacion_ciencia',    'Investigación y Ciencia Aplicada')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLOQUE 3: USUARIOS — auth.users + public.users
-- Estrategia: INSERT en auth.users dispara on_auth_user_created
-- que crea la fila en public.users. Luego completamos con UPDATE.
-- Contraseña universal de prueba: UCRAlumni2026!
-- ============================================================

-- 3A: auth.users
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
-- ── ADMINISTRADORES ────────────────────────────────────────────────────────
(
  'aa000001-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'admin.principal@fundacionucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Mariela","apellidos":"Vargas Mora","rol":"admin"}',
  now(), now(), '', '', '', ''
),
(
  'aa000002-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'admin.sistemas@fundacionucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Diego","apellidos":"Solano Ureña","rol":"admin"}',
  now(), now(), '', '', '', ''
),
-- ── EXALUMNOS ──────────────────────────────────────────────────────────────
(
  'ex000001-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'andres.quesada@intel.com',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Andrés","apellidos":"Quesada Picado","rol":"exalumno"}',
  now(), now(), '', '', '', ''
),
(
  'ex000002-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'valeria.mora@mckinsey.com',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Valeria","apellidos":"Mora Cascante","rol":"exalumno"}',
  now(), now(), '', '', '', ''
),
(
  'ex000003-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'rodrigo.arias@bostonsci.com',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Rodrigo","apellidos":"Arias Fonseca","rol":"exalumno"}',
  now(), now(), '', '', '', ''
),
(
  'ex000004-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'carolina.jimenez@grupoice.com',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Carolina","apellidos":"Jiménez Brenes","rol":"exalumno"}',
  now(), now(), '', '', '', ''
),
(
  'ex000005-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'pablo.saenz@amazon.com',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Pablo","apellidos":"Sáenz Víquez","rol":"exalumno"}',
  now(), now(), '', '', '', ''
),
(
  'ex000006-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'natalia.brenes@bac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Natalia","apellidos":"Brenes Rodríguez","rol":"exalumno"}',
  now(), now(), '', '', '', ''
),
-- ── ESTUDIANTES ────────────────────────────────────────────────────────────
(
  'st000001-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'ana.guerrero@ucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Ana","apellidos":"Guerrero Solís","rol":"estudiante"}',
  now(), now(), '', '', '', ''
),
(
  'st000002-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'marco.artavia@ucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Marco","apellidos":"Artavia Badilla","rol":"estudiante"}',
  now(), now(), '', '', '', ''
),
(
  'st000003-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'sofia.campos@ucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Sofía","apellidos":"Campos Arroyo","rol":"estudiante"}',
  now(), now(), '', '', '', ''
),
(
  'st000004-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'daniel.rojas@ucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Daniel","apellidos":"Rojas Monge","rol":"estudiante"}',
  now(), now(), '', '', '', ''
),
(
  'st000005-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'valentina.pizarro@ucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Valentina","apellidos":"Pizarro Matarrita","rol":"estudiante"}',
  now(), now(), '', '', '', ''
),
(
  'st000006-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'carlos.mejia@ucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Carlos","apellidos":"Mejía Herrera","rol":"estudiante"}',
  now(), now(), '', '', '', ''
),
(
  'st000007-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'lucia.vindas@ucr.ac.cr',
  crypt('UCRAlumni2026!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Lucía","apellidos":"Vindas Alpízar","rol":"estudiante"}',
  now(), now(), '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

-- 3B: auth.identities (necesario para login por email)
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES
('aa000001-0000-0000-0000-000000000001','aa000001-0000-0000-0000-000000000001',
  format('{"sub":"%s","email":"%s"}','aa000001-0000-0000-0000-000000000001','admin.principal@fundacionucr.ac.cr')::jsonb,'email',now(),now(),now()),
('aa000002-0000-0000-0000-000000000002','aa000002-0000-0000-0000-000000000002',
  format('{"sub":"%s","email":"%s"}','aa000002-0000-0000-0000-000000000002','admin.sistemas@fundacionucr.ac.cr')::jsonb,'email',now(),now(),now()),
('ex000001-0000-0000-0000-000000000001','ex000001-0000-0000-0000-000000000001',
  format('{"sub":"%s","email":"%s"}','ex000001-0000-0000-0000-000000000001','andres.quesada@intel.com')::jsonb,'email',now(),now(),now()),
('ex000002-0000-0000-0000-000000000002','ex000002-0000-0000-0000-000000000002',
  format('{"sub":"%s","email":"%s"}','ex000002-0000-0000-0000-000000000002','valeria.mora@mckinsey.com')::jsonb,'email',now(),now(),now()),
('ex000003-0000-0000-0000-000000000003','ex000003-0000-0000-0000-000000000003',
  format('{"sub":"%s","email":"%s"}','ex000003-0000-0000-0000-000000000003','rodrigo.arias@bostonsci.com')::jsonb,'email',now(),now(),now()),
('ex000004-0000-0000-0000-000000000004','ex000004-0000-0000-0000-000000000004',
  format('{"sub":"%s","email":"%s"}','ex000004-0000-0000-0000-000000000004','carolina.jimenez@grupoice.com')::jsonb,'email',now(),now(),now()),
('ex000005-0000-0000-0000-000000000005','ex000005-0000-0000-0000-000000000005',
  format('{"sub":"%s","email":"%s"}','ex000005-0000-0000-0000-000000000005','pablo.saenz@amazon.com')::jsonb,'email',now(),now(),now()),
('ex000006-0000-0000-0000-000000000006','ex000006-0000-0000-0000-000000000006',
  format('{"sub":"%s","email":"%s"}','ex000006-0000-0000-0000-000000000006','natalia.brenes@bac.cr')::jsonb,'email',now(),now(),now()),
('st000001-0000-0000-0000-000000000001','st000001-0000-0000-0000-000000000001',
  format('{"sub":"%s","email":"%s"}','st000001-0000-0000-0000-000000000001','ana.guerrero@ucr.ac.cr')::jsonb,'email',now(),now(),now()),
('st000002-0000-0000-0000-000000000002','st000002-0000-0000-0000-000000000002',
  format('{"sub":"%s","email":"%s"}','st000002-0000-0000-0000-000000000002','marco.artavia@ucr.ac.cr')::jsonb,'email',now(),now(),now()),
('st000003-0000-0000-0000-000000000003','st000003-0000-0000-0000-000000000003',
  format('{"sub":"%s","email":"%s"}','st000003-0000-0000-0000-000000000003','sofia.campos@ucr.ac.cr')::jsonb,'email',now(),now(),now()),
('st000004-0000-0000-0000-000000000004','st000004-0000-0000-0000-000000000004',
  format('{"sub":"%s","email":"%s"}','st000004-0000-0000-0000-000000000004','daniel.rojas@ucr.ac.cr')::jsonb,'email',now(),now(),now()),
('st000005-0000-0000-0000-000000000005','st000005-0000-0000-0000-000000000005',
  format('{"sub":"%s","email":"%s"}','st000005-0000-0000-0000-000000000005','valentina.pizarro@ucr.ac.cr')::jsonb,'email',now(),now(),now()),
('st000006-0000-0000-0000-000000000006','st000006-0000-0000-0000-000000000006',
  format('{"sub":"%s","email":"%s"}','st000006-0000-0000-0000-000000000006','carlos.mejia@ucr.ac.cr')::jsonb,'email',now(),now(),now()),
('st000007-0000-0000-0000-000000000007','st000007-0000-0000-0000-000000000007',
  format('{"sub":"%s","email":"%s"}','st000007-0000-0000-0000-000000000007','lucia.vindas@ucr.ac.cr')::jsonb,'email',now(),now(),now())
ON CONFLICT (id) DO NOTHING;

-- 3C: public.users — INSERT directo (el trigger está deshabilitado)
-- Incluye todos los campos del esquema post-refactor
INSERT INTO public.users (
  id, email, nombre, apellidos,
  rol, email_verified, activo,
  foto_url,
  busca_mentoria, busca_empleo,
  ofrece_mentoria, visible_en_directorio,
  reportes_recibidos, created_at
) VALUES
-- Admins
(
  'aa000001-0000-0000-0000-000000000001',
  'admin.principal@fundacionucr.ac.cr',
  'Mariela', 'Vargas Mora',
  'admin', TRUE, TRUE, NULL,
  FALSE, FALSE, FALSE, FALSE, 0, now()
),
(
  'aa000002-0000-0000-0000-000000000002',
  'admin.sistemas@fundacionucr.ac.cr',
  'Diego', 'Solano Ureña',
  'admin', TRUE, TRUE, NULL,
  FALSE, FALSE, FALSE, FALSE, 0, now()
),
-- Exalumnos
(
  'ex000001-0000-0000-0000-000000000001',
  'andres.quesada@intel.com',
  'Andrés', 'Quesada Picado',
  'exalumno', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/andres_quesada.jpg',
  FALSE, FALSE, TRUE, TRUE, 0, now()
),
(
  'ex000002-0000-0000-0000-000000000002',
  'valeria.mora@mckinsey.com',
  'Valeria', 'Mora Cascante',
  'exalumno', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/valeria_mora.jpg',
  FALSE, FALSE, TRUE, TRUE, 0, now()
),
(
  'ex000003-0000-0000-0000-000000000003',
  'rodrigo.arias@bostonsci.com',
  'Rodrigo', 'Arias Fonseca',
  'exalumno', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/rodrigo_arias.jpg',
  FALSE, FALSE, TRUE, TRUE, 0, now()
),
(
  'ex000004-0000-0000-0000-000000000004',
  'carolina.jimenez@grupoice.com',
  'Carolina', 'Jiménez Brenes',
  'exalumno', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/carolina_jimenez.jpg',
  FALSE, FALSE, FALSE, TRUE, 0, now()
),
(
  'ex000005-0000-0000-0000-000000000005',
  'pablo.saenz@amazon.com',
  'Pablo', 'Sáenz Víquez',
  'exalumno', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/pablo_saenz.jpg',
  FALSE, FALSE, TRUE, TRUE, 0, now()
),
(
  'ex000006-0000-0000-0000-000000000006',
  'natalia.brenes@bac.cr',
  'Natalia', 'Brenes Rodríguez',
  'exalumno', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/natalia_brenes.jpg',
  FALSE, FALSE, TRUE, TRUE, 0, now()
),
-- Estudiantes (la mayoría con perfil completo, st000006/st000007 incompleto)
(
  'st000001-0000-0000-0000-000000000001',
  'ana.guerrero@ucr.ac.cr',
  'Ana', 'Guerrero Solís',
  'estudiante', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/ana_guerrero.jpg',
  TRUE, FALSE, FALSE, TRUE, 0, now()
),
(
  'st000002-0000-0000-0000-000000000002',
  'marco.artavia@ucr.ac.cr',
  'Marco', 'Artavia Badilla',
  'estudiante', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/marco_artavia.jpg',
  TRUE, TRUE, FALSE, TRUE, 0, now()
),
(
  'st000003-0000-0000-0000-000000000003',
  'sofia.campos@ucr.ac.cr',
  'Sofía', 'Campos Arroyo',
  'estudiante', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/sofia_campos.jpg',
  FALSE, TRUE, FALSE, TRUE, 0, now()
),
(
  'st000004-0000-0000-0000-000000000004',
  'daniel.rojas@ucr.ac.cr',
  'Daniel', 'Rojas Monge',
  'estudiante', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/daniel_rojas.jpg',
  TRUE, TRUE, FALSE, TRUE, 0, now()
),
(
  'st000005-0000-0000-0000-000000000005',
  'valentina.pizarro@ucr.ac.cr',
  'Valentina', 'Pizarro Matarrita',
  'estudiante', TRUE, TRUE,
  'https://storage.fundacionucr.ac.cr/avatars/valentina_pizarro.jpg',
  TRUE, FALSE, FALSE, TRUE, 0, now()
),
-- Perfil INCOMPLETO — campos mínimos solamente
(
  'st000006-0000-0000-0000-000000000006',
  'carlos.mejia@ucr.ac.cr',
  'Carlos', 'Mejía Herrera',
  'estudiante', FALSE, TRUE,
  NULL,
  FALSE, FALSE, FALSE, FALSE, 0, now()
),
(
  'st000007-0000-0000-0000-000000000007',
  'lucia.vindas@ucr.ac.cr',
  'Lucía', 'Vindas Alpízar',
  'estudiante', FALSE, TRUE,
  NULL,
  FALSE, FALSE, FALSE, FALSE, 0, now()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLOQUE 4: HISTORIAL ACADÉMICO (users_carreras)
-- Asocia usuarios a combinaciones carrera+campus
-- ============================================================
INSERT INTO public.users_carreras (user_id, carrera_campus_id, anio_ingreso, anio_graduacion)
SELECT
  u.user_id,
  cc.id AS carrera_campus_id,
  u.anio_ingreso,
  u.anio_graduacion
FROM (VALUES
  -- Exalumnos: (user_id, carrera_nombre, campus_nombre, ingreso, graduacion)
  ('ex000001-0000-0000-0000-000000000001','Ciencias de la Computación e Informática','Rodrigo Facio', 2005, 2010),
  ('ex000002-0000-0000-0000-000000000002','Economía',                                 'Rodrigo Facio', 2003, 2008),
  ('ex000003-0000-0000-0000-000000000003','Ingeniería Eléctrica',                     'Rodrigo Facio', 2004, 2009),
  ('ex000004-0000-0000-0000-000000000004','Ciencias de la Computación e Informática','Rodrigo Facio', 2008, 2013),
  ('ex000005-0000-0000-0000-000000000005','Ciencias de la Computación e Informática','Rodrigo Facio', 2010, 2015),
  ('ex000006-0000-0000-0000-000000000006','Dirección de Empresas',                   'Rodrigo Facio', 2009, 2014),
  -- Estudiantes activos (sin anio_graduacion)
  ('st000001-0000-0000-0000-000000000001','Ciencias de la Computación e Informática','Rodrigo Facio', 2022, NULL),
  ('st000002-0000-0000-0000-000000000002','Ciencias de la Computación e Informática','Rodrigo Facio', 2021, NULL),
  ('st000003-0000-0000-0000-000000000003','Dirección de Empresas',                   'Rodrigo Facio', 2023, NULL),
  ('st000004-0000-0000-0000-000000000004','Ingeniería Eléctrica',                    'Rodrigo Facio', 2020, NULL),
  ('st000005-0000-0000-0000-000000000005','Psicología',                              'Rodrigo Facio', 2022, NULL)
) AS u(user_id, carrera_nombre, campus_nombre, anio_ingreso, anio_graduacion)
JOIN public.carreras ca ON ca.nombre = u.carrera_nombre
JOIN public.campus   cm ON cm.nombre = u.campus_nombre
JOIN public.carrera_campus cc ON cc.carrera_id = ca.id AND cc.campus_id = cm.id
ON CONFLICT (user_id, carrera_campus_id) DO NOTHING;

-- Actualizar carrera_principal_id en users usando la primera entrada de users_carreras
UPDATE public.users u
SET carrera_principal_id = (
  SELECT uc.carrera_campus_id
  FROM public.users_carreras uc
  WHERE uc.user_id = u.id
  LIMIT 1
)
WHERE u.id IN (
  'ex000001-0000-0000-0000-000000000001',
  'ex000002-0000-0000-0000-000000000002',
  'ex000003-0000-0000-0000-000000000003',
  'ex000004-0000-0000-0000-000000000004',
  'ex000005-0000-0000-0000-000000000005',
  'ex000006-0000-0000-0000-000000000006',
  'st000001-0000-0000-0000-000000000001',
  'st000002-0000-0000-0000-000000000002',
  'st000003-0000-0000-0000-000000000003',
  'st000004-0000-0000-0000-000000000004',
  'st000005-0000-0000-0000-000000000005'
);

-- ============================================================
-- BLOQUE 5: EXPERIENCIA LABORAL (public.experiencia_laboral)
-- Tabla unificada post-refactor para todos los roles
-- ============================================================
INSERT INTO public.experiencia_laboral (
  id, user_id, empresa, puesto,
  fecha_inicio, fecha_fin, descripcion, actualmente_aqui
) VALUES
-- Andrés Quesada — Intel
(
  'ela00001-0000-0000-0000-000000000001',
  'ex000001-0000-0000-0000-000000000001',
  'Intel Costa Rica', 'Senior Software Engineer',
  '2010-08-01', NULL,
  'Desarrollo de firmware para procesadores de bajo consumo. Liderazgo de equipo de 8 ingenieros en proyecto RISC-V.',
  TRUE
),
(
  'ela00001-0000-0000-0000-000000000002',
  'ex000001-0000-0000-0000-000000000001',
  'Ministerio de Ciencia y Tecnología', 'Consultor TI',
  '2008-06-01', '2010-07-31',
  'Auditoría y modernización de infraestructura tecnológica gubernamental.',
  FALSE
),
-- Valeria Mora — McKinsey
(
  'ela00002-0000-0000-0000-000000000001',
  'ex000002-0000-0000-0000-000000000002',
  'McKinsey & Company', 'Associate – Financial Services',
  '2010-02-01', NULL,
  'Proyectos de transformación digital para banca centroamericana. Especialidad en optimización de cartera de crédito.',
  TRUE
),
(
  'ela00002-0000-0000-0000-000000000002',
  'ex000002-0000-0000-0000-000000000002',
  'Banco Nacional de Costa Rica', 'Analista Económico',
  '2008-01-01', '2010-01-31',
  'Modelado macroeconómico y análisis de riesgo soberano para el portafolio de deuda pública.',
  FALSE
),
-- Rodrigo Arias — Boston Scientific
(
  'ela00003-0000-0000-0000-000000000001',
  'ex000003-0000-0000-0000-000000000003',
  'Boston Scientific Costa Rica', 'Manufacturing Engineer III',
  '2012-03-01', NULL,
  'Diseño y validación de sistemas de control para dispositivos de estimulación cardíaca. Cumplimiento ISO 13485.',
  TRUE
),
-- Carolina Jiménez — ICE
(
  'ela00004-0000-0000-0000-000000000001',
  'ex000004-0000-0000-0000-000000000004',
  'Instituto Costarricense de Electricidad (ICE)', 'Arquitecta de Soluciones Cloud',
  '2014-01-01', NULL,
  'Migración de sistemas críticos de telecomunicaciones a arquitectura multi-cloud (AWS + Azure).',
  TRUE
),
-- Pablo Sáenz — Amazon
(
  'ela00005-0000-0000-0000-000000000001',
  'ex000005-0000-0000-0000-000000000005',
  'Amazon Web Services', 'Solutions Architect',
  '2016-07-01', NULL,
  'Arquitectura de soluciones para clientes enterprise de LATAM. Especialización en serverless y machine learning.',
  TRUE
),
-- Natalia Brenes — BAC
(
  'ela00006-0000-0000-0000-000000000001',
  'ex000006-0000-0000-0000-000000000006',
  'BAC Credomatic', 'Gerente de Estrategia Corporativa',
  '2015-04-01', NULL,
  'Planificación estratégica y transformación digital del portafolio de productos financieros en 6 países de Centroamérica.',
  TRUE
),
-- Experiencias de estudiantes (prácticas / asistentías)
(
  'ela00007-0000-0000-0000-000000000001',
  'st000001-0000-0000-0000-000000000001',
  'CITIC UCR', 'Asistente de Investigación',
  '2023-02-01', NULL,
  'Colaboración en proyecto de IA aplicada a diagnóstico médico con imágenes.',
  TRUE
),
(
  'ela00007-0000-0000-0000-000000000002',
  'st000002-0000-0000-0000-000000000002',
  'Ministerio de Hacienda', 'Practicante — Área de TI',
  '2023-06-01', '2023-11-30',
  'Soporte al módulo de facturación electrónica del SIGAF.',
  FALSE
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- BLOQUE 6: CURRICULUMS (public.curriculums)
-- Para 5 estudiantes y 2 exalumnos con perfil completo
-- IDs: cv000001 → cv000007
-- ============================================================
INSERT INTO public.curriculums (
  id, user_id, sobre_mi, url_linkedin, url_portfolio,
  habilidades_tecnicas, habilidades_blandas,
  cursos_relevantes, proyecto_graduacion_resumen, idiomas
) VALUES
-- Ana Guerrero (st001) — TFG en IA para Medicina
(
  'cv000001-0000-0000-0000-000000000001',
  'st000001-0000-0000-0000-000000000001',
  'Estudiante de Ciencias de la Computación apasionada por la intersección entre IA y salud pública. Busco mentoría para completar mi TFG en detección temprana de retinopatía diabética mediante visión por computadora.',
  'https://linkedin.com/in/ana-guerrero-cr',
  'https://github.com/anaguerrero-cr',
  '{"Python": "Avanzado", "TensorFlow": "Intermedio", "PostgreSQL": "Intermedio", "Docker": "Básico", "OpenCV": "Intermedio"}'::jsonb,
  ARRAY['Comunicación efectiva', 'Trabajo en equipo', 'Pensamiento crítico', 'Gestión del tiempo'],
  ARRAY['Inteligencia Artificial', 'Visión por Computadora', 'Bases de Datos Avanzadas', 'Proyecto de Graduación I'],
  'Sistema de detección automatizada de retinopatía diabética utilizando redes neuronales convolucionales (CNN) sobre el dataset MESSIDOR-2. Precisión del 91% en clasificación de severidad.',
  '[{"idioma": "Español", "nivel": "Nativo"}, {"idioma": "Inglés", "nivel": "B2"}, {"idioma": "Portugués", "nivel": "A2"}]'::jsonb
),
-- Marco Artavia (st002) — TFG en ciberseguridad
(
  'cv000002-0000-0000-0000-000000000002',
  'st000002-0000-0000-0000-000000000002',
  'Desarrollador backend con enfoque en seguridad de aplicaciones. Mi TFG propone un framework de detección de intrusiones para infraestructuras del gobierno de Costa Rica usando análisis de tráfico con ML.',
  'https://linkedin.com/in/marco-artavia-ucr',
  'https://gitlab.com/marco.artavia',
  '{"Java": "Avanzado", "Spring Boot": "Avanzado", "Kubernetes": "Intermedio", "Wireshark": "Intermedio", "Python": "Intermedio", "Snort": "Básico"}'::jsonb,
  ARRAY['Liderazgo', 'Resolución de problemas', 'Adaptabilidad', 'Comunicación técnica'],
  ARRAY['Seguridad Informática', 'Redes de Computadoras', 'Sistemas Operativos', 'Arquitecturas de Software'],
  'Framework de detección de intrusiones (IDS) basado en análisis de flujo de red con Random Forest para infraestructuras críticas gubernamentales. Tasa de falsos positivos inferior al 3%.',
  '[{"idioma": "Español", "nivel": "Nativo"}, {"idioma": "Inglés", "nivel": "C1"}]'::jsonb
),
-- Sofía Campos (st003) — TFG en administración (perfil completo)
(
  'cv000003-0000-0000-0000-000000000003',
  'st000003-0000-0000-0000-000000000003',
  'Estudiante de Dirección de Empresas con especialización en finanzas corporativas y sostenibilidad. TFG orientado al análisis del impacto de los bonos verdes en el mercado de capitales costarricense.',
  'https://linkedin.com/in/sofia-campos-cr',
  NULL,
  '{"Excel Avanzado": "Avanzado", "Power BI": "Intermedio", "R": "Básico", "Stata": "Básico"}'::jsonb,
  ARRAY['Liderazgo', 'Negociación', 'Pensamiento estratégico', 'Presentación ejecutiva'],
  ARRAY['Finanzas Corporativas', 'Mercados de Capitales', 'Análisis Financiero', 'Gestión del Riesgo'],
  'Análisis del impacto de las emisiones de bonos verdes en el costo de capital de empresas costarricenses listadas en la BCCR. Muestra de 15 empresas, período 2018-2025.',
  '[{"idioma": "Español", "nivel": "Nativo"}, {"idioma": "Inglés", "nivel": "B1"}, {"idioma": "Francés", "nivel": "A1"}]'::jsonb
),
-- Daniel Rojas (st004) — TFG en ingeniería eléctrica
(
  'cv000004-0000-0000-0000-000000000004',
  'st000004-0000-0000-0000-000000000004',
  'Estudiante de Ingeniería Eléctrica con foco en energías renovables. Mi TFG diseña un sistema de microgrid solar inteligente para comunidades rurales de Costa Rica.',
  'https://linkedin.com/in/daniel-rojas-ie',
  'https://github.com/drojas-ieee',
  '{"MATLAB/Simulink": "Avanzado", "AutoCAD Electrical": "Intermedio", "Python": "Básico", "ETAP": "Básico"}'::jsonb,
  ARRAY['Trabajo en equipo', 'Proactividad', 'Gestión de proyectos', 'Pensamiento sistémico'],
  ARRAY['Sistemas de Potencia', 'Electrónica de Potencia', 'Energías Renovables', 'Control Automático'],
  'Diseño y simulación de una microgrid solar con almacenamiento en baterías de litio para la comunidad de Cureña, Sarapiquí. Reducción proyectada del 70% en costo energético versus red nacional.',
  '[{"idioma": "Español", "nivel": "Nativo"}, {"idioma": "Inglés", "nivel": "B2"}]'::jsonb
),
-- Valentina Pizarro (st005) — Tesis en psicología (perfil completo)
(
  'cv000005-0000-0000-0000-000000000005',
  'st000005-0000-0000-0000-000000000005',
  'Psicóloga en formación con interés en salud mental laboral y bienestar organizacional. Tesis sobre burnout en profesionales de salud del sistema CCSS post-pandemia.',
  'https://linkedin.com/in/valentina-pizarro-psi',
  NULL,
  '{"SPSS": "Avanzado", "Atlas.ti": "Intermedio", "Excel": "Avanzado", "NVivo": "Básico"}'::jsonb,
  ARRAY['Empatía', 'Escucha activa', 'Análisis cualitativo', 'Redacción académica'],
  ARRAY['Psicología Organizacional', 'Investigación Cualitativa', 'Estadística Aplicada', 'Psicología de la Salud'],
  'Estudio mixto sobre prevalencia e impacto del síndrome de burnout en 120 profesionales de enfermería del Hospital San Juan de Dios. Incluye propuesta de programa de bienestar laboral basado en mindfulness.',
  '[{"idioma": "Español", "nivel": "Nativo"}, {"idioma": "Inglés", "nivel": "B1"}]'::jsonb
),
-- Andrés Quesada — exalumno con curriculum
(
  'cv000006-0000-0000-0000-000000000006',
  'ex000001-0000-0000-0000-000000000001',
  'Senior Software Engineer con 15 años en la industria de semiconductores. Egresado de la UCR con maestría en Ciencias de la Computación de la Universidad de Stanford. Apasionado por el desarrollo de talento tecnológico costarricense.',
  'https://linkedin.com/in/andres-quesada-intel',
  'https://andresquesada.dev',
  '{"C/C++": "Experto", "Python": "Avanzado", "RISC-V": "Avanzado", "Verilog": "Intermedio", "Git": "Experto", "Docker": "Avanzado"}'::jsonb,
  ARRAY['Mentoría técnica', 'Comunicación ejecutiva', 'Gestión de equipos distribuidos', 'Pensamiento sistémico'],
  ARRAY['Arquitectura de Computadores Avanzada', 'Compiladores', 'Sistemas Embebidos'],
  NULL,
  '[{"idioma": "Español", "nivel": "Nativo"}, {"idioma": "Inglés", "nivel": "C2"}, {"idioma": "Alemán", "nivel": "A2"}]'::jsonb
),
-- Natalia Brenes — exalumna con curriculum
(
  'cv000007-0000-0000-0000-000000000007',
  'ex000006-0000-0000-0000-000000000006',
  'Gerente de estrategia con experiencia en transformación digital bancaria en Centroamérica. MBA de INCAE Business School. Comprometida con el ecosistema emprendedor de Costa Rica.',
  'https://linkedin.com/in/natalia-brenes-bac',
  NULL,
  '{"Tableau": "Avanzado", "Power BI": "Avanzado", "Salesforce": "Intermedio", "SQL": "Intermedio"}'::jsonb,
  ARRAY['Pensamiento estratégico', 'Liderazgo transformacional', 'Negociación', 'Gestión del cambio'],
  ARRAY['Estrategia Empresarial', 'Finanzas Internacionales', 'Marketing Digital'],
  NULL,
  '[{"idioma": "Español", "nivel": "Nativo"}, {"idioma": "Inglés", "nivel": "C1"}, {"idioma": "Italiano", "nivel": "A1"}]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE
  SET sobre_mi = EXCLUDED.sobre_mi;

-- ============================================================
-- BLOQUE 7: CURRICULUM_CERTIFICACIONES
-- Para los 5 estudiantes con curriculums completos
-- ============================================================
INSERT INTO public.curriculum_certificaciones (
  id, curriculum_id, nombre, institucion, fecha, url_verificacion, orden
) VALUES
-- Ana Guerrero (cv001)
(
  'cert0001-0000-0000-0000-000000000001',
  'cv000001-0000-0000-0000-000000000001',
  'TensorFlow Developer Certificate',
  'Google',
  '2024-03-15',
  'https://www.credential.net/abc123',
  1
),
(
  'cert0001-0000-0000-0000-000000000002',
  'cv000001-0000-0000-0000-000000000001',
  'Python for Data Science and AI',
  'IBM / Coursera',
  '2023-08-20',
  'https://coursera.org/verify/def456',
  2
),
-- Marco Artavia (cv002)
(
  'cert0002-0000-0000-0000-000000000001',
  'cv000002-0000-0000-0000-000000000002',
  'Certified Ethical Hacker (CEH)',
  'EC-Council',
  '2024-01-10',
  'https://aspen.eccouncil.org/verify/ghi789',
  1
),
(
  'cert0002-0000-0000-0000-000000000002',
  'cv000002-0000-0000-0000-000000000002',
  'AWS Certified Cloud Practitioner',
  'Amazon Web Services',
  '2023-11-05',
  'https://aws.amazon.com/verification/jkl012',
  2
),
-- Sofía Campos (cv003)
(
  'cert0003-0000-0000-0000-000000000001',
  'cv000003-0000-0000-0000-000000000003',
  'Financial Modeling & Valuation Analyst (FMVA)',
  'Corporate Finance Institute',
  '2024-05-22',
  'https://credentials.corporatefinanceinstitute.com/mno345',
  1
),
-- Daniel Rojas (cv004)
(
  'cert0004-0000-0000-0000-000000000001',
  'cv000004-0000-0000-0000-000000000004',
  'Certified Renewable Energy Professional (REP)',
  'Association of Energy Engineers',
  '2023-09-18',
  'https://www.aeecenter.org/verify/pqr678',
  1
),
-- Valentina Pizarro (cv005)
(
  'cert0005-0000-0000-0000-000000000001',
  'cv000005-0000-0000-0000-000000000005',
  'Certified Mindfulness Instructor',
  'International Mindfulness Teachers Association',
  '2024-02-14',
  'https://imta.org/verify/stu901',
  1
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- BLOQUE 8: POSICIONES (RF-10)
-- 4 posiciones publicadas por exalumnos
-- ============================================================
INSERT INTO public.posiciones (
  id, exalumno_id, tipo, titulo, modalidad, jornada,
  lugar, empresa, sector, habilidades_requeridas,
  descripcion_general, responsabilidades, contexto_equipo,
  fecha_limite, estado,
  carrera_requerida, tipo_posicion
) VALUES
-- Posición 1: Intel — Andrés Quesada — Pasantía
(
  'po000001-0000-0000-0000-000000000001',
  'ex000001-0000-0000-0000-000000000001',
  'pasantia',
  'Pasantía en Arquitectura de Firmware RISC-V',
  'hibrido',
  'tiempo_completo',
  'Belén, Heredia, Costa Rica',
  'Intel Costa Rica',
  ARRAY['Tecnología, Software y TI', 'Manufactura y Producción'],
  ARRAY['C/C++', 'Arquitectura de Computadoras', 'Python', 'Git', 'Linux'],
  'El equipo de Firmware Architecture de Intel CR busca un pasante universitario brillante para colaborar en el diseño de drivers de bajo nivel para la próxima generación de procesadores Intel basados en RISC-V. Ambiente de trabajo altamente técnico e internacional.',
  ARRAY['Desarrollar y mantener módulos de firmware en C', 'Ejecutar pruebas de integración en plataformas FPGA', 'Documentar protocolos internos en inglés técnico', 'Participar en revisiones de código con el equipo global'],
  'Equipo de 12 ingenieros distribuidos entre Costa Rica y Oregon, USA. Ambiente ágil con sprints de 2 semanas.',
  '2026-07-31',
  'activa',
  'Ciencias de la Computación e Informática',
  'pasantia'
),
-- Posición 2: McKinsey — Valeria Mora — Empleo
(
  'po000002-0000-0000-0000-000000000002',
  'ex000002-0000-0000-0000-000000000002',
  'empleo',
  'Analista Junior — Práctica de Financial Services',
  'presencial',
  'tiempo_completo',
  'San José, Costa Rica',
  'McKinsey & Company',
  ARRAY['Finanzas, Banca y Seguros', 'Consultoría y Servicios Profesionales'],
  ARRAY['Excel Avanzado', 'PowerPoint', 'Modelado Financiero', 'Inglés C1', 'Pensamiento Analítico'],
  'McKinsey CR busca analistas recién egresados de carreras cuantitativas para integrarse a proyectos de transformación estratégica con clientes del sector financiero centroamericano. Carrera de crecimiento acelerado.',
  ARRAY['Análisis de datos financieros para proyectos de clientes', 'Preparación de presentaciones ejecutivas de alto impacto', 'Investigación de mercado y benchmarking sectorial', 'Colaboración en talleres de definición de estrategia'],
  'Oficina de San José con viajes frecuentes a Guatemala, Panamá y Honduras. Equipo junior de 6 analistas con mentoría directa de socios.',
  '2026-08-15',
  'activa',
  'Economía',
  'empleo'
),
-- Posición 3: Boston Scientific — Rodrigo Arias — Pasantía
(
  'po000003-0000-0000-0000-000000000003',
  'ex000003-0000-0000-0000-000000000003',
  'pasantia',
  'Pasantía en Ingeniería de Validación — Dispositivos Cardíacos',
  'presencial',
  'medio_tiempo',
  'Coyol, Alajuela, Costa Rica',
  'Boston Scientific Costa Rica',
  ARRAY['Dispositivos Médicos y MedTech', 'Manufactura y Producción'],
  ARRAY['MATLAB', 'Norma ISO 13485', 'Análisis de riesgo', 'AutoCAD', 'Inglés técnico'],
  'El equipo de Quality & Validation de Boston Scientific busca un pasante de Ingeniería Eléctrica para apoyar en protocolos de validación de equipos de estimulación cardíaca bajo normativa FDA y CE Marking.',
  ARRAY['Ejecutar protocolos de prueba de validación de equipos médicos', 'Analizar resultados con herramientas estadísticas (Minitab/MATLAB)', 'Redactar reportes técnicos según norma 21 CFR 820', 'Dar soporte al equipo de ingeniería en planta productiva'],
  'Equipo de manufactura con 40 ingenieros. Ambiente regulado GMP con capacitación inicial intensiva de 2 semanas.',
  '2026-07-15',
  'activa',
  'Ingeniería Eléctrica',
  'pasantia'
),
-- Posición 4: Amazon — Pablo Sáenz — Empleo
(
  'po000004-0000-0000-0000-000000000004',
  'ex000005-0000-0000-0000-000000000005',
  'empleo',
  'Cloud Solutions Architect — LATAM',
  'remoto',
  'tiempo_completo',
  'Remoto (Costa Rica / LATAM)',
  'Amazon Web Services',
  ARRAY['Tecnología, Software y TI', 'Consultoría y Servicios Profesionales'],
  ARRAY['AWS Certified', 'Arquitectura Cloud', 'Python', 'Terraform', 'Inglés C1', 'Kubernetes'],
  'AWS LATAM busca egresados de Ciencias de la Computación o Ingeniería Eléctrica con experiencia en cloud para apoyar a clientes enterprise en su migración y modernización hacia AWS. Posición 100% remota con equipamiento incluido.',
  ARRAY['Diseñar arquitecturas cloud seguras y escalables para clientes enterprise', 'Presentar propuestas técnicas y económicas a CTO/CIOs', 'Colaborar con el equipo de ventas en respuesta a RFPs', 'Desarrollar proof-of-concepts en las últimas tecnologías de AWS'],
  'Equipo virtual de 15 architects en LATAM. Cultura de alto desempeño con revisión trimestral de objetivos (OKRs).',
  '2026-09-01',
  'activa',
  'Ciencias de la Computación e Informática',
  'empleo'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLOQUE 9: CURRICULUM_VERSIONES (RF-12)
-- Al menos 2 versiones para 3 estudiantes
-- ============================================================
INSERT INTO public.curriculum_versiones (
  id, curriculum_id, posicion_id,
  nombre_version, contenido_adaptado, sugerencias_ia
) VALUES
-- Ana Guerrero → Posición Intel (Pasantía RISC-V)
(
  'ver00001-0000-0000-0000-000000000001',
  'cv000001-0000-0000-0000-000000000001',
  'po000001-0000-0000-0000-000000000001',
  'CV Adaptado — Intel Pasantía RISC-V',
  '{
    "objetivo": "Pasante de firmware con sólida base en arquitectura de computadoras y experiencia en Python/C para proyectos de visión por computadora aplicada.",
    "habilidades_destacadas": ["Python", "C/C++", "Docker", "OpenCV", "PostgreSQL"],
    "proyectos_seleccionados": ["Sistema de detección de retinopatía con CNN — TFG UCR"],
    "cursos_clave": ["Inteligencia Artificial", "Arquitectura de Computadoras", "Sistemas Operativos"]
  }'::jsonb,
  '[
    {"sugerencia": "Enfatizar experiencia con Docker dado el entorno de CI/CD de Intel.", "prioridad": "alta"},
    {"sugerencia": "Agregar proyecto personal de microcontroladores si existe.", "prioridad": "media"},
    {"sugerencia": "Traducir el resumen del TFG al inglés técnico.", "prioridad": "alta"}
  ]'::jsonb
),
-- Ana Guerrero → Posición Amazon (Cloud Architect)
(
  'ver00001-0000-0000-0000-000000000002',
  'cv000001-0000-0000-0000-000000000001',
  'po000004-0000-0000-0000-000000000004',
  'CV Adaptado — AWS Solutions Architect',
  '{
    "objetivo": "Desarrolladora con enfoque en MLOps y despliegue de modelos de ML en infraestructura cloud para aplicaciones de impacto social.",
    "habilidades_destacadas": ["Python", "TensorFlow", "Docker", "PostgreSQL"],
    "proyectos_seleccionados": ["Sistema de detección de retinopatía (TFG UCR) — desplegado en entorno containerizado"],
    "cursos_clave": ["Inteligencia Artificial", "Bases de Datos Avanzadas", "Redes de Computadoras"]
  }'::jsonb,
  '[
    {"sugerencia": "Obtener AWS Cloud Practitioner antes de la fecha límite para fortalecer la candidatura.", "prioridad": "alta"},
    {"sugerencia": "Mencionar uso de contenedores Docker en el TFG de forma más prominente.", "prioridad": "alta"},
    {"sugerencia": "Incluir métricas cuantitativas del modelo: precisión, F1-score, dataset size.", "prioridad": "media"}
  ]'::jsonb
),
-- Marco Artavia → Posición Intel (Pasantía RISC-V)
(
  'ver00002-0000-0000-0000-000000000001',
  'cv000002-0000-0000-0000-000000000002',
  'po000001-0000-0000-0000-000000000001',
  'CV Adaptado — Intel Firmware Internship',
  '{
    "objetivo": "Desarrollador backend con experiencia en sistemas seguros de alto rendimiento, buscando aplicar conocimientos en seguridad a nivel firmware en entorno Intel.",
    "habilidades_destacadas": ["Java", "Python", "Kubernetes", "Seguridad de sistemas", "Linux"],
    "proyectos_seleccionados": ["Framework IDS para infraestructuras críticas (TFG UCR)"],
    "cursos_clave": ["Seguridad Informática", "Sistemas Operativos", "Redes de Computadoras"]
  }'::jsonb,
  '[
    {"sugerencia": "Resaltar experiencia con Linux kernel modules que conecta con firmware development.", "prioridad": "alta"},
    {"sugerencia": "El TFG de IDS tiene componentes de análisis de tráfico de red relevantes para testing.", "prioridad": "media"}
  ]'::jsonb
),
-- Marco Artavia → Posición Amazon (Cloud Architect)
(
  'ver00002-0000-0000-0000-000000000002',
  'cv000002-0000-0000-0000-000000000002',
  'po000004-0000-0000-0000-000000000004',
  'CV Adaptado — AWS Cloud Security Engineer',
  '{
    "objetivo": "Desarrollador con especialización en ciberseguridad y arquitecturas distribuidas, buscando aplicar CEH y experiencia en IDS a la protección de workloads cloud enterprise.",
    "habilidades_destacadas": ["Java", "Spring Boot", "Kubernetes", "AWS (Practitioner)", "Python", "Wireshark"],
    "proyectos_seleccionados": ["Framework IDS con ML para infraestructuras gubernamentales (TFG UCR)"],
    "cursos_clave": ["Seguridad Informática", "Arquitecturas de Software", "Redes de Computadoras"]
  }'::jsonb,
  '[
    {"sugerencia": "AWS tiene práctica de Security especializada — apuntar el CV hacia Cloud Security.", "prioridad": "alta"},
    {"sugerencia": "El CEH es muy valorado por clientes enterprise que requieren compliance SOC2/PCI-DSS.", "prioridad": "alta"},
    {"sugerencia": "Incluir experiencia con Docker Compose en el entorno de laboratorio del TFG.", "prioridad": "baja"}
  ]'::jsonb
),
-- Daniel Rojas → Posición Boston Scientific
(
  'ver00004-0000-0000-0000-000000000001',
  'cv000004-0000-0000-0000-000000000004',
  'po000003-0000-0000-0000-000000000003',
  'CV Adaptado — Boston Scientific Validación',
  '{
    "objetivo": "Ingeniero Eléctrico con formación en sistemas de potencia y simulación MATLAB, interesado en contribuir a la validación de dispositivos médicos de alta precisión bajo normas FDA/ISO.",
    "habilidades_destacadas": ["MATLAB/Simulink", "AutoCAD Electrical", "Python", "Análisis estadístico"],
    "proyectos_seleccionados": ["Microgrid solar inteligente para comunidades rurales — TFG UCR"],
    "cursos_clave": ["Sistemas de Potencia", "Electrónica de Potencia", "Control Automático"]
  }'::jsonb,
  '[
    {"sugerencia": "Obtener curso introductorio ISO 13485 online refuerza considerablemente el perfil.", "prioridad": "alta"},
    {"sugerencia": "Mencionar experiencia con mediciones eléctricas de precisión y calibración de instrumentos.", "prioridad": "media"},
    {"sugerencia": "Traducir el resumen del TFG al inglés técnico con énfasis en validación de componentes.", "prioridad": "alta"}
  ]'::jsonb
)
ON CONFLICT (curriculum_id, posicion_id) DO NOTHING;

-- ============================================================
-- BLOQUE 10: APLICACIONES (RF-11) — tabla public.applications
-- 4 aplicaciones con estados variados
-- ============================================================
INSERT INTO public.applications (
  id, position_id, student_id,
  cv_url, cover_message, status
) VALUES
-- Ana Guerrero aplica a Intel (pasantía) — estado: en_revision
(
  'app00001-0000-0000-0000-000000000001',
  'po000001-0000-0000-0000-000000000001',
  'st000001-0000-0000-0000-000000000001',
  'https://storage.fundacionucr.ac.cr/resumes/st000001/cv_intel_v1.pdf',
  'Estimado equipo de Intel: Me apasiona la arquitectura de bajo nivel y tengo experiencia en Python y C++ desde mi TFG en IA. Considero que puedo contribuir significativamente al equipo de firmware desde el primer día.',
  'en_revision'
),
-- Marco Artavia aplica a Intel — estado: seleccionado
(
  'app00002-0000-0000-0000-000000000002',
  'po000001-0000-0000-0000-000000000001',
  'st000002-0000-0000-0000-000000000002',
  'https://storage.fundacionucr.ac.cr/resumes/st000002/cv_intel_security.pdf',
  'Buen día: Mi experiencia en seguridad de sistemas y mi TFG sobre detección de intrusiones me da una perspectiva única sobre la seguridad del firmware. Adjunto mi CEH como evidencia de mi compromiso.',
  'seleccionado'
),
-- Daniel Rojas aplica a Boston Scientific — estado: enviada
(
  'app00003-0000-0000-0000-000000000003',
  'po000003-0000-0000-0000-000000000003',
  'st000004-0000-0000-0000-000000000004',
  'https://storage.fundacionucr.ac.cr/resumes/st000004/cv_bsci_validation.pdf',
  'Estimado Boston Scientific: Mi TFG en diseño de microgrid solar me ha brindado experiencia sólida en validación de sistemas eléctricos de alta precisión y simulación con MATLAB, competencias directamente alineadas con este puesto.',
  'enviada'
),
-- Sofía Campos aplica a McKinsey — estado: descartado
(
  'app00004-0000-0000-0000-000000000004',
  'po000002-0000-0000-0000-000000000002',
  'st000003-0000-0000-0000-000000000003',
  'https://storage.fundacionucr.ac.cr/resumes/st000003/cv_mckinsey_fs.pdf',
  'Estimada Valeria: Mi TFG sobre bonos verdes en el mercado costarricense demuestra mi capacidad analítica y mi conocimiento del sector financiero local. Me emociona la posibilidad de contribuir a McKinsey LATAM.',
  'descartado'
)
ON CONFLICT (position_id, student_id) DO NOTHING;

-- ============================================================
-- BLOQUE 11: MATCHES (public.matches)
-- 5 matches con estados variados para probar el dashboard
-- ============================================================
INSERT INTO public.matches (
  id, estudiante_id, exalumno_id,
  score_match, estado, tipo_apoyo, iniciado_por, resultado, notas_admin
) VALUES
-- Match 1: Ana ↔ Andrés (Intel) — Mentoría técnica — ACEPTADO
(
  'ma000001-0000-0000-0000-000000000001',
  'st000001-0000-0000-0000-000000000001',
  'ex000001-0000-0000-0000-000000000001',
  92,
  'activo',
  'mentoria',
  'sistema',
  'en_progreso',
  'Match de alta compatibilidad: misma carrera + áreas IA/Tecnología coincidentes. Ana está avanzando bien en la mentoría.'
),
-- Match 2: Marco ↔ Carolina (ICE) — Empleo — CONTACTADO
(
  'ma000002-0000-0000-0000-000000000002',
  'st000002-0000-0000-0000-000000000002',
  'ex000004-0000-0000-0000-000000000004',
  78,
  'contactado',
  'empleo',
  'sistema',
  NULL,
  'Match por carrera común y sector TI. Pendiente de respuesta del estudiante al primer contacto.'
),
-- Match 3: Sofía ↔ Natalia (BAC) — Mentoría empresarial — SUGERIDO (pendiente)
(
  'ma000003-0000-0000-0000-000000000003',
  'st000003-0000-0000-0000-000000000003',
  'ex000006-0000-0000-0000-000000000006',
  85,
  'sugerido',
  'mentoria',
  'sistema',
  NULL,
  'Match por carrera afín (Dirección Empresas) y áreas Economía/Emprendimiento compartidas.'
),
-- Match 4: Daniel ↔ Rodrigo (Boston Sci) — Pasantía — ACTIVO
(
  'ma000004-0000-0000-0000-000000000004',
  'st000004-0000-0000-0000-000000000004',
  'ex000003-0000-0000-0000-000000000003',
  88,
  'activo',
  'pasantia',
  'exalumno',
  'en_progreso',
  'Rodrigo contactó directamente a Daniel al ver su perfil. Ambos con carrera en IE y área de Ingeniería.'
),
-- Match 5: Valentina ↔ Valeria (McKinsey) — Mentoría — CERRADO (exitoso)
(
  'ma000005-0000-0000-0000-000000000005',
  'st000005-0000-0000-0000-000000000005',
  'ex000002-0000-0000-0000-000000000002',
  65,
  'cerrado',
  'mentoria',
  'estudiante',
  'exitoso',
  'Valentina buscó mentoría para su tesis. Valeria la orientó sobre metodología de investigación económica. Ciclo completado exitosamente.'
)
ON CONFLICT (estudiante_id, exalumno_id) DO NOTHING;

-- ============================================================
-- BLOQUE 12: DONACIONES (RF-07) — tabla public.donations
-- 4 donaciones con estados variados
-- Las confirmadas apuntan al admin aa000001 como confirmado_por
-- ============================================================
-- Nota: La tabla donations (migración 09) usa user_id (donante) y
-- proyecto_id (beneficiario). No tiene confirmado_por.
-- Usamos la tabla donaciones (migración 01) que sí lo tiene.
-- Verificamos cuál tabla existe en el schema final:
-- La migración 01 crea `donaciones`, la 09 crea `donations`.
-- Ambas pueden coexistir. Insertamos en AMBAS para cobertura total.

-- 12A: Tabla `donaciones` (migración 01, con confirmado_por para trigger de auditoría)
INSERT INTO public.donaciones (
  id, exalumno_id, proyecto_estudiante_id,
  monto, moneda, metodo_pago,
  fecha_transferencia, numero_referencia, comprobante_url,
  mensaje_estudiante, estado, confirmado_por
) VALUES
-- Donación 1: Andrés → Ana — CONFIRMADA (admin Mariela la confirma)
(
  'don00001-0000-0000-0000-000000000001',
  'ex000001-0000-0000-0000-000000000001',
  'st000001-0000-0000-0000-000000000001',
  150000.00, 'CRC', 'sinpe',
  '2026-06-02',
  'SINPE-20260602-7391',
  'https://storage.fundacionucr.ac.cr/receipts/ex000001/sinpe_20260602.jpg',
  'Ana, tu investigación en IA aplicada a retina me parece fascinante. Aquí va mi aporte para los servidores GPU que necesitas. ¡Adelante!',
  'confirmada',
  'aa000001-0000-0000-0000-000000000001'
),
-- Donación 2: Natalia → Marco — CONFIRMADA (admin Diego la confirma)
(
  'don00002-0000-0000-0000-000000000002',
  'ex000006-0000-0000-0000-000000000006',
  'st000002-0000-0000-0000-000000000002',
  250.00, 'USD', 'transferencia_bancaria',
  '2026-06-04',
  'BCR-TRF-20260604-BAC-48291',
  'https://storage.fundacionucr.ac.cr/receipts/ex000006/bcr_transfer_20260604.pdf',
  'Marco, la ciberseguridad es crítica para Costa Rica. Tu TFG puede marcar la diferencia. Este aporte es para licencias de software.',
  'confirmada',
  'aa000002-0000-0000-0000-000000000002'
),
-- Donación 3: Pablo → Daniel — PENDIENTE (aún sin confirmar)
(
  'don00003-0000-0000-0000-000000000003',
  'ex000005-0000-0000-0000-000000000005',
  'st000004-0000-0000-0000-000000000004',
  75000.00, 'CRC', 'sinpe',
  '2026-06-06',
  'SINPE-20260606-3142',
  'https://storage.fundacionucr.ac.cr/receipts/ex000005/sinpe_20260606.jpg',
  'Daniel, las energías renovables son el futuro de CR. Ánimo con el TFG de la microgrid en Sarapiquí.',
  'pendiente',
  NULL
),
-- Donación 4: Valeria → Valentina — PENDIENTE
(
  'don00004-0000-0000-0000-000000000004',
  'ex000002-0000-0000-0000-000000000002',
  'st000005-0000-0000-0000-000000000005',
  180.00, 'USD', 'transferencia_bancaria',
  '2026-06-07',
  'BN-TRF-20260607-MCKN-91047',
  'https://storage.fundacionucr.ac.cr/receipts/ex000002/bn_transfer_20260607.pdf',
  'Valentina, la salud mental en enfermería es un tema urgente. Tu tesis llega en el momento justo. Este aporte es para el Atlas.ti y las sesiones de campo.',
  'pendiente',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 12B: Tabla `donations` (migración 09 — estructura inglesa)
-- Insertamos las mismas donaciones en la tabla donations para
-- asegurar coherencia entre ambos sistemas
INSERT INTO public.donations (
  id, user_id, proyecto_id,
  fondo_general, monto, moneda, metodo_pago,
  fecha_transferencia, numero_referencia, comprobante_url,
  mensaje_estudiante, estado
) VALUES
(
  'don00001-0000-0000-0000-000000000001',
  'ex000001-0000-0000-0000-000000000001',
  'st000001-0000-0000-0000-000000000001',
  FALSE, 150000.00, 'CRC', 'SINPE',
  '2026-06-02',
  'SINPE-20260602-7391',
  'https://storage.fundacionucr.ac.cr/receipts/ex000001/sinpe_20260602.jpg',
  'Ana, tu investigación en IA aplicada a retina me parece fascinante. ¡Adelante!',
  'confirmada'
),
(
  'don00002-0000-0000-0000-000000000002',
  'ex000006-0000-0000-0000-000000000006',
  'st000002-0000-0000-0000-000000000002',
  FALSE, 250.00, 'USD', 'Transferencia',
  '2026-06-04',
  'BCR-TRF-20260604-BAC-48291',
  'https://storage.fundacionucr.ac.cr/receipts/ex000006/bcr_transfer_20260604.pdf',
  'Marco, la ciberseguridad es crítica. Tu TFG puede marcar la diferencia.',
  'confirmada'
),
(
  'don00003-0000-0000-0000-000000000003',
  'ex000005-0000-0000-0000-000000000005',
  'st000004-0000-0000-0000-000000000004',
  FALSE, 75000.00, 'CRC', 'SINPE',
  '2026-06-06',
  'SINPE-20260606-3142',
  'https://storage.fundacionucr.ac.cr/receipts/ex000005/sinpe_20260606.jpg',
  'Daniel, las energías renovables son el futuro de CR.',
  'pendiente'
),
(
  'don00004-0000-0000-0000-000000000004',
  'ex000002-0000-0000-0000-000000000002',
  'st000005-0000-0000-0000-000000000005',
  FALSE, 180.00, 'USD', 'Transferencia',
  '2026-06-07',
  'BN-TRF-20260607-MCKN-91047',
  'https://storage.fundacionucr.ac.cr/receipts/ex000002/bn_transfer_20260607.pdf',
  'Valentina, la salud mental en enfermería es urgente.',
  'pendiente'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PASO FINAL: RE-HABILITAR EL TRIGGER DE SINCRONIZACIÓN AUTH
-- ============================================================
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created_trigger;

-- ============================================================
-- CONSULTAS DE VERIFICACIÓN (ejecutar en SQL Editor para QA)
-- ============================================================
/*
-- Verificar conteo de usuarios por rol
SELECT rol, COUNT(*) FROM public.users GROUP BY rol;

-- Verificar integridad referencial: usuarios con carrera_campus asignada
SELECT u.nombre, u.rol, ca.nombre AS carrera, cm.nombre AS campus
FROM public.users u
JOIN public.carrera_campus cc ON cc.id = u.carrera_principal_id
JOIN public.carreras ca ON ca.id = cc.carrera_id
JOIN public.campus cm ON cm.id = cc.campus_id
ORDER BY u.rol, u.nombre;

-- Verificar matches y scores
SELECT
  e_est.nombre || ' ' || e_est.apellidos AS estudiante,
  e_ex.nombre || ' ' || e_ex.apellidos AS exalumno,
  m.score_match, m.estado, m.tipo_apoyo
FROM public.matches m
JOIN public.users e_est ON e_est.id = m.estudiante_id
JOIN public.users e_ex ON e_ex.id = m.exalumno_id
ORDER BY m.score_match DESC;

-- Verificar donaciones confirmadas con administrador
SELECT
  d.numero_referencia, d.monto, d.moneda, d.estado,
  ex.nombre || ' ' || ex.apellidos AS donante,
  est.nombre || ' ' || est.apellidos AS beneficiario,
  adm.nombre || ' ' || adm.apellidos AS confirmado_por
FROM public.donaciones d
JOIN public.users ex ON ex.id = d.exalumno_id
JOIN public.users est ON est.id = d.proyecto_estudiante_id
LEFT JOIN public.users adm ON adm.id = d.confirmado_por
ORDER BY d.fecha_transferencia;

-- Verificar versiones de curriculum por estudiante
SELECT
  u.nombre || ' ' || u.apellidos AS estudiante,
  cv.nombre_version,
  p.titulo AS posicion_aplicada,
  p.empresa
FROM public.curriculum_versiones cv
JOIN public.curriculums c ON c.id = cv.curriculum_id
JOIN public.users u ON u.id = c.user_id
JOIN public.posiciones p ON p.id = cv.posicion_id
ORDER BY u.nombre;

-- Verificar aplicaciones y su estado
SELECT
  u.nombre || ' ' || u.apellidos AS estudiante,
  p.titulo, p.empresa, a.status, a.created_at
FROM public.applications a
JOIN public.users u ON u.id = a.student_id
JOIN public.posiciones p ON p.id = a.position_id
ORDER BY a.created_at;
*/
