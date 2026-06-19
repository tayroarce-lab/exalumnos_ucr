const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: students, error } = await supabase
    .from('estudiantes')
    .select('*, user:users(nombre, apellidos)')
    .limit(5);

  if (error) {
    console.error('Error fetching students:', error);
    return;
  }

  students.forEach(s => {
    const nombre = s.user ? `${s.user.nombre || ''} ${s.user.apellidos || ''}`.trim() : 'Desconocido';
    console.log(`- ${nombre} (ID: ${s.user_id}):`);
    console.log(`  Monto: ${s.proyecto_valor_monto}`);
    console.log(`  Video: ${s.proyecto_video_url}`);
    console.log(`  Documento: ${s.proyecto_documento_url}`);
  });
}

main();
