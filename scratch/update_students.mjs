import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// simple .env parser
const env = fs.readFileSync('.env', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.trim().match(/^([^=#]+)=(.*)$/);
  if (match) {
    acc[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Updating students...');
  const { data: students, error: err1 } = await supabase
    .from('users')
    .select('id')
    .eq('rol', 'estudiante');
  
  if (err1) {
    console.error('Error fetching students:', err1);
    return;
  }
  
  console.log(`Found ${students.length} students. Updating...`);
  
  const { error: err2 } = await supabase
    .from('users')
    .update({ 
      busca_mentoria: true, 
      busca_empleo: true, 
      busca_pasantia: true 
    })
    .eq('rol', 'estudiante');
    
  if (err2) {
    console.error('Error updating students:', err2);
  } else {
    console.log('Students updated successfully.');
  }

  // Next, update areas de interes for students if they don't have them
  console.log('Updating areas de interes...');
  const { data: areas, error: err3 } = await supabase.from('catalogo_areas_interes').select('id');
  if (err3) {
    console.error('Error fetching areas:', err3);
    return;
  }
  
  const studentAreas = [];
  for (const s of students) {
    // assign 2 random areas
    const randomArea1 = areas[Math.floor(Math.random() * areas.length)];
    let randomArea2 = areas[Math.floor(Math.random() * areas.length)];
    while (randomArea2.id === randomArea1.id && areas.length > 1) {
      randomArea2 = areas[Math.floor(Math.random() * areas.length)];
    }
    
    studentAreas.push({ user_id: s.id, area_id: randomArea1.id });
    studentAreas.push({ user_id: s.id, area_id: randomArea2.id });
  }

  const { error: err4 } = await supabase
    .from('users_areas_interes')
    .upsert(studentAreas, { onConflict: 'user_id,area_id' });
    
  if (err4) {
    console.error('Error updating users_areas_interes:', err4);
  } else {
    console.log('users_areas_interes updated successfully.');
  }
}

run();
