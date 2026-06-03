-- ============================================================
-- MIGRACIÓN 01: Inicialización de la base de datos
-- Proyecto: Plataforma Digital Fundación Exalumnos UCR
-- ============================================================

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA 1: users
-- Tabla maestra de todos los usuarios del sistema.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               TEXT        NOT NULL UNIQUE,
  nombre              TEXT        NOT NULL,
  tipo                TEXT        NOT NULL CHECK (tipo IN ('estudiante', 'exalumno', 'admin')),
  email_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
  foto_url            TEXT,
  activo              BOOLEAN     NOT NULL DEFAULT TRUE,
  reportes_recibidos  INT         NOT NULL DEFAULT 0 CHECK (reportes_recibidos >= 0),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA 2: exalumnos
-- Perfil extendido de exalumnos graduados de la UCR.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exalumnos (
  user_id                  UUID        PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  carrera_ucr              TEXT        NOT NULL,
  escuela_facultad         TEXT        NOT NULL,
  anio_graduacion          INT         NOT NULL CHECK (anio_graduacion >= 1950),
  empresa_actual           TEXT,
  cargo_actual             TEXT,
  sector_industria         TEXT[]      NOT NULL DEFAULT '{}',
  areas_de_interes         TEXT[]      NOT NULL DEFAULT '{}',
  pais_ciudad              TEXT,
  anos_experiencia         INT         CHECK (anos_experiencia >= 0),
  linkedin_url             TEXT,
  bio                      TEXT,
  ofrece_mentoria          BOOLEAN     NOT NULL DEFAULT FALSE,
  horas_mes_mentoria       INT         CHECK (horas_mes_mentoria >= 0),
  ofrece_empleo            BOOLEAN     NOT NULL DEFAULT FALSE,
  ofrece_pasantia          BOOLEAN     NOT NULL DEFAULT FALSE,
  ofrece_proyecto          BOOLEAN     NOT NULL DEFAULT FALSE,
  ofrece_donacion_dinero   BOOLEAN     NOT NULL DEFAULT FALSE,
  monto_maximo_donacion    NUMERIC(12,2) CHECK (monto_maximo_donacion >= 0),
  moneda_donacion          TEXT        CHECK (moneda_donacion IN ('CRC', 'USD')),
  visible_en_directorio    BOOLEAN     NOT NULL DEFAULT TRUE,
  perfil_completo          BOOLEAN     NOT NULL DEFAULT FALSE
);

-- ============================================================
-- TABLA 3: estudiantes
-- Perfil extendido de estudiantes activos con beca o TFG.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.estudiantes (
  user_id                    UUID        PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  carnet_ucr                 TEXT        NOT NULL UNIQUE,
  carrera                    TEXT        NOT NULL,
  escuela_facultad           TEXT        NOT NULL,
  sede                       TEXT        NOT NULL,
  anio_ingreso               INT         NOT NULL CHECK (anio_ingreso >= 1950),
  nivel_academico            TEXT        NOT NULL CHECK (nivel_academico IN ('bachillerato', 'licenciatura', 'maestria', 'doctorado')),
  promedio_ponderado         NUMERIC(4,2) CHECK (promedio_ponderado >= 0 AND promedio_ponderado <= 10),
  beca_socioeconomica        TEXT        NOT NULL DEFAULT 'ninguna' CHECK (beca_socioeconomica IN ('ninguna', 'nivel1', 'nivel2', 'nivel3', 'nivel4', 'nivel5')),
  proyecto_titulo            TEXT,
  proyecto_descripcion       TEXT,
  proyecto_area_tematica     TEXT,
  proyecto_tipo              TEXT        CHECK (proyecto_tipo IN ('tfg', 'tesis', 'practica_dirigida', 'seminario')),
  proyecto_porcentaje_avance INT         CHECK (proyecto_porcentaje_avance >= 0 AND proyecto_porcentaje_avance <= 100),
  proyecto_necesidades       TEXT[]      NOT NULL DEFAULT '{}',
  areas_de_interes           TEXT[]      NOT NULL DEFAULT '{}',
  habilidades                TEXT[]      NOT NULL DEFAULT '{}',
  busca_financiamiento       BOOLEAN     NOT NULL DEFAULT FALSE,
  busca_mentoria             BOOLEAN     NOT NULL DEFAULT FALSE,
  busca_empleo               BOOLEAN     NOT NULL DEFAULT FALSE,
  busca_pasantia             BOOLEAN     NOT NULL DEFAULT FALSE,
  proyecto_activo            BOOLEAN     NOT NULL DEFAULT FALSE,
  visible_en_directorio      BOOLEAN     NOT NULL DEFAULT TRUE,
  perfil_completo            BOOLEAN     NOT NULL DEFAULT FALSE
);

-- ============================================================
-- TABLA 4: posiciones
-- Vacantes y oportunidades publicadas por exalumnos.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posiciones (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  exalumno_id           UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  empresa               TEXT        NOT NULL,
  sector                TEXT[]      NOT NULL DEFAULT '{}',
  habilidades_requeridas TEXT[]     NOT NULL DEFAULT '{}',
  descripcion_general   TEXT        NOT NULL,
  responsabilidades     TEXT[]      NOT NULL DEFAULT '{}',
  contexto_equipo       TEXT,
  fecha_limite          DATE,
  estado                TEXT        NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada', 'cubierta', 'pausada')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA 5: matches
-- Relaciones de compatibilidad entre estudiantes y exalumnos.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  exalumno_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  estudiante_id   UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipo_apoyo      TEXT        NOT NULL,
  score_match     INT         NOT NULL CHECK (score_match >= 0 AND score_match <= 100),
  estado          TEXT        NOT NULL DEFAULT 'sugerido' CHECK (estado IN ('sugerido', 'contactado', 'activo', 'cerrado')),
  iniciado_por    TEXT        NOT NULL CHECK (iniciado_por IN ('plataforma', 'exalumno', 'estudiante')),
  resultado       TEXT        CHECK (resultado IN ('exitoso', 'cancelado', 'en_progreso')),
  notas_admin     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA 6: donaciones
-- Registro de donaciones económicas (SINPE / IBAN).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.donaciones (
  id                     UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  exalumno_id            UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  proyecto_estudiante_id UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  monto                  NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  moneda                 TEXT          NOT NULL CHECK (moneda IN ('CRC', 'USD')),
  metodo_pago            TEXT          NOT NULL CHECK (metodo_pago IN ('sinpe', 'transferencia_bancaria')),
  fecha_transferencia    DATE          NOT NULL,
  numero_referencia      TEXT          NOT NULL,
  comprobante_url        TEXT          NOT NULL,
  mensaje_estudiante     TEXT,
  estado                 TEXT          NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'rechazada')),
  confirmado_por         UUID          REFERENCES public.users(id),
  motivo_rechazo         TEXT,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA 7: curriculum
-- Curriculum base del estudiante (uno por estudiante).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum (
  id                           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id                UUID        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  cursos_relevantes            TEXT[]      NOT NULL DEFAULT '{}',
  proyecto_graduacion_resumen  TEXT,
  habilidades_tecnicas         JSONB       NOT NULL DEFAULT '{}',
  habilidades_blandas          TEXT[]      NOT NULL DEFAULT '{}',
  idiomas                      JSONB       NOT NULL DEFAULT '[]',
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA 8: curriculum_experiencia
-- Entradas de experiencia dentro de un curriculum.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_experiencia (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id  UUID        NOT NULL REFERENCES public.curriculum(id) ON DELETE CASCADE,
  tipo           TEXT        NOT NULL CHECK (tipo IN ('empleo', 'voluntariado', 'proyecto_universitario', 'asistencia', 'investigacion')),
  titulo         TEXT        NOT NULL,
  organizacion   TEXT        NOT NULL,
  fecha_inicio   DATE        NOT NULL,
  fecha_fin      DATE,
  bullets        TEXT[]      NOT NULL DEFAULT '{}',
  orden          INT         NOT NULL DEFAULT 0
);

-- ============================================================
-- TABLA 9: curriculum_certificaciones
-- Certificaciones y credenciales del estudiante.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_certificaciones (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id   UUID        NOT NULL REFERENCES public.curriculum(id) ON DELETE CASCADE,
  nombre          TEXT        NOT NULL,
  institucion     TEXT        NOT NULL,
  fecha           DATE,
  url_verificacion TEXT,
  orden           INT         NOT NULL DEFAULT 0
);

-- ============================================================
-- TABLA 10: curriculum_versiones
-- Versiones adaptadas del CV por posición (máx. 10 por cuenta).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_versiones (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id      UUID        NOT NULL REFERENCES public.curriculum(id) ON DELETE CASCADE,
  posicion_id        UUID        NOT NULL REFERENCES public.posiciones(id) ON DELETE CASCADE,
  nombre_version     TEXT        NOT NULL,
  contenido_adaptado JSONB       NOT NULL DEFAULT '{}',
  sugerencias_ia     JSONB       NOT NULL DEFAULT '[]',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (curriculum_id, posicion_id)
);

-- ============================================================
-- TABLA 11: aplicaciones
-- Postulaciones formales de estudiantes a posiciones.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.aplicaciones (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  posicion_id             UUID        NOT NULL REFERENCES public.posiciones(id) ON DELETE CASCADE,
  estudiante_id           UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  curriculum_version_id   UUID        REFERENCES public.curriculum_versiones(id) ON DELETE SET NULL,
  mensaje_presentacion    TEXT,
  estado                  TEXT        NOT NULL DEFAULT 'enviada' CHECK (estado IN ('enviada', 'en_revision', 'seleccionado', 'descartado')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (posicion_id, estudiante_id)
);

-- ============================================================
-- TABLA 12: reportes_perfil
-- Denuncias de usuarios contra perfiles inapropiados.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reportes_perfil (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reportado_por     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  perfil_reportado  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  motivo            TEXT        NOT NULL,
  descripcion       TEXT,
  resuelto          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGER DE SEGURIDAD: Auto-suspensión por acumulación de reportes
-- Al insertar un reporte, incrementa el contador del usuario denunciado.
-- Si reportes_recibidos >= 3, cambia activo = FALSE automáticamente.
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_incrementar_reportes_y_suspender()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET
    reportes_recibidos = reportes_recibidos + 1,
    activo = CASE
               WHEN (reportes_recibidos + 1) >= 3 THEN FALSE
               ELSE activo
             END
  WHERE id = NEW.perfil_reportado;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reportes_suspender_cuenta
AFTER INSERT ON public.reportes_perfil
FOR EACH ROW
EXECUTE FUNCTION public.fn_incrementar_reportes_y_suspender();

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_matches_exalumno   ON public.matches(exalumno_id);
CREATE INDEX IF NOT EXISTS idx_matches_estudiante  ON public.matches(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matches_estado      ON public.matches(estado);
CREATE INDEX IF NOT EXISTS idx_donaciones_exalumno ON public.donaciones(exalumno_id);
CREATE INDEX IF NOT EXISTS idx_donaciones_est      ON public.donaciones(proyecto_estudiante_id);
CREATE INDEX IF NOT EXISTS idx_donaciones_estado   ON public.donaciones(estado);
CREATE INDEX IF NOT EXISTS idx_posiciones_exalumno ON public.posiciones(exalumno_id);
CREATE INDEX IF NOT EXISTS idx_posiciones_estado   ON public.posiciones(estado);
CREATE INDEX IF NOT EXISTS idx_curriculum_est      ON public.curriculum(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_cv_versiones_curr   ON public.curriculum_versiones(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_aplicaciones_pos    ON public.aplicaciones(posicion_id);
CREATE INDEX IF NOT EXISTS idx_aplicaciones_est    ON public.aplicaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_reportes_reportado  ON public.reportes_perfil(perfil_reportado);
CREATE INDEX IF NOT EXISTS idx_users_tipo          ON public.users(tipo);
CREATE INDEX IF NOT EXISTS idx_users_activo        ON public.users(activo);

-- ============================================================
-- HABILITAR ROW LEVEL SECURITY EN TODAS LAS TABLAS
-- ============================================================
ALTER TABLE public.users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exalumnos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posiciones              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donaciones              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_experiencia  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_certificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_versiones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aplicaciones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_perfil         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS: users
-- ============================================================
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "users_insert_service"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================
-- POLÍTICAS RLS: exalumnos
-- ============================================================
CREATE POLICY "exalumnos_select"
  ON public.exalumnos FOR SELECT
  TO authenticated
  USING (
    visible_en_directorio = TRUE
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
  );

CREATE POLICY "exalumnos_insert_own"
  ON public.exalumnos FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "exalumnos_update_own"
  ON public.exalumnos FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- POLÍTICAS RLS CRÍTICAS: estudiantes
-- El campo beca_socioeconomica y el registro completo solo pueden
-- leerlos:
--   1. El propio estudiante.
--   2. Un administrador.
--   3. Un exalumno con un match en estado 'activo' con ese estudiante.
-- Los demás usuarios autenticados pueden ver perfiles del directorio
-- pero sin acceso al nivel de beca (protección a nivel aplicación).
-- ============================================================
CREATE POLICY "estudiantes_select_full"
  ON public.estudiantes FOR SELECT
  TO authenticated
  USING (
    -- 1. El propio estudiante ve su registro completo
    user_id = auth.uid()
    OR
    -- 2. El administrador ve todos los registros
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'admin'
    )
    OR
    -- 3. Exalumno con match activo con este estudiante
    EXISTS (
      SELECT 1
      FROM public.matches m
      JOIN public.users u ON u.id = auth.uid()
      WHERE u.tipo = 'exalumno'
        AND m.exalumno_id = auth.uid()
        AND m.estudiante_id = public.estudiantes.user_id
        AND m.estado = 'activo'
    )
    OR
    -- 4. Perfil público del directorio (datos no sensibles)
    visible_en_directorio = TRUE
  );

CREATE POLICY "estudiantes_insert_own"
  ON public.estudiantes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "estudiantes_update_own"
  ON public.estudiantes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- POLÍTICAS RLS: posiciones
-- ============================================================
CREATE POLICY "posiciones_select_authenticated"
  ON public.posiciones FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "posiciones_insert_exalumno"
  ON public.posiciones FOR INSERT
  TO authenticated
  WITH CHECK (
    exalumno_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'exalumno'
    )
  );

CREATE POLICY "posiciones_update_own"
  ON public.posiciones FOR UPDATE
  TO authenticated
  USING (exalumno_id = auth.uid());

CREATE POLICY "posiciones_delete_own"
  ON public.posiciones FOR DELETE
  TO authenticated
  USING (
    exalumno_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

-- ============================================================
-- POLÍTICAS RLS: matches
-- ============================================================
CREATE POLICY "matches_select_own"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    exalumno_id = auth.uid()
    OR estudiante_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

CREATE POLICY "matches_insert_allowed"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
    OR exalumno_id = auth.uid()
    OR estudiante_id = auth.uid()
  );

CREATE POLICY "matches_update_allowed"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
    OR exalumno_id = auth.uid()
    OR estudiante_id = auth.uid()
  );

-- ============================================================
-- POLÍTICAS RLS: donaciones
-- ============================================================
CREATE POLICY "donaciones_select_own"
  ON public.donaciones FOR SELECT
  TO authenticated
  USING (
    exalumno_id = auth.uid()
    OR proyecto_estudiante_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

CREATE POLICY "donaciones_insert_exalumno"
  ON public.donaciones FOR INSERT
  TO authenticated
  WITH CHECK (
    exalumno_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'exalumno'
    )
  );

CREATE POLICY "donaciones_update_admin"
  ON public.donaciones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

-- ============================================================
-- POLÍTICAS RLS: curriculum
-- ============================================================
CREATE POLICY "curriculum_select_allowed"
  ON public.curriculum FOR SELECT
  TO authenticated
  USING (
    estudiante_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
    OR EXISTS (
      SELECT 1
      FROM public.matches m
      JOIN public.users u ON u.id = auth.uid()
      WHERE u.tipo = 'exalumno'
        AND m.exalumno_id = auth.uid()
        AND m.estudiante_id = public.curriculum.estudiante_id
        AND m.estado = 'activo'
    )
  );

CREATE POLICY "curriculum_insert_own"
  ON public.curriculum FOR INSERT
  TO authenticated
  WITH CHECK (estudiante_id = auth.uid());

CREATE POLICY "curriculum_update_own"
  ON public.curriculum FOR UPDATE
  TO authenticated
  USING (estudiante_id = auth.uid());

-- ============================================================
-- POLÍTICAS RLS: curriculum_experiencia
-- ============================================================
CREATE POLICY "cv_exp_select_own"
  ON public.curriculum_experiencia FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

CREATE POLICY "cv_exp_insert_own"
  ON public.curriculum_experiencia FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
  );

CREATE POLICY "cv_exp_update_own"
  ON public.curriculum_experiencia FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
  );

CREATE POLICY "cv_exp_delete_own"
  ON public.curriculum_experiencia FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
  );

-- ============================================================
-- POLÍTICAS RLS: curriculum_certificaciones
-- ============================================================
CREATE POLICY "cv_cert_select_own"
  ON public.curriculum_certificaciones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

CREATE POLICY "cv_cert_insert_own"
  ON public.curriculum_certificaciones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
  );

CREATE POLICY "cv_cert_update_own"
  ON public.curriculum_certificaciones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
  );

CREATE POLICY "cv_cert_delete_own"
  ON public.curriculum_certificaciones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
  );

-- ============================================================
-- POLÍTICAS RLS: curriculum_versiones
-- ============================================================
CREATE POLICY "cv_ver_select_own"
  ON public.curriculum_versiones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

CREATE POLICY "cv_ver_insert_own"
  ON public.curriculum_versiones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
  );

CREATE POLICY "cv_ver_delete_own"
  ON public.curriculum_versiones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum c
      WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid()
    )
  );

-- ============================================================
-- POLÍTICAS RLS: aplicaciones
-- ============================================================
CREATE POLICY "aplicaciones_select_own"
  ON public.aplicaciones FOR SELECT
  TO authenticated
  USING (
    estudiante_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.posiciones p
      WHERE p.id = posicion_id AND p.exalumno_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

CREATE POLICY "aplicaciones_insert_estudiante"
  ON public.aplicaciones FOR INSERT
  TO authenticated
  WITH CHECK (
    estudiante_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.tipo = 'estudiante'
    )
  );

CREATE POLICY "aplicaciones_update_exalumno_admin"
  ON public.aplicaciones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posiciones p
      WHERE p.id = posicion_id AND p.exalumno_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

-- ============================================================
-- POLÍTICAS RLS: reportes_perfil
-- ============================================================
CREATE POLICY "reportes_insert_authenticated"
  ON public.reportes_perfil FOR INSERT
  TO authenticated
  WITH CHECK (reportado_por = auth.uid());

CREATE POLICY "reportes_select_admin_propio"
  ON public.reportes_perfil FOR SELECT
  TO authenticated
  USING (
    reportado_por = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );

CREATE POLICY "reportes_update_admin"
  ON public.reportes_perfil FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.tipo = 'admin')
  );
