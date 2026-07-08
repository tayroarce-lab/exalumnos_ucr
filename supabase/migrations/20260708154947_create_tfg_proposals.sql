-- =============================================================================
-- MIGRACIÓN: Borradores de Trabajos Finales de Graduación (TFG)
-- Descripción : Crea la tabla para almacenar el estado y progreso de la 
--               formulación del TFG de cada estudiante generado vía IA.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.tfg_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_type_id INTEGER REFERENCES public.project_types(id) ON DELETE SET NULL,
    thematic_area_id UUID REFERENCES public.catalogo_areas_interes(id) ON DELETE SET NULL,
    
    titulo VARCHAR(255),
    descripcion TEXT,
    
    introduccion TEXT,
    objetivos TEXT,
    marco_teorico TEXT,
    metodologia TEXT,
    referencias TEXT,
    cronograma TEXT,
    
    porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    is_completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_tfg_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tfg_proposals_modtime
    BEFORE UPDATE ON public.tfg_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_tfg_updated_at_column();

-- Políticas RLS
ALTER TABLE public.tfg_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias propuestas"
    ON public.tfg_proposals FOR SELECT
    USING (auth.uid() = estudiante_id);

CREATE POLICY "Los usuarios pueden insertar sus propias propuestas"
    ON public.tfg_proposals FOR INSERT
    WITH CHECK (auth.uid() = estudiante_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias propuestas"
    ON public.tfg_proposals FOR UPDATE
    USING (auth.uid() = estudiante_id);

CREATE POLICY "Los usuarios pueden borrar sus propias propuestas"
    ON public.tfg_proposals FOR DELETE
    USING (auth.uid() = estudiante_id);

COMMIT;
