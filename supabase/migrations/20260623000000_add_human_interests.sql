-- Add human interests columns to users for matching and directory
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS deportes text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS musica text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS idiomas text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS sobre_mi_personal text;

COMMENT ON COLUMN public.users.deportes IS 'Lista de deportes, utilizado para el matching de afinidad';
COMMENT ON COLUMN public.users.musica IS 'Lista de intereses musicales, utilizado para el matching de afinidad';
COMMENT ON COLUMN public.users.idiomas IS 'Lista de idiomas que domina el usuario';
