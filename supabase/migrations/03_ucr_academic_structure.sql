-- Crear tabla de Sedes y Recintos de la UCR
CREATE TABLE public.ucr_campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    short_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para la tabla de sedes
ALTER TABLE public.ucr_campuses ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura pública/autenticada para sedes
CREATE POLICY "Lectura publica de sedes ucr_campuses"
    ON public.ucr_campuses FOR SELECT
    USING (true);

-- Crear tabla de Áreas/Facultades de la UCR
CREATE TABLE public.ucr_faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para la tabla de facultades
ALTER TABLE public.ucr_faculties ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura pública/autenticada para facultades
CREATE POLICY "Lectura publica de facultades ucr_faculties"
    ON public.ucr_faculties FOR SELECT
    USING (true);

-- Insertar datos reales de Sedes UCR
INSERT INTO public.ucr_campuses (name, short_name) VALUES
    ('Sede Rodrigo Facio (Central - San Pedro)', 'Rodrigo Facio'),
    ('Sede de Occidente (San Ramón)', 'Occidente'),
    ('Sede del Atlántico (Turrialba)', 'Atlántico'),
    ('Sede de Guanacaste (Liberia)', 'Guanacaste'),
    ('Sede del Caribe (Limón)', 'Caribe'),
    ('Sede del Pacífico (Puntarenas)', 'Pacífico'),
    ('Sede del Sur (Golfito)', 'Sur'),
    ('Sede Interuniversitaria de Alajuela', 'Interuniversitaria');

-- Insertar datos reales de Facultades UCR
INSERT INTO public.ucr_faculties (name) VALUES
    ('Ciencias Agroalimentarias'),
    ('Artes y Letras'),
    ('Ciencias Básicas'),
    ('Ciencias Sociales'),
    ('Ciencias Económicas'),
    ('Derecho'),
    ('Educación'),
    ('Ingeniería'),
    ('Salud');
