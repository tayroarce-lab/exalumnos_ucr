const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vzcjppbvmbhcnrempuxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2pwcGJ2bWJoY25yZW1wdXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxMDY5MCwiZXhwIjoyMDk1OTg2NjkwfQ.tMYXuDqriSrhR2jllBL-nz9gNo66ORTOVWPsAL6GFLE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching users...');
  const { data: exalumnos } = await supabase.from('users').select('id, email, password_hash').eq('rol', 'exalumno').limit(1);
  const { data: estudiantes } = await supabase.from('users').select('id, email, password_hash').eq('rol', 'estudiante').limit(1);
  
  if (!exalumnos?.length || !estudiantes?.length) {
    console.log('No users found');
    return;
  }
  
  const ex = exalumnos[0];
  const est = estudiantes[0];
  console.log('Exalumno:', ex.email, ex.id);
  console.log('Estudiante:', est.email, est.id);

  // Check if they have an active match
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('estudiante_id', est.id)
    .eq('exalumno_id', ex.id);
    
  let matchId;
  if (!matches || matches.length === 0) {
    console.log('Creating match...');
    const { data: newMatch, error } = await supabase.from('matches').insert({
      estudiante_id: est.id,
      exalumno_id: ex.id,
      score_match: 90,
      estado: 'activo'
    }).select().single();
    if (error) { console.error('Error creating match', error); return; }
    matchId = newMatch.id;
  } else {
    matchId = matches[0].id;
    if (matches[0].estado !== 'activo') {
      await supabase.from('matches').update({ estado: 'activo' }).eq('id', matchId);
    }
  }
  
  console.log('Match ID:', matchId);

  // Insert a dummy chat message
  const { error: msgErr } = await supabase.from('chat_messages').insert({
    match_id: matchId,
    sender_id: ex.id,
    content: 'Hola! Qué bueno conectar contigo.',
  });
  if (msgErr) console.error('Message error (Did you run the SQL?)', msgErr.message);
  else console.log('Message inserted successfully! SQL is confirmed running.');
  
  console.log(`LOGIN INFO: exalumno email: ${ex.email} password is likely '123456'`);
  console.log(`TARGET URL: http://localhost:3000/network/${est.id}`);
}

run();
