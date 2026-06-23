const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: user } = await supabase.from('users').select('*').eq('email', 'andres.quesada@intel.com').single();
  if (!user) return console.log("User not found");

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) return console.log("Profile not found");

  const exalumnoPayload = {
    id: user.id,
    user_id: user.id,
    carrera_ucr: profile.carrera_principal || 'No especificada',
    escuela_facultad: profile.escuela_principal || 'No especificada',
    empresa_actual: profile.empresa_actual || 'No especificada',
    cargo_actual: profile.cargo_actual || 'No especificada',
    sector_industria: profile.sector_industria || [],
    anios_experiencia: profile.anos_experiencia || 0,
    areas_de_interes: profile.areas_de_interes || [],
    ofrece_mentoria: profile.ofrece_mentoria || false,
    horas_mes_mentoria: profile.horas_mes_mentoria,
    ofrece_empleo: profile.ofrece_empleo || false,
    ofrece_pasantia: profile.ofrece_pasantia || false,
    ofrece_proyecto: profile.ofrece_proyecto || false,
    ofrece_donacion_dinero: profile.ofrece_donacion_dinero || false,
    pais_ciudad: profile.pais_ciudad || 'No especificada',
    anio_graduacion: profile.anio_graduacion || 2000,
    linkedin_url: profile.linkedin_url || '',
    bio: profile.bio || '',
    visible_en_directorio: true,
    perfil_completo: true
  };

  const { error } = await supabase.from('exalumnos').upsert(exalumnoPayload, { onConflict: 'id' });
  console.log("Sync result:", error || "Success");
}
run();
