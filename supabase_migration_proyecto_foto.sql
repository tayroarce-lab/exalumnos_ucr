-- Ejecutar este comando en el SQL Editor de tu Dashboard de Supabase para añadir el campo de foto del proyecto:
ALTER TABLE public.estudiantes 
ADD COLUMN IF NOT EXISTS proyecto_foto_url text;
