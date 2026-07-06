-- Migración para Módulo de Talleres

-- 1. Crear tabla 'talleres'
CREATE TABLE public.talleres (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    exalumno_id uuid NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    fecha_taller timestamp with time zone NOT NULL,
    modalidad text NOT NULL CHECK (modalidad IN ('ONLINE', 'PRESENCIAL', 'HIBRIDO')),
    estado text NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
    ubicacion_url text,
    cupos integer,
    multimedia_urls text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT talleres_pkey PRIMARY KEY (id),
    CONSTRAINT talleres_exalumno_id_fkey FOREIGN KEY (exalumno_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 2. Crear tabla 'talleres_postulaciones'
CREATE TABLE public.talleres_postulaciones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    taller_id uuid NOT NULL,
    estudiante_id uuid NOT NULL,
    estado text NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ACEPTADO', 'RECHAZADO')),
    mensaje text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT talleres_postulaciones_pkey PRIMARY KEY (id),
    CONSTRAINT talleres_postulaciones_taller_id_fkey FOREIGN KEY (taller_id) REFERENCES public.talleres(id) ON DELETE CASCADE,
    CONSTRAINT talleres_postulaciones_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT talleres_postulaciones_unica UNIQUE (taller_id, estudiante_id)
);

-- 3. Trigger de updated_at para talleres
CREATE OR REPLACE FUNCTION update_talleres_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_talleres_updated_at_trigger
BEFORE UPDATE ON public.talleres
FOR EACH ROW
EXECUTE FUNCTION update_talleres_updated_at();

-- 4. Trigger de updated_at para talleres_postulaciones
CREATE TRIGGER update_talleres_postulaciones_updated_at_trigger
BEFORE UPDATE ON public.talleres_postulaciones
FOR EACH ROW
EXECUTE FUNCTION update_talleres_updated_at();

-- 5. Configurar RLS (Row Level Security)

ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talleres_postulaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para talleres
-- Lectura: Públicos si están aprobados. Exalumnos ven los suyos. Admins ven todos.
CREATE POLICY "talleres_select_policy" ON public.talleres
    FOR SELECT USING (
        estado = 'APROBADO' 
        OR auth.uid() = exalumno_id 
        OR (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Inserción: Solo exalumnos
CREATE POLICY "talleres_insert_policy" ON public.talleres
    FOR INSERT WITH CHECK (
        auth.uid() = exalumno_id 
        AND (SELECT rol FROM public.users WHERE id = auth.uid()) = 'exalumno'
    );

-- Actualización: Exalumnos editan los suyos. Admins editan cualquiera.
CREATE POLICY "talleres_update_policy" ON public.talleres
    FOR UPDATE USING (
        auth.uid() = exalumno_id 
        OR (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Eliminación: Exalumnos eliminan los suyos. Admins eliminan cualquiera.
CREATE POLICY "talleres_delete_policy" ON public.talleres
    FOR DELETE USING (
        auth.uid() = exalumno_id 
        OR (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'
    );


-- Políticas para talleres_postulaciones
-- Lectura: Estudiantes ven las suyas, Exalumnos ven las de sus talleres, Admins ven todas.
CREATE POLICY "postulaciones_select_policy" ON public.talleres_postulaciones
    FOR SELECT USING (
        auth.uid() = estudiante_id
        OR auth.uid() IN (SELECT exalumno_id FROM public.talleres WHERE id = taller_id)
        OR (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Inserción: Solo estudiantes
CREATE POLICY "postulaciones_insert_policy" ON public.talleres_postulaciones
    FOR INSERT WITH CHECK (
        auth.uid() = estudiante_id 
        AND (SELECT rol FROM public.users WHERE id = auth.uid()) = 'estudiante'
    );

-- Actualización: Exalumnos actualizan el estado de las postulaciones a sus talleres, Estudiantes actualizan sus propias (para cancelar)
CREATE POLICY "postulaciones_update_policy" ON public.talleres_postulaciones
    FOR UPDATE USING (
        auth.uid() = estudiante_id
        OR auth.uid() IN (SELECT exalumno_id FROM public.talleres WHERE id = taller_id)
        OR (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Eliminación: Estudiantes cancelan sus postulaciones, Admins
CREATE POLICY "postulaciones_delete_policy" ON public.talleres_postulaciones
    FOR DELETE USING (
        auth.uid() = estudiante_id 
        OR (SELECT rol FROM public.users WHERE id = auth.uid()) = 'admin'
    );


-- 6. Crear Bucket de Storage (talleres_media)
INSERT INTO storage.buckets (id, name, public) VALUES ('talleres_media', 'talleres_media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para el bucket talleres_media
CREATE POLICY "Archivos talleres son de acceso publico" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'talleres_media');

CREATE POLICY "Solo exalumnos pueden subir archivos a talleres" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'talleres_media' 
    AND (SELECT rol FROM public.users WHERE id = auth.uid()) = 'exalumno'
);

CREATE POLICY "Propietarios pueden modificar sus archivos en talleres" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'talleres_media' AND auth.uid() = owner);

CREATE POLICY "Propietarios pueden eliminar sus archivos en talleres" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'talleres_media' AND auth.uid() = owner);

-- 7. Realtime publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.talleres;
ALTER PUBLICATION supabase_realtime ADD TABLE public.talleres_postulaciones;
