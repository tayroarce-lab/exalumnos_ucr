const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) envVars[key.trim()] = val.join('=').trim();
});

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'];

// Extraer el project ref de la URL (ej: vzcjppbvmbhcnrempuxf)
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
console.log('Project ref:', projectRef);

const triggerSQL = `
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
  v_rol := COALESCE(
    NEW.raw_user_meta_data->>'rol',
    NEW.raw_user_meta_data->>'tipo',
    'estudiante'
  );
  IF v_rol NOT IN ('estudiante', 'exalumno', 'admin') THEN
    v_rol := 'estudiante';
  END IF;
  v_nombre := COALESCE(
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  INSERT INTO public.users (id, email, nombre, rol, activo, email_verified)
  VALUES (NEW.id, NEW.email, v_nombre, v_rol, TRUE, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (id) DO UPDATE SET
    rol = EXCLUDED.rol,
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_auth_to_public_users ON auth.users;

CREATE TRIGGER trg_sync_auth_to_public_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_auth_user_to_public();
`;

async function applySQLViaMgmtAPI() {
  // Try the Supabase Management API (requires supabase access token, not service_role)
  // This won't work with just service_role key
  // Instead, let's use the pg REST endpoint if available
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: triggerSQL })
  });
  
  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text.substring(0, 300));
  
  if (response.status === 404) {
    console.log('\n⚠️  No hay RPC exec_sql disponible.');
    console.log('Para aplicar el trigger, ejecuta este SQL en tu Supabase Dashboard → SQL Editor:');
    console.log('\n--- COPIA ESTE SQL ---');
    console.log(triggerSQL);
    console.log('--- FIN DEL SQL ---');
  }
}

applySQLViaMgmtAPI();
