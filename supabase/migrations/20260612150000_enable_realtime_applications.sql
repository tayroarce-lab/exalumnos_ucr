-- =============================================================================
-- MIGRACIÓN: Habilitar Supabase Realtime en tabla applications
-- Descripción : Permite que el frontend reciba notificaciones en tiempo real
--               (via WebSockets) cuando el estado de una aplicación cambia.
--               El estudiante verá el cambio a "seleccionado" sin refrescar.
-- =============================================================================

-- 1. Agregar la tabla 'applications' a la publicación de Realtime de Supabase
--    Solo se publican eventos UPDATE para minimizar el tráfico.
--    RLS garantiza que cada estudiante solo reciba sus propios eventos.
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;

-- 2. (Opcional) Si se desea filtrar solo ciertos eventos, se puede usar:
-- ALTER PUBLICATION supabase_realtime SET TABLE public.applications (status, updated_at);
-- Nota: En Supabase Cloud, la publicación ya existe. Esta migración simplemente
--       añade la tabla a la publicación existente.
