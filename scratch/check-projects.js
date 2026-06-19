
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: students, error } = await supabase
    .from('estudiantes')
    .select('user_id, proyecto_titulo, proyecto_descripcion, user:users(nombre, apellidos)');

  if (error) {
    console.error('Error fetching students:', error);
    return;
  }

  const sinProyecto = students.filter(s => !s.proyecto_titulo || s.proyecto_titulo.trim() === '');
  const conProyecto = students.filter(s => s.proyecto_titulo && s.proyecto_titulo.trim() !== '');

  console.log(`Total estudiantes en BD: ${students.length}`);
  console.log(`Con proyecto: ${conProyecto.length}`);
  console.log(`Sin proyecto: ${sinProyecto.length}`);

  if (sinProyecto.length > 0) {
    console.log('\n--- Estudiantes SIN proyecto ---');
    sinProyecto.forEach(s => {
      const nombre = s.user ? `${s.user.nombre || ''} ${s.user.apellidos || ''}`.trim() : 'Desconocido';
      console.log(`- ${nombre} (ID: ${s.user_id})`);
    });
  }
}

main();
