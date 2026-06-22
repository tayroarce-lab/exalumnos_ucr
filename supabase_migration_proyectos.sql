-- 1. Añadir columnas a la tabla estudiantes
ALTER TABLE public.estudiantes 
ADD COLUMN IF NOT EXISTS proyecto_valor_monto numeric,
ADD COLUMN IF NOT EXISTS proyecto_valor_moneda text CHECK (proyecto_valor_moneda IN ('CRC', 'USD')),
ADD COLUMN IF NOT EXISTS proyecto_video_url text,
ADD COLUMN IF NOT EXISTS proyecto_documento_url text;

-- 2. Crear un bucket de almacenamiento para los proyectos (si se quiere subir archivos)
-- Asegúrate de que este código se ejecuta con los permisos necesarios.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proyectos', 'proyectos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de seguridad para el bucket de proyectos
-- Permitir a cualquier usuario autenticado subir archivos a su propia carpeta
CREATE POLICY "Estudiantes pueden subir archivos de proyecto"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proyectos'
);

-- Permitir a cualquier persona leer los archivos
CREATE POLICY "Cualquier persona puede leer archivos de proyecto"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proyectos');

-- Permitir a los usuarios actualizar o borrar sus propios archivos
CREATE POLICY "Estudiantes pueden actualizar sus archivos de proyecto"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'proyectos');

CREATE POLICY "Estudiantes pueden borrar sus archivos de proyecto"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'proyectos');
