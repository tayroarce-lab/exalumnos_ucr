import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vzcjppbvmbhcnrempuxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2pwcGJ2bWJoY25yZW1wdXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxMDY5MCwiZXhwIjoyMDk1OTg2NjkwfQ.tMYXuDqriSrhR2jllBL-nz9gNo66ORTOVWPsAL6GFLE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('exalumnos').select('*').limit(2);
  console.log("exalumnos:", data ? data : error);
  
  const { data: d2, error: e2 } = await supabase.from('estudiantes').select('*').limit(2);
  console.log("estudiantes:", d2 ? d2 : e2);
  
  const { data: d3, error: e3 } = await supabase.from('users_carreras').select('*').limit(2);
  console.log("users_carreras:", d3 ? d3 : e3);
}

run();
