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

async function main() {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Obtener todos los usuarios de auth.users
  const { data: authUsers, error: authErr } = await admin.auth.admin.listUsers();
  if (authErr) { console.error('Error leyendo auth.users:', authErr); return; }

  console.log('\n=== USUARIOS en auth.users (id real de Supabase) ===');
  authUsers.users.forEach(u => console.log('  auth.id:', u.id, '| email:', u.email));

  // Obtener todos los usuarios de la tabla public.users
  const { data: publicUsers } = await admin.from('users').select('id, email, rol');
  console.log('\n=== USUARIOS en public.users ===');
  publicUsers.forEach(u => console.log('  users.id:', u.id, '| email:', u.email, '| rol:', u.rol));

  // Comparar
  console.log('\n=== DIAGNÓSTICO: ¿Los IDs coinciden? ===');
  authUsers.users.forEach(authU => {
    const match = publicUsers.find(pu => pu.email === authU.email);
    if (match) {
      const coincide = match.id === authU.id;
      console.log(`  ${authU.email}:`);
      console.log(`    auth.id = ${authU.id}`);
      console.log(`    users.id = ${match.id}`);
      console.log(`    ¿Coinciden? ${coincide ? '✅ SÍ' : '❌ NO - ESTE ES EL BUG!'}`);
    } else {
      console.log(`  ${authU.email}: ✅ Solo existe en auth (nuevo usuario sin entrada en users todavía)`);
    }
  });

  // También verificar si hay usuarios en public.users que NO están en auth
  console.log('\n=== Usuarios en public.users SIN entrada en auth.users (datos de prueba) ===');
  publicUsers.forEach(pu => {
    const inAuth = authUsers.users.find(au => au.email === pu.email);
    if (!inAuth) {
      console.log(`  ⚠️  ${pu.email} (id: ${pu.id}, rol: ${pu.rol}) → NO tiene auth.users. Solo son datos seed.`);
    }
  });
}

main();
