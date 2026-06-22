-- =============================================================================
-- MIGRACIÓN 12: Modelos para el Editor de CV ATS-Friendly
-- Ubicación: supabase/migrations/12_editor_cv_modelos.sql
-- Descripción: Creación de tablas estructuradas y atomizadas para persistir
--              el CV del estudiante bajo estrictas prácticas de reclutamiento.
-- =============================================================================

-- [VERDE - FUNCION: crear_tabla_cv_educacion]
-- Almacena la educación superior. Se instruye omitir secundaria.
CREATE TABLE IF NOT EXISTS public.cv_educacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    institucion VARCHAR(255) NOT NULL,
    grado_obtenido VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    es_actual BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [VERDE - FUNCION: crear_tabla_cv_experiencia]
-- Experiencia laboral estructurada con viñetas en formato STAR.
CREATE TABLE IF NOT EXISTS public.cv_experiencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    titulo_puesto VARCHAR(255) NOT NULL,
    empresa VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    es_actual BOOLEAN DEFAULT FALSE,
    -- Almacena un arreglo de strings (viñetas de impacto)
    vinetas_star JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [VERDE - FUNCION: crear_tabla_cv_proyectos]
-- Proyectos académicos o personales (ej. Proyecto Aguacate).
CREATE TABLE IF NOT EXISTS public.cv_proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    nombre_proyecto VARCHAR(255) NOT NULL DEFAULT 'Proyecto Aguacate',
    descripcion TEXT NOT NULL,
    tecnologias_usadas JSONB NOT NULL DEFAULT '[]'::jsonb,
    url_repositorio VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [VERDE - FUNCION: crear_tabla_cv_habilidades]
-- Separación estricta entre habilidades duras/técnicas y blandas.
CREATE TABLE IF NOT EXISTS public.cv_habilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    habilidades_tecnicas JSONB NOT NULL DEFAULT '[]'::jsonb,
    habilidades_blandas JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- [VERDE - FUNCION: activar_rls_cv]
-- Políticas de seguridad para que cada estudiante gestione exclusivamente su CV.
-- =============================================================================

ALTER TABLE public.cv_educacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_experiencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_habilidades ENABLE ROW LEVEL SECURITY;

-- Políticas de Educación
CREATE POLICY "Estudiante gestiona su educacion" ON public.cv_educacion 
    FOR ALL USING (auth.uid() = estudiante_id) WITH CHECK (auth.uid() = estudiante_id);
    
-- Políticas de Experiencia
CREATE POLICY "Estudiante gestiona su experiencia" ON public.cv_experiencia 
    FOR ALL USING (auth.uid() = estudiante_id) WITH CHECK (auth.uid() = estudiante_id);
    
-- Políticas de Proyectos
CREATE POLICY "Estudiante gestiona sus proyectos" ON public.cv_proyectos 
    FOR ALL USING (auth.uid() = estudiante_id) WITH CHECK (auth.uid() = estudiante_id);
    
-- Políticas de Habilidades
CREATE POLICY "Estudiante gestiona sus habilidades" ON public.cv_habilidades 
    FOR ALL USING (auth.uid() = estudiante_id) WITH CHECK (auth.uid() = estudiante_id);
