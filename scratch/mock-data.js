const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // First find Pedro Perez
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .ilike('nombre', '%pedro%')
    .ilike('apellidos', '%perez%');
    
  if (userError || !users || users.length === 0) {
    console.log('No se encontró a Pedro Perez, probaremos con cualquier estudiante...');
    const { data: est, error } = await supabase.from('estudiantes').select('user_id').limit(1);
    if (est && est.length > 0) {
      await updateEstudiante(est[0].user_id);
    }
    return;
  }
  
  const userId = users[0].id;
  await updateEstudiante(userId);
}

async function updateEstudiante(userId) {
  const { error } = await supabase
    .from('estudiantes')
    .update({
      proyecto_valor_monto: 250000,
      proyecto_valor_moneda: 'CRC',
      proyecto_video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      proyecto_documento_url: 'https://docs.google.com/document/d/12345/edit'
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log(`Updated user ${userId} with mock project data.`);
  }
}

main();
