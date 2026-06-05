-- ============================================================
-- MIGRACIÓN 02: Configuración de Storage y Políticas RLS
-- ============================================================

-- 1. Crear buckets si no existen
-- Avatars: Público para que las fotos de perfil se vean en los directorios.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Comprobantes: Privado, por seguridad financiera.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprobantes', 'comprobantes', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS explícitamente en la tabla de objetos
-- (Supabase lo trae por defecto, pero esto garantiza la barrera).
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS: BUCKET 'avatars'
-- ============================================================

-- A. Lectura Pública: Cualquier usuario puede ver fotos de perfil.
CREATE POLICY "Avatares_LecturaPublica"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- B. Inserción: Solo usuarios autenticados pueden subir fotos.
CREATE POLICY "Avatares_InsertarAutenticado"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- C. Actualización: Un usuario solo puede actualizar archivos de los que es dueño.
CREATE POLICY "Avatares_ActualizarPropios"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

-- D. Eliminación: Un usuario solo puede borrar sus propios avatares.
CREATE POLICY "Avatares_BorrarPropios"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- ============================================================
-- POLÍTICAS RLS CRÍTICAS: BUCKET 'comprobantes'
-- ============================================================

-- A. Lectura Privada Estricta:
-- Solo pueden ver el comprobante:
-- 1. El dueño (el exalumno que lo subió).
-- 2. Un usuario de tipo 'admin'.
-- 3. El estudiante que recibe la donación (si su UUID está en el registro).
CREATE POLICY "Comprobantes_LecturaPrivada"
ON storage.objects FOR SELECT
TO authenticated
USING ( 
    bucket_id = 'comprobantes' 
    AND (
        -- Es el dueño que subió el archivo
        auth.uid() = owner 
        OR 
        -- Es administrador de la fundación
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND tipo = 'admin'
        )
        OR 
        -- Es el estudiante beneficiario de esa donación en particular
        EXISTS (
            SELECT 1 FROM public.donaciones
            WHERE comprobante_url = name AND proyecto_estudiante_id = auth.uid()
        )
    )
);

-- B. Inserción Restringida: Solo exalumnos pueden subir comprobantes.
CREATE POLICY "Comprobantes_InsertarExalumnos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
    bucket_id = 'comprobantes'
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND tipo = 'exalumno'
    )
);

-- C. Actualización Denegada: 
-- Un comprobante financiero no debería modificarse una vez subido.
-- (No se crea política de UPDATE, por defecto es DENY bajo RLS).

-- D. Eliminación Restringida: Solo el dueño puede borrarlo si se equivocó
-- (Opcionalmente el admin, pero dejémoslo en el dueño).
CREATE POLICY "Comprobantes_BorrarPropios"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'comprobantes' AND auth.uid() = owner );
