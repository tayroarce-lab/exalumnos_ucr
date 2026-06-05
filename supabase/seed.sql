-- ============================================================
-- SEED DATA PARA DESARROLLO (Plataforma Fundación Exalumnos UCR)
-- Archivo: supabase/seed.sql
-- ============================================================
-- IMPORTANTE: Las contraseñas de todos los usuarios de prueba
-- están configuradas como: Test1234!
-- ============================================================

-- 1. Inyectar Usuarios en el sistema de Autenticación de Supabase (auth.users)
-- Esto es OBLIGATORIO para poder hacer login en la plataforma.
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
-- Admin
('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@fundacionucr.org', crypt('Test1234!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Admin Principal"}', now(), now(), '', '', '', ''),
-- Exalumno 1
('e2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos.exalumno@gmail.com', crypt('Test1234!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Carlos Ingeniero"}', now(), now(), '', '', '', ''),
-- Exalumno 2
('e2222222-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'laura.exalumna@outlook.com', crypt('Test1234!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Laura Bióloga"}', now(), now(), '', '', '', ''),
-- Estudiante 1
('e3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'estudiante1@ucr.ac.cr', crypt('Test1234!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Ana Estudiante"}', now(), now(), '', '', '', ''),
-- Estudiante 2
('e3333333-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'estudiante2@ucr.ac.cr', crypt('Test1234!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Pedro Informática"}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Si existen identidades, crearlas para que funcione el login
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', format('{"sub":"%s","email":"%s"}', 'a1111111-1111-1111-1111-111111111111', 'admin@fundacionucr.org')::jsonb, 'email', now(), now(), now()),
('e2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', format('{"sub":"%s","email":"%s"}', 'e2222222-2222-2222-2222-222222222222', 'carlos.exalumno@gmail.com')::jsonb, 'email', now(), now(), now()),
('e2222222-3333-3333-3333-333333333333', 'e2222222-3333-3333-3333-333333333333', format('{"sub":"%s","email":"%s"}', 'e2222222-3333-3333-3333-333333333333', 'laura.exalumna@outlook.com')::jsonb, 'email', now(), now(), now()),
('e3333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', format('{"sub":"%s","email":"%s"}', 'e3333333-3333-3333-3333-333333333333', 'estudiante1@ucr.ac.cr')::jsonb, 'email', now(), now(), now()),
('e3333333-4444-4444-4444-444444444444', 'e3333333-4444-4444-4444-444444444444', format('{"sub":"%s","email":"%s"}', 'e3333333-4444-4444-4444-444444444444', 'estudiante2@ucr.ac.cr')::jsonb, 'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;


-- 2. Inyectar en la tabla pública Users (Nuestro esquema)
INSERT INTO public.users (id, email, nombre, tipo, email_verified, activo) VALUES
('a1111111-1111-1111-1111-111111111111', 'admin@fundacionucr.org', 'Admin Principal', 'admin', TRUE, TRUE),
('e2222222-2222-2222-2222-222222222222', 'carlos.exalumno@gmail.com', 'Carlos Ingeniero', 'exalumno', TRUE, TRUE),
('e2222222-3333-3333-3333-333333333333', 'laura.exalumna@outlook.com', 'Laura Bióloga', 'exalumno', TRUE, TRUE),
('e3333333-3333-3333-3333-333333333333', 'estudiante1@ucr.ac.cr', 'Ana Estudiante', 'estudiante', TRUE, TRUE),
('e3333333-4444-4444-4444-444444444444', 'estudiante2@ucr.ac.cr', 'Pedro Informática', 'estudiante', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;


-- 3. Perfiles de Exalumnos
INSERT INTO public.exalumnos (
  user_id, carrera_ucr, escuela_facultad, anio_graduacion, empresa_actual, cargo_actual,
  sector_industria, areas_de_interes, pais_ciudad, anos_experiencia, linkedin_url,
  ofrece_mentoria, horas_mes_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_donacion_dinero, visible_en_directorio, perfil_completo
) VALUES
(
  'e2222222-2222-2222-2222-222222222222', 'Ingeniería en Computación', 'Facultad de Ingeniería', 2015,
  'Microsoft', 'Senior Software Engineer', '{"Tecnología", "Desarrollo de Software"}', '{"Tecnología e Innovación", "Emprendimiento"}', 'Seattle, USA', 9, 'https://linkedin.com/in/carlos-ing',
  TRUE, 10, TRUE, FALSE, TRUE, TRUE, TRUE
),
(
  'e2222222-3333-3333-3333-333333333333', 'Biología', 'Facultad de Ciencias', 2018,
  'Instituto Nacional de Biodiversidad', 'Investigadora', '{"Investigación Científica", "Sostenibilidad"}', '{"Medio Ambiente y Sostenibilidad", "Investigación Científica"}', 'San José, Costa Rica', 6, 'https://linkedin.com/in/laura-bio',
  TRUE, 5, FALSE, TRUE, FALSE, TRUE, TRUE
)
ON CONFLICT (user_id) DO NOTHING;


-- 4. Perfiles de Estudiantes
INSERT INTO public.estudiantes (
  user_id, carnet_ucr, carrera, escuela_facultad, sede, anio_ingreso, nivel_academico,
  promedio_ponderado, beca_socioeconomica, proyecto_titulo, proyecto_descripcion,
  proyecto_area_tematica, proyecto_tipo, proyecto_porcentaje_avance, areas_de_interes,
  busca_financiamiento, busca_mentoria, busca_empleo, busca_pasantia, proyecto_activo, visible_en_directorio, perfil_completo
) VALUES
(
  'e3333333-3333-3333-3333-333333333333', 'B91111', 'Ingeniería Ambiental', 'Facultad de Ingeniería', 'Sede Rodrigo Facio', 2019, 'licenciatura',
  8.5, 'nivel4', 'Bioplásticos a partir de desechos', 'Desarrollo de un nuevo polímero compostable utilizando cáscaras de banano...',
  'Medio Ambiente y Sostenibilidad', 'tfg', 40, '{"Medio Ambiente y Sostenibilidad", "Tecnología e Innovación"}',
  TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE
),
(
  'e3333333-4444-4444-4444-444444444444', 'C02222', 'Ingeniería en Computación', 'Facultad de Ingeniería', 'Sede Rodrigo Facio', 2020, 'bachillerato',
  9.0, 'nivel5', 'Algoritmo de IA para detección de plagas', 'Uso de Machine Learning y visión computacional para identificar roya en café',
  'Tecnología e Innovación', 'tfg', 70, '{"Tecnología e Innovación", "Agro y Alimentación"}',
  FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE
)
ON CONFLICT (user_id) DO NOTHING;


-- 5. Posición Ficticia (Oferta de Empleo)
INSERT INTO public.posiciones (
  id, exalumno_id, tipo, titulo, modalidad, jornada, lugar, empresa, sector,
  habilidades_requeridas, descripcion_general, responsabilidades, fecha_limite, estado
) VALUES
(
  'p5555555-5555-5555-5555-555555555555', 'e2222222-2222-2222-2222-222222222222', 'empleo', 'Desarrollador Junior Full-Stack', 'remoto', 'tiempo_completo', 'Remoto (Latam)', 'Microsoft', '{"Tecnología"}',
  '{"React", "Node.js", "TypeScript", "PostgreSQL"}', 'Buscamos un desarrollador junior apasionado por resolver problemas complejos...',
  '{"Desarrollar nuevas features", "Mantener la base de código existente", "Participar en code reviews"}', current_date + interval '30 days', 'activa'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Match de Mentoría (Sugerido)
INSERT INTO public.matches (
  exalumno_id, estudiante_id, tipo_apoyo, score_match, estado, iniciado_por
) VALUES
(
  'e2222222-2222-2222-2222-222222222222', 'e3333333-4444-4444-4444-444444444444', 'mentoria', 85, 'sugerido', 'plataforma'
);
