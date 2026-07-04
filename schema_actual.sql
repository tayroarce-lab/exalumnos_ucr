-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  nombre text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  foto_url text,
  activo boolean NOT NULL DEFAULT true,
  reportes_recibidos integer NOT NULL DEFAULT 0 CHECK (reportes_recibidos >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  rol character varying NOT NULL CHECK (rol::text = ANY (ARRAY['estudiante'::character varying, 'exalumno'::character varying, 'admin'::character varying]::text[])),
  apellidos character varying DEFAULT ''::character varying,
  busca_mentoria boolean DEFAULT false,
  busca_empleo boolean DEFAULT false,
  ofrece_mentoria boolean DEFAULT false,
  visible_en_directorio boolean DEFAULT true,
  carrera_principal_id integer,
  updated_at timestamp with time zone DEFAULT now(),
  busca_pasantia boolean DEFAULT false,
  suspension_reason text,
  suspended_at timestamp with time zone,
  hobbies ARRAY DEFAULT '{}'::text[],
  deportes ARRAY DEFAULT '{}'::text[],
  musica ARRAY DEFAULT '{}'::text[],
  idiomas ARRAY DEFAULT '{}'::text[],
  sobre_mi_personal text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_carrera_principal_id_fkey FOREIGN KEY (carrera_principal_id) REFERENCES public.carrera_campus(id)
);
CREATE TABLE public.posiciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exalumno_id uuid NOT NULL,
  empresa text NOT NULL,
  sector ARRAY NOT NULL DEFAULT '{}'::text[],
  habilidades_requeridas ARRAY NOT NULL DEFAULT '{}'::text[],
  descripcion_general text NOT NULL,
  responsabilidades ARRAY NOT NULL DEFAULT '{}'::text[],
  contexto_equipo text,
  fecha_limite date,
  estado text NOT NULL DEFAULT 'activa'::text CHECK (estado = ANY (ARRAY['activa'::text, 'cerrada'::text, 'cubierta'::text, 'pausada'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  titulo text NOT NULL,
  tipo text CHECK (tipo = ANY (ARRAY['empleo'::text, 'pasantia'::text])),
  modalidad text CHECK (modalidad = ANY (ARRAY['presencial'::text, 'remoto'::text, 'hibrido'::text])),
  jornada text CHECK (jornada = ANY (ARRAY['tiempo_completo'::text, 'medio_tiempo'::text, 'por_proyecto'::text])),
  lugar text,
  CONSTRAINT posiciones_pkey PRIMARY KEY (id),
  CONSTRAINT posiciones_exalumno_id_fkey FOREIGN KEY (exalumno_id) REFERENCES public.users(id)
);
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exalumno_id uuid NOT NULL,
  estudiante_id uuid NOT NULL,
  tipo_apoyo text NOT NULL,
  score_match integer NOT NULL CHECK (score_match >= 0 AND score_match <= 100),
  estado text NOT NULL DEFAULT 'sugerido'::text CHECK (estado = ANY (ARRAY['sugerido'::text, 'contactado'::text, 'activo'::text, 'cerrado'::text])),
  iniciado_por text NOT NULL CHECK (iniciado_por = ANY (ARRAY['plataforma'::text, 'exalumno'::text, 'estudiante'::text])),
  resultado text CHECK (resultado = ANY (ARRAY['exitoso'::text, 'cancelado'::text, 'en_progreso'::text])),
  notas_admin text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_exalumno_id_fkey FOREIGN KEY (exalumno_id) REFERENCES public.users(id),
  CONSTRAINT matches_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.users(id)
);
CREATE TABLE public.donaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exalumno_id uuid NOT NULL,
  proyecto_estudiante_id uuid NOT NULL,
  monto numeric NOT NULL CHECK (monto > 0::numeric),
  moneda text NOT NULL CHECK (moneda = ANY (ARRAY['CRC'::text, 'USD'::text])),
  metodo_pago text NOT NULL CHECK (metodo_pago = ANY (ARRAY['sinpe'::text, 'transferencia_bancaria'::text])),
  fecha_transferencia date NOT NULL,
  numero_referencia text NOT NULL,
  comprobante_url text NOT NULL,
  mensaje_estudiante text,
  estado text NOT NULL DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY['pendiente'::text, 'confirmada'::text, 'rechazada'::text])),
  confirmado_por uuid,
  motivo_rechazo text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT donaciones_pkey PRIMARY KEY (id),
  CONSTRAINT donaciones_exalumno_id_fkey FOREIGN KEY (exalumno_id) REFERENCES public.users(id),
  CONSTRAINT donaciones_proyecto_estudiante_id_fkey FOREIGN KEY (proyecto_estudiante_id) REFERENCES public.users(id),
  CONSTRAINT donaciones_confirmado_por_fkey FOREIGN KEY (confirmado_por) REFERENCES public.users(id)
);
CREATE TABLE public.curriculums (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  cursos_relevantes ARRAY NOT NULL DEFAULT '{}'::text[],
  proyecto_graduacion_resumen text,
  habilidades_tecnicas jsonb NOT NULL DEFAULT '{}'::jsonb,
  habilidades_blandas ARRAY NOT NULL DEFAULT '{}'::text[],
  idiomas jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  sobre_mi text,
  url_linkedin character varying,
  url_portfolio character varying,
  CONSTRAINT curriculums_pkey PRIMARY KEY (id),
  CONSTRAINT curriculum_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.curriculum_certificaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  curriculum_id uuid NOT NULL,
  nombre text NOT NULL,
  institucion text NOT NULL,
  fecha date,
  url_verificacion text,
  orden integer NOT NULL DEFAULT 0,
  CONSTRAINT curriculum_certificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT curriculum_certificaciones_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES public.curriculums(id)
);
CREATE TABLE public.curriculum_versiones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  curriculum_id uuid NOT NULL,
  posicion_id uuid NOT NULL,
  nombre_version text NOT NULL,
  contenido_adaptado jsonb NOT NULL DEFAULT '{}'::jsonb,
  sugerencias_ia jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT curriculum_versiones_pkey PRIMARY KEY (id),
  CONSTRAINT curriculum_versiones_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES public.curriculums(id),
  CONSTRAINT curriculum_versiones_posicion_id_fkey FOREIGN KEY (posicion_id) REFERENCES public.posiciones(id)
);
CREATE TABLE public.reportes_perfil (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reportado_por uuid NOT NULL,
  perfil_reportado uuid NOT NULL,
  motivo text NOT NULL,
  descripcion text,
  resuelto boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reportes_perfil_pkey PRIMARY KEY (id),
  CONSTRAINT reportes_perfil_reportado_por_fkey FOREIGN KEY (reportado_por) REFERENCES public.users(id),
  CONSTRAINT reportes_perfil_perfil_reportado_fkey FOREIGN KEY (perfil_reportado) REFERENCES public.users(id)
);
CREATE TABLE public.industry_sectors (
  id text NOT NULL,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT industry_sectors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scholarship_levels (
  id integer NOT NULL DEFAULT nextval('scholarship_levels_id_seq'::regclass),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT scholarship_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.project_types (
  id integer NOT NULL DEFAULT nextval('project_types_id_seq'::regclass),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.facultades (
  id smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT facultades_pkey PRIMARY KEY (id)
);
CREATE TABLE public.campus (
  id smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campus_pkey PRIMARY KEY (id)
);
CREATE TABLE public.carrera_campus (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  carrera_id integer NOT NULL,
  campus_id smallint NOT NULL,
  CONSTRAINT carrera_campus_pkey PRIMARY KEY (id),
  CONSTRAINT carrera_campus_v2_campus_id_fkey FOREIGN KEY (campus_id) REFERENCES public.campus(id)
);
CREATE TABLE public.users_carreras (
  user_id uuid NOT NULL,
  carrera_campus_id integer NOT NULL,
  anio_ingreso smallint,
  anio_graduacion smallint,
  CONSTRAINT users_carreras_pkey PRIMARY KEY (user_id, carrera_campus_id),
  CONSTRAINT users_carreras_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT users_carreras_carrera_campus_id_fkey FOREIGN KEY (carrera_campus_id) REFERENCES public.carrera_campus(id)
);
CREATE TABLE public.experiencia_laboral (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  empresa character varying NOT NULL,
  puesto character varying NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  descripcion text,
  actualmente_aqui boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT experiencia_laboral_pkey PRIMARY KEY (id),
  CONSTRAINT experiencia_laboral_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.catalogo_areas_interes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL UNIQUE,
  categoria character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT catalogo_areas_interes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users_areas_interes (
  user_id uuid NOT NULL,
  area_id uuid NOT NULL,
  CONSTRAINT users_areas_interes_pkey PRIMARY KEY (user_id, area_id),
  CONSTRAINT users_areas_interes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT users_areas_interes_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.catalogo_areas_interes(id)
);
CREATE TABLE public.donations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  proyecto_id uuid,
  fondo_general boolean NOT NULL DEFAULT false,
  monto numeric NOT NULL CHECK (monto > 0::numeric),
  moneda character varying NOT NULL CHECK (moneda::text = ANY (ARRAY['CRC'::character varying, 'USD'::character varying]::text[])),
  metodo_pago character varying NOT NULL CHECK (metodo_pago::text = ANY (ARRAY['SINPE'::character varying, 'Transferencia'::character varying]::text[])),
  fecha_transferencia timestamp with time zone NOT NULL,
  numero_referencia character varying,
  comprobante_url text NOT NULL,
  mensaje_estudiante character varying,
  estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::estado_donacion,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  fondo_destino character varying,
  CONSTRAINT donations_pkey PRIMARY KEY (id),
  CONSTRAINT donations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT donations_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.users(id)
);
CREATE TABLE public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['login_exitoso'::text, 'acceso_admin'::text, 'acceso_denegado_rol'::text, 'cuenta_suspendida_intento'::text, 'open_redirect_attempt'::text, 'rate_limit_superado'::text, 'sesion_cerrada'::text])),
  usuario_id uuid,
  ip text NOT NULL DEFAULT 'desconocida'::text,
  ruta text,
  metadata jsonb,
  ocurrido_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT security_events_pkey PRIMARY KEY (id),
  CONSTRAINT security_events_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.users(id)
);
CREATE TABLE public.cv_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  is_complete boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cv_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT cv_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.cv_academic_info (
  profile_id uuid NOT NULL,
  university text DEFAULT 'Universidad de Costa Rica'::text,
  career text NOT NULL,
  academic_level text NOT NULL CHECK (academic_level = ANY (ARRAY['Bachillerato'::text, 'Licenciatura'::text, 'Maestría'::text, 'Doctorado'::text])),
  gpa numeric,
  entry_year smallint NOT NULL,
  relevant_courses ARRAY,
  graduation_project_title text,
  graduation_project_description text,
  CONSTRAINT cv_academic_info_pkey PRIMARY KEY (profile_id),
  CONSTRAINT cv_academic_info_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.cv_profiles(id)
);
CREATE TABLE public.cv_experiences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  experience_type text NOT NULL CHECK (experience_type = ANY (ARRAY['Empleo'::text, 'Voluntariado'::text, 'Proyecto universitario'::text, 'Asistencia'::text, 'Investigación'::text])),
  title text NOT NULL,
  organization text NOT NULL,
  start_month smallint NOT NULL CHECK (start_month >= 1 AND start_month <= 12),
  start_year smallint NOT NULL,
  end_month smallint CHECK (end_month >= 1 AND end_month <= 12),
  end_year smallint,
  sort_order smallint NOT NULL DEFAULT 0,
  bullets ARRAY DEFAULT '{}'::text[] CHECK (array_length(bullets, 1) <= 5),
  CONSTRAINT cv_experiences_pkey PRIMARY KEY (id),
  CONSTRAINT cv_experiences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.cv_profiles(id)
);
CREATE TABLE public.cv_skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  skill_type text NOT NULL CHECK (skill_type = ANY (ARRAY['technical'::text, 'soft'::text, 'language'::text])),
  name text NOT NULL,
  level text CHECK (level = ANY (ARRAY['Básico'::text, 'Intermedio'::text, 'Avanzado'::text, 'A1'::text, 'A2'::text, 'B1'::text, 'B2'::text, 'C1'::text, 'C2'::text])),
  CONSTRAINT cv_skills_pkey PRIMARY KEY (id),
  CONSTRAINT cv_skills_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.cv_profiles(id)
);
CREATE TABLE public.cv_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  name text NOT NULL,
  institution text NOT NULL,
  issued_month smallint CHECK (issued_month >= 1 AND issued_month <= 12),
  issued_year smallint,
  verification_url text,
  CONSTRAINT cv_certifications_pkey PRIMARY KEY (id),
  CONSTRAINT cv_certifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.cv_profiles(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tabla_afectada text NOT NULL,
  registro_id uuid NOT NULL,
  accion text NOT NULL CHECK (accion = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])),
  valor_viejo jsonb,
  valor_nuevo jsonb,
  usuario_id uuid,
  fecha_registro timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  foto_url text,
  pais_ciudad text,
  linkedin_url text,
  bio text,
  academic jsonb DEFAULT '[]'::jsonb,
  empresa_actual text,
  cargo_actual text,
  sector_industria ARRAY DEFAULT '{}'::text[],
  anos_experiencia numeric,
  areas_de_interes ARRAY DEFAULT '{}'::text[],
  ofrece_mentoria boolean DEFAULT false,
  horas_mes_mentoria numeric,
  ofrece_empleo boolean DEFAULT false,
  ofrece_pasantia boolean DEFAULT false,
  ofrece_proyecto boolean DEFAULT false,
  ofrece_donacion_dinero boolean DEFAULT false,
  monto_maximo_donacion numeric,
  moneda_donacion text DEFAULT 'CRC'::text,
  es_exalumno boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  full_name text,
  email text,
  phone text,
  skills ARRAY DEFAULT '{}'::text[],
  twitter_url text,
  instagram_url text,
  experience jsonb DEFAULT '[]'::jsonb,
  nombre text,
  apellidos text,
  carrera_principal text,
  escuela_principal text,
  facultad_principal text,
  anio_graduacion integer,
  perfil_completo integer DEFAULT 0,
  banner_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_bans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  banned_by uuid NOT NULL,
  reason text NOT NULL,
  expires_at timestamp with time zone,
  lifted_at timestamp with time zone,
  lifted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_bans_pkey PRIMARY KEY (id),
  CONSTRAINT user_bans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_bans_banned_by_fkey FOREIGN KEY (banned_by) REFERENCES public.users(id),
  CONSTRAINT user_bans_lifted_by_fkey FOREIGN KEY (lifted_by) REFERENCES public.users(id)
);
CREATE TABLE public.password_resets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  codigo text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_resets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.estudiantes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  carnet_ucr text NOT NULL,
  carrera text NOT NULL,
  escuela_facultad text NOT NULL,
  sede text NOT NULL,
  anio_ingreso integer NOT NULL,
  nivel_academico text NOT NULL CHECK (nivel_academico = ANY (ARRAY['bachillerato'::text, 'licenciatura'::text, 'maestria'::text, 'doctorado'::text])),
  promedio_ponderado numeric CHECK (promedio_ponderado IS NULL OR promedio_ponderado >= 0::numeric AND promedio_ponderado <= 10::numeric),
  beca_socioeconomica text CHECK (beca_socioeconomica IS NULL OR (beca_socioeconomica = ANY (ARRAY['ninguna'::text, 'nivel1'::text, 'nivel2'::text, 'nivel3'::text, 'nivel4'::text, 'nivel5'::text]))),
  proyecto_titulo text NOT NULL,
  proyecto_descripcion text NOT NULL,
  proyecto_area_tematica text NOT NULL,
  proyecto_tipo text NOT NULL CHECK (proyecto_tipo = ANY (ARRAY['tfg'::text, 'tesis'::text, 'practica_dirigida'::text, 'seminario'::text])),
  proyecto_porcentaje_avance integer CHECK (proyecto_porcentaje_avance IS NULL OR proyecto_porcentaje_avance >= 0 AND proyecto_porcentaje_avance <= 100),
  proyecto_necesidades ARRAY,
  areas_de_interes ARRAY NOT NULL,
  habilidades ARRAY,
  busca_financiamiento boolean NOT NULL DEFAULT false,
  busca_mentoria boolean NOT NULL DEFAULT false,
  busca_empleo boolean NOT NULL DEFAULT false,
  busca_pasantia boolean NOT NULL DEFAULT false,
  proyecto_activo boolean NOT NULL DEFAULT true,
  visible_en_directorio boolean NOT NULL DEFAULT true,
  perfil_completo boolean NOT NULL DEFAULT false,
  proyecto_valor_monto numeric,
  proyecto_valor_moneda text CHECK (proyecto_valor_moneda = ANY (ARRAY['CRC'::text, 'USD'::text])),
  proyecto_video_url text,
  proyecto_documento_url text,
  CONSTRAINT estudiantes_pkey PRIMARY KEY (id),
  CONSTRAINT estudiantes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.exalumnos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  carrera_ucr text NOT NULL,
  escuela_facultad text NOT NULL,
  anio_graduacion integer NOT NULL,
  empresa_actual text NOT NULL,
  cargo_actual text NOT NULL,
  sector_industria ARRAY NOT NULL,
  areas_de_interes ARRAY NOT NULL,
  pais_ciudad text NOT NULL,
  anios_experiencia integer NOT NULL CHECK (anios_experiencia >= 0),
  linkedin_url text NOT NULL,
  bio text,
  ofrece_mentoria boolean NOT NULL DEFAULT false,
  horas_mes_mentoria integer CHECK (horas_mes_mentoria IS NULL OR horas_mes_mentoria >= 0),
  ofrece_empleo boolean NOT NULL DEFAULT false,
  ofrece_pasantia boolean NOT NULL DEFAULT false,
  ofrece_proyecto boolean NOT NULL DEFAULT false,
  ofrece_donacion_dinero boolean NOT NULL DEFAULT false,
  monto_maximo_donacion numeric CHECK (monto_maximo_donacion IS NULL OR monto_maximo_donacion >= 0::numeric),
  moneda_donacion text CHECK (moneda_donacion IS NULL OR (moneda_donacion = ANY (ARRAY['CRC'::text, 'USD'::text]))),
  visible_en_directorio boolean NOT NULL DEFAULT true,
  perfil_completo boolean NOT NULL DEFAULT false,
  CONSTRAINT exalumnos_pkey PRIMARY KEY (id),
  CONSTRAINT exalumnos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.cv_versiones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  posicion_id uuid,
  titulo_version text NOT NULL,
  contenido jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT cv_versiones_pkey PRIMARY KEY (id),
  CONSTRAINT cv_versiones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT cv_versiones_posicion_id_fkey FOREIGN KEY (posicion_id) REFERENCES public.posiciones(id)
);
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  position_id uuid NOT NULL,
  student_id uuid NOT NULL,
  alumni_id uuid NOT NULL,
  cv_id uuid,
  message text CHECK (char_length(message) <= 500),
  status USER-DEFINED NOT NULL DEFAULT 'enviada'::application_status,
  compatibility_score integer CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.posiciones(id),
  CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT applications_alumni_id_fkey FOREIGN KEY (alumni_id) REFERENCES public.users(id),
  CONSTRAINT applications_cv_id_fkey FOREIGN KEY (cv_id) REFERENCES public.cv_profiles(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content text,
  is_read boolean NOT NULL DEFAULT false,
  link_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  mensaje text NOT NULL,
  tipo text NOT NULL,
  link text,
  leida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reportes_perfiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_id uuid NOT NULL,
  motivo text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT reportes_perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT reportes_perfiles_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES auth.users(id),
  CONSTRAINT reportes_perfiles_reported_id_fkey FOREIGN KEY (reported_id) REFERENCES auth.users(id)
);
CREATE TABLE public.chat_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message_expiration text NOT NULL DEFAULT 'nunca'::text,
  background_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_settings_pkey PRIMARY KEY (id),
  CONSTRAINT chat_settings_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT chat_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_deleted boolean NOT NULL DEFAULT false,
  is_edited boolean NOT NULL DEFAULT false,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_blocks_pkey PRIMARY KEY (id),
  CONSTRAINT user_blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id),
  CONSTRAINT user_blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id)
);
CREATE TABLE public.support_queries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  query_type text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'Pendiente'::text,
  response text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT support_queries_pkey PRIMARY KEY (id)
);
CREATE TABLE public.talleres (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exalumno_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  fecha_taller timestamp with time zone NOT NULL,
  modalidad text NOT NULL CHECK (modalidad = ANY (ARRAY['ONLINE'::text, 'PRESENCIAL'::text, 'HIBRIDO'::text])),
  estado text NOT NULL DEFAULT 'PENDIENTE'::text CHECK (estado = ANY (ARRAY['PENDIENTE'::text, 'APROBADO'::text, 'RECHAZADO'::text])),
  ubicacion_url text,
  cupos integer,
  multimedia_urls ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT talleres_pkey PRIMARY KEY (id),
  CONSTRAINT talleres_exalumno_id_fkey FOREIGN KEY (exalumno_id) REFERENCES public.users(id)
);
CREATE TABLE public.talleres_postulaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  taller_id uuid NOT NULL,
  estudiante_id uuid NOT NULL,
  estado text NOT NULL DEFAULT 'PENDIENTE'::text CHECK (estado = ANY (ARRAY['PENDIENTE'::text, 'ACEPTADO'::text, 'RECHAZADO'::text])),
  mensaje text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT talleres_postulaciones_pkey PRIMARY KEY (id),
  CONSTRAINT talleres_postulaciones_taller_id_fkey FOREIGN KEY (taller_id) REFERENCES public.talleres(id),
  CONSTRAINT talleres_postulaciones_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.users(id)
);
CREATE TABLE public.areas (
  id integer NOT NULL DEFAULT nextval('areas_id_seq'::regclass),
  nombre text NOT NULL UNIQUE,
  CONSTRAINT areas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.carreras (
  id integer NOT NULL DEFAULT nextval('carreras_id_seq'::regclass),
  area_id integer,
  nombre text NOT NULL,
  CONSTRAINT carreras_pkey PRIMARY KEY (id),
  CONSTRAINT carreras_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id)
);
CREATE TABLE public.sedes (
  id integer NOT NULL DEFAULT nextval('sedes_id_seq'::regclass),
  nombre text NOT NULL UNIQUE,
  CONSTRAINT sedes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tipos_proyecto (
  id integer NOT NULL DEFAULT nextval('tipos_proyecto_id_seq'::regclass),
  nombre text NOT NULL UNIQUE,
  CONSTRAINT tipos_proyecto_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tipos_apoyo (
  id text NOT NULL,
  label text NOT NULL,
  CONSTRAINT tipos_apoyo_pkey PRIMARY KEY (id)
);
CREATE TABLE public.opportunities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  category text,
  description text,
  duration text,
  requirements jsonb,
  schedule text,
  CONSTRAINT opportunities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  category text,
  event_date text,
  event_time text,
  location text,
  description text,
  CONSTRAINT events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mentors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  role text,
  company text,
  rating numeric,
  sessions integer,
  degree text,
  skills jsonb,
  quote text,
  bio text,
  slots jsonb,
  CONSTRAINT mentors_pkey PRIMARY KEY (id)
);
