-- Crear tabla lookup para Áreas de Interés
CREATE TABLE public.interest_areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.interest_areas ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura permitida para usuarios autenticados
CREATE POLICY "Lectura para usuarios autenticados de interest_areas"
    ON public.interest_areas FOR SELECT
    USING (auth.role() = 'authenticated');

-- Insertar los registros exactos del catálogo de Áreas de Interés
INSERT INTO public.interest_areas (id, name) VALUES
    ('tecnologia', 'Tecnología e Innovación'),
    ('salud', 'Salud y Bienestar'),
    ('educacion', 'Educación y Pedagogía'),
    ('ambiente', 'Medio Ambiente y Sostenibilidad'),
    ('arte_cultura', 'Arte y Cultura'),
    ('ciencias_sociales', 'Ciencias Sociales'),
    ('agro', 'Agro y Alimentación'),
    ('emprendimiento', 'Emprendimiento y Negocios'),
    ('ingenieria', 'Ingeniería y Construcción'),
    ('derecho', 'Derecho y Política Pública'),
    ('economia', 'Economía y Finanzas'),
    ('comunicacion', 'Comunicación y Medios'),
    ('turismo', 'Turismo y Patrimonio'),
    ('investigacion', 'Investigación Científica');
