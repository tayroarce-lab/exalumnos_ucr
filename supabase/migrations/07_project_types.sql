-- =============================================================================
-- MIGRACIÓN 07: Catálogo de Tipos de Proyecto (Modalidades de Graduación UCR)
-- Descripción : Crea la tabla lookup `project_types` con los cuatro tipos de
--               modalidad de graduación reconocidos por la Universidad de
--               Costa Rica. Incluye activación de RLS y política de lectura.
-- Autor       : Sistema de Gestión Alumni UCR
-- Fecha       : 2026-06-05
-- =============================================================================

-- [VERDE - FUNCION: crear_tabla_project_types]
-- Crea la tabla de referencia para las modalidades de graduación UCR.
-- Se usa IF NOT EXISTS para garantizar idempotencia en el proceso de migración.
CREATE TABLE IF NOT EXISTS public.project_types (
    -- Identificador único autoincremental de la fila
    id         SERIAL       PRIMARY KEY,
    -- Código interno (slug) del tipo de proyecto, usado como clave de negocio
    codigo     VARCHAR(30)  NOT NULL UNIQUE,
    -- Nombre completo y descriptivo de la modalidad, visible en la interfaz
    nombre     VARCHAR(100) NOT NULL,
    -- Marca temporal de creación del registro para auditoría
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- [VERDE - FUNCION: comentarios_tabla]
-- Documentación a nivel de base de datos para herramientas de BI y ORM.
-- -----------------------------------------------------------------------------
COMMENT ON TABLE  public.project_types        IS 'Catálogo de tipos de proyecto (modalidades de graduación) del sistema UCR.';
COMMENT ON COLUMN public.project_types.codigo IS 'Slug interno de la modalidad (ej: tfg, tesis, practica_dirigida, seminario).';
COMMENT ON COLUMN public.project_types.nombre IS 'Nombre completo de la modalidad visible en la interfaz de usuario.';

-- =============================================================================
-- [VERDE - FUNCION: activar_rls_project_types]
-- Activación de Row Level Security sobre la tabla de tipos de proyecto.
-- Política de lectura pública: es un catálogo de referencia estático,
-- accesible tanto para usuarios anónimos como autenticados.
-- La escritura queda restringida al rol service_role de Supabase.
-- =============================================================================
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

-- Política: acceso de lectura irrestricto para el catálogo de modalidades
CREATE POLICY "Lectura pública del catálogo de tipos de proyecto"
    ON public.project_types
    FOR SELECT
    USING (true);

-- =============================================================================
-- [VERDE - FUNCION: insertar_tipos_proyecto]
-- Inserción de las 4 modalidades de graduación reconocidas por la UCR.
-- ON CONFLICT DO NOTHING garantiza idempotencia: si ya existen los registros,
-- la sentencia no falla ni genera duplicados.
-- =============================================================================
INSERT INTO public.project_types (codigo, nombre)
VALUES
    ('tfg',               'TFG (Trabajo de Fin de Grado)'),
    ('tesis',             'Tesis'),
    ('practica_dirigida', 'Práctica dirigida'),
    ('seminario',         'Seminario')
ON CONFLICT (codigo) DO NOTHING;
