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

ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir inserciones públicas" ON public.support_queries;
DROP POLICY IF EXISTS "Admin ve todas las consultas" ON public.support_queries;
DROP POLICY IF EXISTS "Admin puede actualizar consultas" ON public.support_queries;

CREATE POLICY "Permitir inserciones públicas" 
ON public.support_queries 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Admin ve todas las consultas" 
ON public.support_queries 
FOR SELECT 
TO authenticated
USING (
  (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'::text
);

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
