-- =============================================================================
-- MIGRACIÓN 06: Catálogo de Niveles de Beca Socioeconómica UCR
-- Descripción : Crea la tabla lookup `scholarship_levels` con sus registros
--               correspondientes al sistema de becas de la Universidad de
--               Costa Rica. Incluye activación de Row Level Security (RLS).
-- Autor       : Sistema de Gestión Alumni UCR
-- Fecha       : 2026-06-05
-- =============================================================================

-- [VERDE - FUNCION: crear_tabla_scholarship_levels]
-- Creación de la tabla lookup para los niveles de beca socioeconómica.
-- Se usa `IF NOT EXISTS` para garantizar idempotencia en la migración.
CREATE TABLE IF NOT EXISTS public.scholarship_levels (
    -- Identificador único autoincremental de la fila
    id      SERIAL PRIMARY KEY,
    -- Código interno del sistema UCR (clave de negocio)
    codigo  VARCHAR(20)  NOT NULL UNIQUE,
    -- Etiqueta legible para mostrar en la interfaz de usuario
    nombre  VARCHAR(60)  NOT NULL,
    -- Marca temporal de creación del registro (auditoría)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- [VERDE - FUNCION: comentario_tabla]
-- Documentación de la tabla a nivel de base de datos para herramientas de BI.
-- -----------------------------------------------------------------------------
COMMENT ON TABLE  public.scholarship_levels           IS 'Catálogo de niveles de beca socioeconómica del sistema UCR.';
COMMENT ON COLUMN public.scholarship_levels.codigo    IS 'Código interno del nivel de beca (ej: sin_beca, beca_1..beca_5).';
COMMENT ON COLUMN public.scholarship_levels.nombre    IS 'Nombre visible del nivel de beca para la interfaz de usuario.';

-- =============================================================================
-- [VERDE - FUNCION: activar_rls_scholarship_levels]
-- Activación de Row Level Security (RLS) sobre la tabla.
-- La política permite lectura pública ya que es un catálogo de referencia,
-- pero restringe escritura exclusivamente a roles de servicio (service_role).
-- =============================================================================
ALTER TABLE public.scholarship_levels ENABLE ROW LEVEL SECURITY;

-- Política: cualquier usuario autenticado o anónimo puede leer el catálogo
CREATE POLICY "Lectura pública del catálogo de becas"
    ON public.scholarship_levels
    FOR SELECT
    USING (true);

-- =============================================================================
-- [VERDE - FUNCION: insertar_registros_beca]
-- Inserción de los 6 niveles de beca socioeconómica del sistema UCR.
-- Se usa ON CONFLICT DO NOTHING para garantizar idempotencia: si ya existen
-- los registros, la sentencia no falla ni genera duplicados.
-- =============================================================================
INSERT INTO public.scholarship_levels (codigo, nombre)
VALUES
    ('sin_beca', 'Sin beca'),
    ('beca_1',   'Beca 1'),
    ('beca_2',   'Beca 2'),
    ('beca_3',   'Beca 3'),
    ('beca_4',   'Beca 4'),
    ('beca_5',   'Beca 5')
ON CONFLICT (codigo) DO NOTHING;
