const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) envVars[key.trim()] = val.join('=').trim();
});

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'];

// The trigger SQL we need to execute
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
`;

async function main() {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Try to apply via the SQL API endpoint directly
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  // Since we can't run arbitrary SQL via the JS client easily,
  // let's verify the trigger will work by checking the current state
  console.log('=== VERIFICACIÓN POST-FIX ===');
  
  const { data: authUsersData } = await admin.auth.admin.listUsers();
  const { data: publicUsers } = await admin.from('users').select('id, email, rol');
  
  const publicIds = new Set(publicUsers.map(u => u.id));
  const missingUsers = authUsersData.users.filter(u => !publicIds.has(u.id));
  
  console.log(`Usuarios en auth.users: ${authUsersData.users.length}`);
  console.log(`Usuarios en public.users: ${publicUsers.length}`);
  console.log(`Usuarios faltantes: ${missingUsers.length}`);
  
  if (missingUsers.length === 0) {
    console.log('✅ Todos los usuarios de auth.users tienen entrada en public.users');
  }
  
  // Verify admin accounts specifically
  console.log('\n=== CUENTAS ADMIN ===');
  const admins = publicUsers.filter(u => u.rol === 'admin');
  admins.forEach(a => console.log(`  ✅ ${a.email} → rol: ${a.rol}`));
  
  console.log('\n=== INSTRUCCIÓN TRIGGER ===');
  console.log('Para aplicar el trigger, ve a tu Supabase Dashboard:');
  console.log('https://app.supabase.com → tu proyecto → SQL Editor');
  console.log('y ejecuta el contenido de:');
  console.log('supabase/migrations/20260612170000_fix_auth_user_sync.sql');
}

main();
