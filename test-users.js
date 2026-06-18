require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('users').select('rol, activo').is('deleted_at', null);
  console.log('Error:', error);
  console.log('Users count:', data?.length);
  const roles = data?.reduce((acc, u) => {
    acc[u.rol] = (acc[u.rol] || 0) + 1;
    return acc;
  }, {});
  console.log('Roles breakdown:', roles);
  
  const activeRoles = data?.reduce((acc, u) => {
    if (u.activo) {
      acc[u.rol] = (acc[u.rol] || 0) + 1;
    }
    return acc;
  }, {});
  console.log('Active roles breakdown:', activeRoles);
}

test();
