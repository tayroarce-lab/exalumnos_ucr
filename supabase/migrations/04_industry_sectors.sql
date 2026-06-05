-- Crear tabla lookup para Sectores Industriales
CREATE TABLE public.industry_sectors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.industry_sectors ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura permitida para usuarios autenticados
CREATE POLICY "Lectura para usuarios autenticados de industry_sectors"
    ON public.industry_sectors FOR SELECT
    USING (auth.role() = 'authenticated');

-- Insertar los registros del catálogo alineados al mercado profesional local
INSERT INTO public.industry_sectors (id, name) VALUES
    ('tecnologia_ti', 'Tecnología, Software y TI'),
    ('finanzas_banca', 'Finanzas, Banca y Seguros'),
    ('salud_medicina', 'Salud, Médica y Farmacéutica'),
    ('ingenieria_construccion', 'Ingeniería, Construcción y Arquitectura'),
    ('educacion_academia', 'Educación y Academia'),
    ('manufactura_industria', 'Manufactura y Producción'),
    ('logistica_transporte', 'Logística, Transporte y Distribución'),
    ('turismo_hospitalidad', 'Turismo, Hotelería y Gastronomía'),
    ('agro_alimentos', 'Agropecuario y Alimentos'),
    ('comercio_retail', 'Comercio, Ventas y Retail'),
    ('gobierno_publico', 'Gobierno y Sector Público'),
    ('servicios_profesionales', 'Consultoría y Servicios Profesionales');
