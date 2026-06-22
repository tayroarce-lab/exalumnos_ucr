-- =============================================================================
-- MIGRACIÓN: Corrección de políticas RLS en tabla donations
-- Problema : Las políticas usaban `tipo = 'admin'` pero la columna real
--             en public.users se llama `rol`, no `tipo`.
--             Esto impedía que los admins vieran o actualizaran donaciones.
-- =============================================================================

-- Eliminar políticas incorrectas
DROP POLICY IF EXISTS "Admin ve todas las donaciones"      ON public.donations;
DROP POLICY IF EXISTS "Admin puede actualizar donaciones"  ON public.donations;
DROP POLICY IF EXISTS "Admin ve todos los comprobantes"    ON storage.objects;

-- Recrear política SELECT para admin (usando columna correcta: rol)
CREATE POLICY "Admin ve todas las donaciones"
    ON public.donations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Recrear política UPDATE para admin (usando columna correcta: rol)
CREATE POLICY "Admin puede actualizar donaciones"
    ON public.donations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Recrear política de storage para admin
CREATE POLICY "Admin ve todos los comprobantes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND rol = 'admin'
    ));
