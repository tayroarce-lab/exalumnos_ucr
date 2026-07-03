-- Ejecutar esta consulta en el editor SQL de tu panel de Supabase:

CREATE TABLE IF NOT EXISTS public.support_queries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  query_type text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'Pendiente',
  response text NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas si ya existen para evitar errores de duplicado
DROP POLICY IF EXISTS "Permitir inserciones públicas" ON public.support_queries;
DROP POLICY IF EXISTS "Admin ve todas las consultas" ON public.support_queries;
DROP POLICY IF EXISTS "Admin puede actualizar consultas" ON public.support_queries;

-- Crear política para permitir que cualquiera pueda insertar consultas
CREATE POLICY "Permitir inserciones públicas" 
ON public.support_queries 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Crear política para permitir a los administradores ver todas las consultas
CREATE POLICY "Admin ve todas las consultas" 
ON public.support_queries 
FOR SELECT 
TO authenticated
USING (
  (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'::text
);

-- Crear política para permitir a los administradores actualizar las consultas (cambiar estado y responder)
CREATE POLICY "Admin puede actualizar consultas" 
ON public.support_queries 
FOR UPDATE 
TO authenticated
USING (
  (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'::text
)
WITH CHECK (
  (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'::text
);
