import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.trim().match(/^([^=#]+)=(.*)$/);
  if (match) acc[match[1]] = match[2].replace(/^["']|["']$/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TIPOS_APOYO = ['Mentoria', 'Empleo', 'Pasantia', 'Mentoria'];

async function run() {
  // 1. Actualizar exalumnos: asegurarse que ofrecen apoyo y tienen areas de interés
  console.log('Updating alumni flags...');
  await supabase.from('users').update({
    ofrece_mentoria: true,
    ofrece_empleo: true,
    ofrece_pasantia: true,
    visible_en_directorio: true
  }).eq('rol', 'exalumno');
  console.log('Alumni updated.');

  // 2. Asignar areas de interés a exalumnos también
  const { data: areas } = await supabase.from('catalogo_areas_interes').select('id');
  const { data: exalumnos } = await supabase.from('users').select('id').eq('rol', 'exalumno');
  const { data: students } = await supabase.from('users').select('id').eq('rol', 'estudiante');

  console.log(`Assigning areas to ${exalumnos.length} alumni...`);
  const alumniAreas = [];
  for (const ex of exalumnos) {
    const a1 = areas[Math.floor(Math.random() * areas.length)];
    let a2 = areas[Math.floor(Math.random() * areas.length)];
    while (a2.id === a1.id && areas.length > 1) a2 = areas[Math.floor(Math.random() * areas.length)];
    alumniAreas.push({ user_id: ex.id, area_id: a1.id });
    alumniAreas.push({ user_id: ex.id, area_id: a2.id });
  }
  const { error: areaErr } = await supabase.from('users_areas_interes').upsert(alumniAreas, { onConflict: 'user_id,area_id' });
  if (areaErr) console.error('Area assign error:', areaErr.message);
  else console.log('Alumni areas assigned.');

  // 3. Crear matches directamente con scores variados
  console.log(`Generating matches for ${students.length} students x ${exalumnos.length} alumni...`);

  // Each student gets matched with all alumni (varied scores for realism)
  const matches = [];
  for (const estudiante of students) {
    for (const exalumno of exalumnos) {
      // Generate a realistic score between 30-95
      const score = Math.floor(Math.random() * 65) + 30;
      const tipo = TIPOS_APOYO[Math.floor(Math.random() * TIPOS_APOYO.length)];
      matches.push({
        estudiante_id: estudiante.id,
        exalumno_id: exalumno.id,
        score_match: score,
        estado: 'sugerido',
        tipo_apoyo: tipo,
        iniciado_por: 'plataforma'
      });
    }
  }

  // Check existing matches to avoid duplicates
  const { data: existing } = await supabase.from('matches').select('estudiante_id, exalumno_id');
  const existingSet = new Set((existing || []).map(m => `${m.estudiante_id}|${m.exalumno_id}`));
  const newMatches = matches.filter(m => !existingSet.has(`${m.estudiante_id}|${m.exalumno_id}`));
  console.log(`Existing: ${existingSet.size}, New to insert: ${newMatches.length}`);

  // Insert in batches of 100
  let inserted = 0;
  const batchSize = 100;
  for (let i = 0; i < newMatches.length; i += batchSize) {
    const batch = newMatches.slice(i, i + batchSize);
    const { error } = await supabase.from('matches').insert(batch);
    if (error) {
      console.error(`Batch ${i / batchSize} error:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${newMatches.length} matches...`);
    }
  }

  console.log(`\nDone! Generated ${inserted} matches total.`);
}

run().catch(console.error);
