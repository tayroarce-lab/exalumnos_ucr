-- =============================================================================
-- MIGRACIÓN: RF-11 Curriculum Vitae (Esquema y RLS)
-- =============================================================================

-- 1. cv_profiles
CREATE TABLE IF NOT EXISTS public.cv_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_complete BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.cv_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only_profiles" ON public.cv_profiles
  FOR ALL USING (user_id = auth.uid());

-- Trigger para updated_at en cv_profiles
CREATE OR REPLACE FUNCTION update_cv_profiles_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_cv_profiles_modtime ON public.cv_profiles;
CREATE TRIGGER update_cv_profiles_modtime
BEFORE UPDATE ON public.cv_profiles
FOR EACH ROW EXECUTE PROCEDURE update_cv_profiles_modtime();

-- 2. cv_academic_info
CREATE TABLE IF NOT EXISTS public.cv_academic_info (
  profile_id UUID PRIMARY KEY REFERENCES public.cv_profiles(id) ON DELETE CASCADE,
  university TEXT DEFAULT 'Universidad de Costa Rica',
  career TEXT NOT NULL,
  academic_level TEXT NOT NULL CHECK (academic_level IN ('Bachillerato', 'Licenciatura', 'Maestría', 'Doctorado')),
  gpa NUMERIC(4,2),
  entry_year SMALLINT NOT NULL,
  relevant_courses TEXT[],
  graduation_project_title TEXT,
  graduation_project_description TEXT
);
ALTER TABLE public.cv_academic_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only_academic" ON public.cv_academic_info
  FOR ALL USING (profile_id IN (SELECT id FROM public.cv_profiles WHERE user_id = auth.uid()));

-- 3. cv_experiences
CREATE TABLE IF NOT EXISTS public.cv_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.cv_profiles(id) ON DELETE CASCADE,
  experience_type TEXT NOT NULL CHECK (experience_type IN ('Empleo', 'Voluntariado', 'Proyecto universitario', 'Asistencia', 'Investigación')),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_month SMALLINT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
  start_year SMALLINT NOT NULL,
  end_month SMALLINT CHECK (end_month BETWEEN 1 AND 12),
  end_year SMALLINT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  bullets TEXT[] DEFAULT '{}' CHECK (array_length(bullets, 1) <= 5)
);
ALTER TABLE public.cv_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only_experiences" ON public.cv_experiences
  FOR ALL USING (profile_id IN (SELECT id FROM public.cv_profiles WHERE user_id = auth.uid()));

-- Función para validar la longitud de cada string en el array de viñetas
CREATE OR REPLACE FUNCTION check_bullets_length() RETURNS trigger AS $$
DECLARE
  bullet text;
BEGIN
  IF NEW.bullets IS NOT NULL THEN
    FOREACH bullet IN ARRAY NEW.bullets LOOP
      IF char_length(bullet) > 120 THEN
        RAISE EXCEPTION 'Cada viñeta debe tener un máximo de 120 caracteres';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_bullets_length ON public.cv_experiences;
CREATE TRIGGER trg_check_bullets_length
  BEFORE INSERT OR UPDATE ON public.cv_experiences
  FOR EACH ROW EXECUTE PROCEDURE check_bullets_length();

-- 4. cv_skills
CREATE TABLE IF NOT EXISTS public.cv_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.cv_profiles(id) ON DELETE CASCADE,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('technical', 'soft', 'language')),
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('Básico', 'Intermedio', 'Avanzado', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);
ALTER TABLE public.cv_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only_skills" ON public.cv_skills
  FOR ALL USING (profile_id IN (SELECT id FROM public.cv_profiles WHERE user_id = auth.uid()));

-- 5. cv_certifications
CREATE TABLE IF NOT EXISTS public.cv_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.cv_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  issued_month SMALLINT CHECK (issued_month BETWEEN 1 AND 12),
  issued_year SMALLINT,
  verification_url TEXT
);
ALTER TABLE public.cv_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only_certs" ON public.cv_certifications
  FOR ALL USING (profile_id IN (SELECT id FROM public.cv_profiles WHERE user_id = auth.uid()));
