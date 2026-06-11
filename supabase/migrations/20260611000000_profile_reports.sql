-- Migration 20260611000000_profile_reports.sql

CREATE TYPE report_reason_enum AS ENUM ('Spam', 'Perfil Falso', 'Comportamiento Inapropiado', 'Otro');
CREATE TYPE report_status_enum AS ENUM ('pendiente', 'en_revision', 'resuelto', 'desestimado');

CREATE TABLE public.profile_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id),
    reported_user_id UUID NOT NULL REFERENCES public.users(id),
    reason report_reason_enum NOT NULL,
    description TEXT,
    status report_status_enum NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON public.profile_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id AND auth.uid() != reported_user_id);

CREATE POLICY "Admins can view all reports"
ON public.profile_reports
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.rol IN ('admin', 'superadmin')
    )
);

CREATE POLICY "Admins can update reports"
ON public.profile_reports
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.rol IN ('admin', 'superadmin')
    )
);

-- Updated at trigger
CREATE TRIGGER set_profile_reports_updated_at
BEFORE UPDATE ON public.profile_reports
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Audit trigger
CREATE TRIGGER disparador_auditoria_profile_reports
    AFTER INSERT OR UPDATE OR DELETE
    ON public.profile_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_auditoria();

COMMENT ON TRIGGER disparador_auditoria_profile_reports ON public.profile_reports IS
    'Registra en audit_logs la creacion y actualizacion de los reportes de perfil';
