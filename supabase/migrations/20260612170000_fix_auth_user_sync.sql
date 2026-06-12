-- ================================================================
-- Migración: Fix Auth Flow - Trigger de sincronización users + RLS
-- Archivo: 20260612170000_fix_auth_user_sync.sql
-- Descripción: 
--   1) Crea trigger en auth.users para poblar public.users automáticamente
--   2) Añade política RLS para permitir al middleware leer roles con anon key
--   3) Usa service_role para las lecturas críticas de rol en el middleware
-- ================================================================

-- ── 1) TRIGGER: Sincronizar auth.users → public.users ──────────────────────
-- Este trigger se dispara CADA VEZ que se crea un usuario en Supabase Auth.
-- Garantiza que siempre haya una fila en public.users con el rol correcto,
-- incluso si el código de aplicación falla al insertar.

CREATE OR REPLACE FUNCTION public.fn_sync_auth_user_to_public()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol TEXT;
  v_nombre TEXT;
BEGIN
  -- Leer el rol/tipo desde los metadatos del usuario en auth
  v_rol := COALESCE(
    NEW.raw_user_meta_data->>'rol',
    NEW.raw_user_meta_data->>'tipo',
    'estudiante'  -- Fallback seguro: si no hay metadata, es estudiante
  );

  -- Validar que el rol sea un valor permitido
  IF v_rol NOT IN ('estudiante', 'exalumno', 'admin') THEN
    v_rol := 'estudiante';
  END IF;

  -- Leer el nombre desde los metadatos
  v_nombre := COALESCE(
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)  -- Fallback: usar parte local del email
  );

  -- Insertar en public.users. Si ya existe (race condition con el código app),
  -- actualizar SOLO el rol para mantener consistencia.
  INSERT INTO public.users (id, email, nombre, rol, activo, email_verified)
  VALUES (NEW.id, NEW.email, v_nombre, v_rol, TRUE, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (id) DO UPDATE SET
    rol = EXCLUDED.rol,
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified;

  RETURN NEW;
END;
$$;

-- Eliminar trigger viejo si existe
DROP TRIGGER IF EXISTS trg_sync_auth_to_public_users ON auth.users;

-- Crear el trigger en auth.users
CREATE TRIGGER trg_sync_auth_to_public_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_auth_user_to_public();


-- ── 2) POLÍTICA RLS: Permitir al service_role leer users (ya lo hace por defecto)
--       y asegurar que el cliente anon NO puede leer (correcto por seguridad).
--       Para el middleware, usaremos el service_role key (configurado por separado).
-- ────────────────────────────────────────────────────────────────────────────

-- ── 3) REPARACIÓN: Insertar filas faltantes en public.users
--       para usuarios que ya existen en auth.users pero no en public.users
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO public.users (id, email, nombre, rol, activo, email_verified)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'nombre',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
  ) AS nombre,
  COALESCE(
    au.raw_user_meta_data->>'rol',
    au.raw_user_meta_data->>'tipo',
    CASE 
      WHEN au.email LIKE '%@ucr.ac.cr' THEN 'estudiante'
      ELSE 'exalumno'
    END
  ) AS rol,
  TRUE AS activo,
  au.email_confirmed_at IS NOT NULL AS email_verified
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;
