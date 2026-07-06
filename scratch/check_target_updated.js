const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function run() {
  const targetUserId = 'eec59365-9c79-4113-83fe-a71e3e00710c';
  const { data, error } = await supabase.from('matches').select('*').or(`exalumno_id.eq.${targetUserId},estudiante_id.eq.${targetUserId}`).order('updated_at', { ascending: false }).limit(5);
  console.log(data);
}
run();
