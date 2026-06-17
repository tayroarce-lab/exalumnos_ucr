-- Reemplazar todas las referencias a u.tipo = 'admin' por u.rol = 'admin' en las politicas RLS
-- ya que la columna tipo fue reemplazada por rol

-- 1. exalumnos_select
DROP POLICY IF EXISTS "exalumnos_select" ON public.exalumnos;
CREATE POLICY "exalumnos_select" ON public.exalumnos FOR SELECT TO authenticated
USING (
  visible_en_directorio = TRUE
  OR user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 2. estudiantes_select_full
DROP POLICY IF EXISTS "estudiantes_select_full" ON public.estudiantes;
CREATE POLICY "estudiantes_select_full" ON public.estudiantes FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
  OR EXISTS (
    SELECT 1 FROM public.matches m JOIN public.users u ON u.id = auth.uid()
    WHERE u.rol = 'exalumno' AND m.exalumno_id = auth.uid() AND m.estudiante_id = public.estudiantes.user_id AND m.estado = 'activo'
  )
  OR visible_en_directorio = TRUE
);

-- 3. posiciones_delete_own
DROP POLICY IF EXISTS "posiciones_delete_own" ON public.posiciones;
CREATE POLICY "posiciones_delete_own" ON public.posiciones FOR DELETE TO authenticated
USING (
  exalumno_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 4. matches_insert_allowed
DROP POLICY IF EXISTS "matches_insert_allowed" ON public.matches;
CREATE POLICY "matches_insert_allowed" ON public.matches FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
  OR exalumno_id = auth.uid()
  OR estudiante_id = auth.uid()
);

-- 5. matches_update_allowed
DROP POLICY IF EXISTS "matches_update_allowed" ON public.matches;
CREATE POLICY "matches_update_allowed" ON public.matches FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

-- 6. donaciones_select_own
DROP POLICY IF EXISTS "donaciones_select_own" ON public.donaciones;
CREATE POLICY "donaciones_select_own" ON public.donaciones FOR SELECT TO authenticated
USING (
  exalumno_id = auth.uid()
  OR proyecto_estudiante_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 7. donaciones_update_admin
DROP POLICY IF EXISTS "donaciones_update_admin" ON public.donaciones;
CREATE POLICY "donaciones_update_admin" ON public.donaciones FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

-- 8. curriculum_select_allowed
DROP POLICY IF EXISTS "curriculum_select_allowed" ON public.curriculum;
CREATE POLICY "curriculum_select_allowed" ON public.curriculum FOR SELECT TO authenticated
USING (
  estudiante_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
  OR EXISTS (
    SELECT 1 FROM public.matches m JOIN public.users u ON u.id = auth.uid()
    WHERE u.rol = 'exalumno' AND m.exalumno_id = auth.uid() AND m.estudiante_id = public.curriculum.estudiante_id AND m.estado = 'activo'
  )
);

-- 9. cv_exp_select_own
DROP POLICY IF EXISTS "cv_exp_select_own" ON public.curriculum_experiencia;
CREATE POLICY "cv_exp_select_own" ON public.curriculum_experiencia FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.curriculum c WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 10. cv_cert_select_own
DROP POLICY IF EXISTS "cv_cert_select_own" ON public.curriculum_certificaciones;
CREATE POLICY "cv_cert_select_own" ON public.curriculum_certificaciones FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.curriculum c WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 11. cv_ver_select_own
DROP POLICY IF EXISTS "cv_ver_select_own" ON public.curriculum_versiones;
CREATE POLICY "cv_ver_select_own" ON public.curriculum_versiones FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.curriculum c WHERE c.id = curriculum_id AND c.estudiante_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 12. aplicaciones_select_own
DROP POLICY IF EXISTS "aplicaciones_select_own" ON public.aplicaciones;
CREATE POLICY "aplicaciones_select_own" ON public.aplicaciones FOR SELECT TO authenticated
USING (
  estudiante_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.posiciones p WHERE p.id = posicion_id AND p.exalumno_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 13. aplicaciones_update_exalumno_admin
DROP POLICY IF EXISTS "aplicaciones_update_exalumno_admin" ON public.aplicaciones;
CREATE POLICY "aplicaciones_update_exalumno_admin" ON public.aplicaciones FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.posiciones p WHERE p.id = posicion_id AND p.exalumno_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 14. reportes_select_admin_propio
DROP POLICY IF EXISTS "reportes_select_admin_propio" ON public.reportes_perfil;
CREATE POLICY "reportes_select_admin_propio" ON public.reportes_perfil FOR SELECT TO authenticated
USING (
  reportado_por = auth.uid()
  OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- 15. reportes_update_admin
DROP POLICY IF EXISTS "reportes_update_admin" ON public.reportes_perfil;
CREATE POLICY "reportes_update_admin" ON public.reportes_perfil FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.rol = 'admin'));

-- 16. Modificar el trigger fn_users_protect_columns para usar rol en vez de tipo
CREATE OR REPLACE FUNCTION public.fn_users_protect_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid 
      AND rol = 'admin'
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Proteger campos criticos si no es admin
  NEW.rol = OLD.rol;
  NEW.reportes_recibidos = OLD.reportes_recibidos;
  NEW.email_verified = OLD.email_verified;
  
  RETURN NEW;
END;
$$;
