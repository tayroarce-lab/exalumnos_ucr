const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Error:', error);
  console.log('Users:');
  console.dir(data, { depth: null });
  
  const { data: pData } = await supabase.from('profiles').select('id, email, es_exalumno, perfil_completo');
  console.log('Profiles:');
  console.dir(pData, { depth: null });
}

checkUsers();
