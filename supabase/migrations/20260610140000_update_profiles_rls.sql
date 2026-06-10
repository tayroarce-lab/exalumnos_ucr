-- =============================================================================
-- Migración para actualizar las políticas de seguridad (RLS) en la tabla profiles
-- =============================================================================

-- Permitir que cualquier usuario autenticado pueda ver los perfiles
-- Esto es necesario para el directorio de proyectos/exalumnos.
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Para permitir que los no autenticados lo vean si el directorio es público:
CREATE POLICY "Public users can view profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);
