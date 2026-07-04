ALTER TABLE public.estudiantes
  ADD COLUMN IF NOT EXISTS proyecto_valor_monto DECIMAL,
  ADD COLUMN IF NOT EXISTS proyecto_valor_moneda TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_video_url TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_documento_url TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_foto_url TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_beneficios TEXT,
  ADD COLUMN IF NOT EXISTS proyecto_beneficios_fotos TEXT[];
