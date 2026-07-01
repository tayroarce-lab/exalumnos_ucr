-- Ejecutar este comando en el SQL Editor de tu Dashboard de Supabase para añadir los campos de beneficios para donadores del proyecto:
ALTER TABLE public.estudiantes 
ADD COLUMN IF NOT EXISTS proyecto_beneficios text,
ADD COLUMN IF NOT EXISTS proyecto_beneficios_foto_url text;
