-- MIGRACIÓN: Sistema de Reporte de Perfiles
CREATE TABLE public.reportes_perfiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid NOT NULL,
    reported_id uuid NOT NULL,
    motivo text NOT NULL,
    estado text DEFAULT 'pendiente' NOT NULL, -- 'pendiente', 'revisado', 'desestimado'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT reportes_perfiles_pkey PRIMARY KEY (id),
    CONSTRAINT reportes_perfiles_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT reportes_perfiles_reported_id_fkey FOREIGN KEY (reported_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.reportes_perfiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create reports
CREATE POLICY "Users can create reports"
    ON public.reportes_perfiles
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Policy: Users can view their own submitted reports (optional, but good for completeness)
CREATE POLICY "Users can view their own reports"
    ON public.reportes_perfiles
    FOR SELECT
    USING (auth.uid() = reporter_id);

-- Admins can view/update all reports (Assuming admin check is handled at app level with service role, or we could add a policy if users have a roles table, but adminClient bypasses RLS anyway).
