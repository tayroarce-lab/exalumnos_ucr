import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vzcjppbvmbhcnrempuxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2pwcGJ2bWJoY25yZW1wdXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxMDY5MCwiZXhwIjoyMDk1OTg2NjkwfQ.tMYXuDqriSrhR2jllBL-nz9gNo66ORTOVWPsAL6GFLE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      carrera_principal:carrera_campus!users_carrera_principal_id_fkey(
        carreras(nombre)
      ),
      users_areas_interes(
        catalogo_areas_interes(nombre)
      )
    `)
    .eq('email', 'ana.guerrero@ucr.ac.cr')
    .single();
    
  console.log("Joined user data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

run();
