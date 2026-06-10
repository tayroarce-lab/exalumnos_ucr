CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  foto_url text,
  pais_ciudad text,
  linkedin_url text,
  bio text,
  academic jsonb DEFAULT '[]'::jsonb,
  empresa_actual text,
  cargo_actual text,
  sector_industria text[] DEFAULT '{}'::text[],
  anos_experiencia numeric,
  areas_de_interes text[] DEFAULT '{}'::text[],
  ofrece_mentoria boolean DEFAULT false,
  horas_mes_mentoria numeric,
  ofrece_empleo boolean DEFAULT false,
  ofrece_pasantia boolean DEFAULT false,
  ofrece_proyecto boolean DEFAULT false,
  ofrece_donacion_dinero boolean DEFAULT false,
  monto_maximo_donacion numeric,
  moneda_donacion text DEFAULT 'CRC',
  es_exalumno boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );
