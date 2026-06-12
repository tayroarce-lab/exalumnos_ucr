-- Añade la columna hobbies a la tabla users como array de texto
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS hobbies text[] DEFAULT '{}'::text[];

-- Añade comentario a la columna para documentación
COMMENT ON COLUMN public.users.hobbies IS 'Lista de hobbies e intereses personales, utilizado para el matching de afinidad';
