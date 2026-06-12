-- ============================================================
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- PROPÓSITO: Corrige el routing roto (todos iban a /dashboard)
-- ============================================================

-- 1) Añadir columna suspension_reason (faltaba → middleware fallaba)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT DEFAULT NULL;

-- 2) Reparar rol de usuarios que quedaron sin rol correcto
UPDATE public.users u
SET rol = COALESCE(
  (SELECT COALESCE(
    au.raw_user_meta_data->>'rol',
    au.raw_user_meta_data->>'tipo',
    CASE WHEN au.email LIKE '%@ucr.ac.cr' THEN 'estudiante' ELSE 'exalumno' END
  ) FROM auth.users au WHERE au.id = u.id),
  'estudiante'
)
WHERE u.rol IS NULL OR u.rol = '';

-- 3) Actualizar políticas RLS que usaban u.tipo (columna dropeada) → u.rol
DROP POLICY IF EXISTS "posiciones_insert_exalumno" ON public.posiciones;
CREATE POLICY "posiciones_insert_exalumno" ON public.posiciones FOR INSERT TO authenticated
  WITH CHECK (exalumno_id = auth.uid() AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'exalumno'));

DROP POLICY IF EXISTS "posiciones_delete_own" ON public.posiciones;
CREATE POLICY "posiciones_delete_own" ON public.posiciones FOR DELETE TO authenticated
  USING (exalumno_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

DROP POLICY IF EXISTS "matches_select_own" ON public.matches;
CREATE POLICY "matches_select_own" ON public.matches FOR SELECT TO authenticated
  USING (exalumno_id = auth.uid() OR estudiante_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

DROP POLICY IF EXISTS "matches_insert_allowed" ON public.matches;
CREATE POLICY "matches_insert_allowed" ON public.matches FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin') OR exalumno_id = auth.uid() OR estudiante_id = auth.uid());

DROP POLICY IF EXISTS "matches_update_allowed" ON public.matches;
CREATE POLICY "matches_update_allowed" ON public.matches FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

DROP POLICY IF EXISTS "aplicaciones_select_own" ON public.aplicaciones;
CREATE POLICY "aplicaciones_select_own" ON public.aplicaciones FOR SELECT TO authenticated
  USING (estudiante_id = auth.uid() OR EXISTS (SELECT 1 FROM public.posiciones p WHERE p.id = posicion_id AND p.exalumno_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

DROP POLICY IF EXISTS "aplicaciones_insert_estudiante" ON public.aplicaciones;
CREATE POLICY "aplicaciones_insert_estudiante" ON public.aplicaciones FOR INSERT TO authenticated
  WITH CHECK (estudiante_id = auth.uid() AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'estudiante'));

DROP POLICY IF EXISTS "aplicaciones_update_exalumno_admin" ON public.aplicaciones;
CREATE POLICY "aplicaciones_update_exalumno_admin" ON public.aplicaciones FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posiciones p WHERE p.id = posicion_id AND p.exalumno_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

DROP POLICY IF EXISTS "reportes_select_admin_propio" ON public.reportes_perfil;
CREATE POLICY "reportes_select_admin_propio" ON public.reportes_perfil FOR SELECT TO authenticated
  USING (reportado_por = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

DROP POLICY IF EXISTS "reportes_update_admin" ON public.reportes_perfil;
CREATE POLICY "reportes_update_admin" ON public.reportes_perfil FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

-- 4) Reparar el trigger de protección de columnas (usaba OLD.tipo que ya no existe)
CREATE OR REPLACE FUNCTION public.fn_users_protect_columns()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.users WHERE id = (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid AND rol = 'admin') THEN
      RETURN NEW;
    END IF;
  END IF;
  NEW.rol = OLD.rol;
  NEW.reportes_recibidos = OLD.reportes_recibidos;
  NEW.email_verified = OLD.email_verified;
  RETURN NEW;
END;
$$;

-- Verificar resultado final
SELECT id, email, rol, activo, suspension_reason IS NOT NULL as tiene_suspension FROM public.users ORDER BY created_at DESC LIMIT 10;
