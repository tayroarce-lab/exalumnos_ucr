const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/estudiantes?select=user_id,busca_financiamiento,proyecto_titulo&limit=5`, {
  headers: {
    'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
  }
}).then(res => res.json()).then(console.log).catch(console.error);
