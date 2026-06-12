-- =============================================================================
-- MIGRACIÓN: RF-12: IA de Adaptación de CV a Posiciones
-- Descripción: Crea la tabla cv_versiones para almacenar las variantes optimizadas
--              de CVs por cada posición con límite de 10 por usuario.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.cv_versiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    posicion_id UUID REFERENCES public.posiciones(id) ON DELETE SET NULL,
    titulo_version TEXT NOT NULL,
    contenido JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.cv_versiones ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Los usuarios pueden ver sus propias versiones de CV"
    ON public.cv_versiones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias versiones de CV"
    ON public.cv_versiones FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias versiones de CV"
    ON public.cv_versiones FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias versiones de CV"
    ON public.cv_versiones FOR DELETE
    USING (auth.uid() = user_id);

-- Función y Trigger para limitar a 10 versiones por usuario
CREATE OR REPLACE FUNCTION public.check_max_cv_versiones()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    version_count INT;
BEGIN
    SELECT count(*)
    INTO version_count
    FROM public.cv_versiones
    WHERE user_id = NEW.user_id;

    IF version_count >= 10 THEN
        RAISE EXCEPTION 'Has alcanzado el límite máximo de 10 versiones adaptadas. Elimina una anterior para continuar.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_max_cv_versiones ON public.cv_versiones;
CREATE TRIGGER tr_check_max_cv_versiones
    BEFORE INSERT ON public.cv_versiones
    FOR EACH ROW
    EXECUTE FUNCTION public.check_max_cv_versiones();

COMMIT;
