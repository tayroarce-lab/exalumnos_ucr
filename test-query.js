const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  const env = fs.readFileSync('.env.local', 'utf-8');
  const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
  const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.from('cv_profiles').select('id, curriculum_versiones(id)');
  console.log('cv_profiles -> curriculum_versiones', { data, error });

  const { data: d2, error: e2 } = await supabase.from('cv_profiles').select('id, cv_versiones(id)');
  console.log('cv_profiles -> cv_versiones', { data: d2, error: e2 });

  const { data: d3, error: e3 } = await supabase.from('curriculums').select('id, curriculum_versiones(id)');
  console.log('curriculums -> curriculum_versiones', { data: d3, error: e3 });
}

main().catch(console.error);
