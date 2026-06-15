-- =============================================================================
-- MIGRACIÓN RF-13: Sistema de Aplicaciones y Gestión de Candidatos (CORRECCIÓN)
-- =============================================================================

-- 1. Limpieza de tablas conflictivas anteriores
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.aplicaciones CASCADE;
DROP TYPE IF EXISTS public.estado_aplicacion CASCADE;
DROP TYPE IF EXISTS public.application_status CASCADE;

-- 2. ENUM de estado de aplicación
CREATE TYPE public.application_status AS ENUM (
  'enviada',
  'en_revision',
  'seleccionado',
  'descartado'
);

-- 3. Tabla applications
CREATE TABLE public.applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id     UUID NOT NULL REFERENCES public.posiciones(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alumni_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cv_id           UUID REFERENCES public.cv_profiles(id) ON DELETE SET NULL,
  message         TEXT CHECK (char_length(message) <= 500),
  status          public.application_status NOT NULL DEFAULT 'enviada',
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Un estudiante no puede aplicar dos veces a la misma posición
  CONSTRAINT unique_application UNIQUE (position_id, student_id)
);

-- Índices de applications
CREATE INDEX idx_applications_position_id ON public.applications(position_id);
CREATE INDEX idx_applications_alumni_id ON public.applications(alumni_id);
CREATE INDEX idx_applications_student_id ON public.applications(student_id);
CREATE INDEX idx_applications_status ON public.applications(status);

-- Trigger applications updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at_column();

-- Políticas RLS applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_select_own" ON public.applications
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "alumni_select_own_positions" ON public.applications
  FOR SELECT USING (auth.uid() = alumni_id);

CREATE POLICY "students_insert" ON public.applications
  FOR INSERT WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND rol = 'estudiante'
    )
    AND EXISTS (
      SELECT 1 FROM public.posiciones
      WHERE id = position_id
      AND estado = 'activa'
      AND exalumno_id = applications.alumni_id
    )
  );

CREATE POLICY "students_delete_own_enviada" ON public.applications
  FOR DELETE USING (
    auth.uid() = student_id
    AND status = 'enviada'
  );

CREATE POLICY "alumni_update_status" ON public.applications
  FOR UPDATE USING (
    auth.uid() = alumni_id
  ) WITH CHECK (
    auth.uid() = alumni_id
  );

CREATE POLICY "admin_all_applications" ON public.applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND rol = 'admin'
    )
  );

-- RLS adicional para cv_profiles (El exalumno puede ver el perfil de CV si aplicó a su posición)
DO $$
BEGIN
  IF EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'cv_profiles' AND n.nspname = 'public'
  ) THEN
      DROP POLICY IF EXISTS "alumni_can_view_applied_cvs" ON public.cv_profiles;
      CREATE POLICY "alumni_can_view_applied_cvs" ON public.cv_profiles
        FOR SELECT USING (
          user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.cv_id = cv_profiles.id
              AND a.alumni_id = auth.uid()
          )
        );
  END IF;
END $$;


-- 4. Tabla notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  content         TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  link_url        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "system_insert_notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- En entorno real, restringir a triggers/service role
