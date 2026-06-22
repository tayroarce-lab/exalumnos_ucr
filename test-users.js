const { createClient } = require('@supabase/supabase-js');


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, nombre, busca_mentoria, busca_empleo, busca_pasantia')
    .eq('id', '1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Ana Ortiz users row:', user);
  }
}

test();








