const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:\\Users\\HP78D\\Downloads\\exalumnos_ucr\\carreras_vigentes_2026.json', 'utf8'));

// Obtener carreras únicas
const carrerasSet = new Set(data.map(item => item.carrera));

// Formatear a valores de SQL
const values = Array.from(carrerasSet).map(c => `('${c.replace(/'/g, "''")}')`).join(',\n  ');

const sql = `-- MIGRACIÓN / SEED: Insertar carreras vigentes 2026
INSERT INTO public.carreras (nombre)
VALUES
  ${values};
`;

fs.writeFileSync('c:\\Users\\HP78D\\Downloads\\exalumnos_ucr\\supabase\\seed_carreras.sql', sql);
console.log('SQL generated successfully with ' + carrerasSet.size + ' unique carreras.');
