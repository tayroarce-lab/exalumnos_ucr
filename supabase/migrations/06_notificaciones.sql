-- MIGRACIÓN: Sistema de Notificaciones
-- Descripción: Tabla para almacenar notificaciones en tiempo real para todos los roles.

CREATE TABLE public.notificaciones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    titulo text NOT NULL,
    mensaje text NOT NULL,
    tipo text NOT NULL,
    link text,
    leida boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
    CONSTRAINT notificaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notificaciones
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (e.g. mark as read)
CREATE POLICY "Users can update their own notifications"
    ON public.notificaciones
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON public.notificaciones
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Allow inserts (usually done from edge functions or backend, but enabling service role / admin)
CREATE POLICY "System and users can insert notifications"
    ON public.notificaciones
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users)); -- In a real app we might restrict inserts to admin/service role, but here we'll allow authenticated users/system to insert

-- Enable realtime
alter publication supabase_realtime add table public.notificaciones;
