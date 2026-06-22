import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vzcjppbvmbhcnrempuxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2pwcGJ2bWJoY25yZW1wdXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxMDY5MCwiZXhwIjoyMDk1OTg2NjkwfQ.tMYXuDqriSrhR2jllBL-nz9gNo66ORTOVWPsAL6GFLE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'ana.guerrero@ucr.ac.cr')
    .single();
    
  if (userError) {
    console.error("Error fetching user:", userError);
    return;
  }
  
  const { data: perfil, error: dbError } = await supabase
    .from('users')
    .select(`
      *,
      estudiantes (*),
      exalumnos (*),
      curriculums (*)
    `)
    .is('deleted_at', null)
    .eq('id', user.id)
    .maybeSingle();
    
  console.log("Raw profile from query:", JSON.stringify(perfil, null, 2));
  
  if (perfil) {
    const est = Array.isArray(perfil.estudiantes) ? perfil.estudiantes[0] : perfil.estudiantes;
    const exa = Array.isArray(perfil.exalumnos) ? perfil.exalumnos[0] : perfil.exalumnos;
    const curr = Array.isArray(perfil.curriculums) ? perfil.curriculums[0] : perfil.curriculums;
    
    const mappedProfile = {
      ...perfil,
      ...(est || {}),
      ...(exa || {}),
      ...(curr || {}),
      carrera: est?.carrera || exa?.carrera_ucr || null,
      areas_de_interes: est?.areas_de_interes || exa?.areas_de_interes || perfil.areas_de_interes || [],
    };
    
    console.log("Mapped profile:", JSON.stringify(mappedProfile, null, 2));
  }
}

run();
