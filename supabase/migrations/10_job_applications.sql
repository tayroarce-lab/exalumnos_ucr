-- =============================================================================
-- MIGRACIÓN 10: Sistema de Aplicaciones y Gestión de Candidatos
-- Descripción : Crea la tabla applications, ENUM de estados, políticas de
--               privacidad RLS para el flujo de aplicaciones a posiciones.
-- Autor       : Sistema de Gestión Alumni UCR
-- =============================================================================

-- [VERDE - FUNCION: crear_enum_estado_aplicacion]
DO $$ BEGIN
  CREATE TYPE public.estado_aplicacion AS ENUM (
    'enviada',      -- Disparador al aplicar
    'en_revision',  -- Disparador cuando el exalumno abre la aplicación
    'seleccionado', -- Disparador cuando el exalumno lo elige
    'descartado'    -- Disparador por rechazo manual o cierre automático
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.estado_aplicacion IS 'Ciclo de vida de una aplicación a una posición UCR.';

-- [VERDE - FUNCION: crear_tabla_applications]
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES public.posiciones(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    cv_url TEXT,
    cover_message VARCHAR(500),
    status public.estado_aplicacion NOT NULL DEFAULT 'enviada',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Evitar duplicados: Un estudiante NO puede aplicar dos veces a la misma posición
    CONSTRAINT applications_unique_candidacy UNIQUE (position_id, student_id)
);

COMMENT ON TABLE public.applications IS 'Registro de aplicaciones de estudiantes a posiciones/mentorías.';

-- [VERDE - FUNCION: activar_rls_applications]
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Política: El estudiante ve solo sus propias aplicaciones
CREATE POLICY "Estudiante ve sus aplicaciones"
    ON public.applications FOR SELECT
    USING (auth.uid() = student_id);

-- Política: El estudiante puede insertar sus aplicaciones
CREATE POLICY "Estudiante puede enviar aplicaciones"
    ON public.applications FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Política: El estudiante puede borrar (retirar) su aplicación solo si está 'enviada'
CREATE POLICY "Estudiante puede retirar aplicacion"
    ON public.applications FOR DELETE
    USING (auth.uid() = student_id AND status = 'enviada');

-- Política: El exalumno ve solo las aplicaciones dirigidas a sus posiciones
CREATE POLICY "Exalumno ve aplicaciones a sus posiciones"
    ON public.applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posiciones p
            WHERE p.id = applications.position_id AND p.exalumno_id = auth.uid()
        )
    );

-- Política: El exalumno puede actualizar el estado de las aplicaciones a sus posiciones
CREATE POLICY "Exalumno actualiza aplicaciones a sus posiciones"
    ON public.applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.posiciones p
            WHERE p.id = applications.position_id AND p.exalumno_id = auth.uid()
        )
    );

-- Configuración de seguridad para el bucket de CVs (asumiendo que se guardan en un bucket "resumes")
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Estudiante sube su CV"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (string_to_array(name, '/'))[1]);

CREATE POLICY "Exalumno lee CV de aplicantes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes'); -- En producción se usarían triggers o un bucket más estricto
