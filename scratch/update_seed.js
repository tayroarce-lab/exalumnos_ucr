const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
let sql = fs.readFileSync(seedPath, 'utf8');

// 1. Update interest_areas to catalogo_areas_interes
sql = sql.replace(
  /INSERT INTO public\.interest_areas \(id, name\) VALUES([\s\S]*?)ON CONFLICT \(id\) DO NOTHING;/g,
  `INSERT INTO public.catalogo_areas_interes (nombre, categoria) VALUES
  ('Tecnología e Innovación', 'tecnologia'),
  ('Salud y Bienestar', 'salud'),
  ('Educación y Pedagogía', 'educacion'),
  ('Medio Ambiente y Sostenibilidad', 'ambiente'),
  ('Arte y Cultura', 'arte_cultura'),
  ('Ciencias Sociales', 'ciencias_sociales'),
  ('Agro y Alimentación', 'agro'),
  ('Emprendimiento y Negocios', 'emprendimiento'),
  ('Ingeniería y Construcción', 'ingenieria'),
  ('Derecho y Política Pública', 'derecho'),
  ('Economía y Finanzas', 'economia'),
  ('Comunicación y Medios', 'comunicacion'),
  ('Turismo y Patrimonio', 'turismo'),
  ('Investigación Científica', 'investigacion')
ON CONFLICT (nombre) DO NOTHING;`
);

// 2. Add busca_pasantia column to public.users insert
sql = sql.replace(
  /busca_mentoria, busca_empleo,\s*ofrece_mentoria, visible_en_directorio,/g,
  `busca_mentoria, busca_empleo, busca_pasantia,\n  ofrece_mentoria, visible_en_directorio,`
);

// Admins
sql = sql.replace(
  /'admin', TRUE, TRUE, NULL,\s*FALSE, FALSE, FALSE, FALSE, 0, now\(\)/g,
  `'admin', TRUE, TRUE, NULL,\n  FALSE, FALSE, FALSE, FALSE, FALSE, 0, now()`
);

// Exalumnos
sql = sql.replace(
  /'exalumno', TRUE, TRUE,\s*'([^']+)',\s*FALSE, FALSE, (TRUE|FALSE), TRUE, 0, now\(\)/g,
  `'exalumno', TRUE, TRUE,\n  '$1',\n  FALSE, FALSE, FALSE, $2, TRUE, 0, now()`
);

// Estudiantes
// st000001
sql = sql.replace(
  /'estudiante', TRUE, TRUE,\s*'([^']+)',\s*TRUE, FALSE, FALSE, TRUE, 0, now\(\)/g,
  `'estudiante', TRUE, TRUE,\n  '$1',\n  TRUE, FALSE, TRUE, FALSE, TRUE, 0, now()`
);

// st000002
sql = sql.replace(
  /'estudiante', TRUE, TRUE,\s*'([^']+)',\s*TRUE, TRUE, FALSE, TRUE, 0, now\(\)/g,
  `'estudiante', TRUE, TRUE,\n  '$1',\n  TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()`
);

// st000003
sql = sql.replace(
  /'estudiante', TRUE, TRUE,\s*'([^']+)',\s*FALSE, TRUE, FALSE, TRUE, 0, now\(\)/g,
  `'estudiante', TRUE, TRUE,\n  '$1',\n  FALSE, TRUE, TRUE, FALSE, TRUE, 0, now()`
);

// Incompletos
sql = sql.replace(
  /'estudiante', FALSE, TRUE,\s*NULL,\s*FALSE, FALSE, FALSE, FALSE, 0, now\(\)/g,
  `'estudiante', FALSE, TRUE,\n  NULL,\n  FALSE, FALSE, FALSE, FALSE, FALSE, 0, now()`
);

// 3. Add users_areas_interes
const usersAreasInteresSQL = `

-- ============================================================
-- BLOQUE 3.5: ÁREAS DE INTERÉS DE USUARIOS (users_areas_interes)
-- ============================================================
INSERT INTO public.users_areas_interes (user_id, area_id)
SELECT u.user_id, c.id
FROM (VALUES
  ('ex000001-0000-0000-0000-000000000001'::uuid, 'Tecnología e Innovación'),
  ('ex000001-0000-0000-0000-000000000001'::uuid, 'Ingeniería y Construcción'),
  ('ex000002-0000-0000-0000-000000000002'::uuid, 'Economía y Finanzas'),
  ('ex000002-0000-0000-0000-000000000002'::uuid, 'Emprendimiento y Negocios'),
  ('ex000003-0000-0000-0000-000000000003'::uuid, 'Salud y Bienestar'),
  ('ex000003-0000-0000-0000-000000000003'::uuid, 'Ingeniería y Construcción'),
  ('ex000004-0000-0000-0000-000000000004'::uuid, 'Tecnología e Innovación'),
  ('ex000005-0000-0000-0000-000000000005'::uuid, 'Tecnología e Innovación'),
  ('ex000006-0000-0000-0000-000000000006'::uuid, 'Economía y Finanzas'),
  ('st000001-0000-0000-0000-000000000001'::uuid, 'Tecnología e Innovación'),
  ('st000001-0000-0000-0000-000000000001'::uuid, 'Salud y Bienestar'),
  ('st000002-0000-0000-0000-000000000002'::uuid, 'Tecnología e Innovación'),
  ('st000003-0000-0000-0000-000000000003'::uuid, 'Economía y Finanzas'),
  ('st000004-0000-0000-0000-000000000004'::uuid, 'Medio Ambiente y Sostenibilidad'),
  ('st000005-0000-0000-0000-000000000005'::uuid, 'Ciencias Sociales')
) AS u(user_id, nombre_area)
JOIN public.catalogo_areas_interes c ON c.nombre = u.nombre_area
ON CONFLICT DO NOTHING;
`;

// Insert after the users are populated (after ON CONFLICT (id) DO NOTHING; in public.users)
sql = sql.replace(
  /ON CONFLICT \(id\) DO NOTHING;\s*-- ============================================================\s*-- BLOQUE 4: HISTORIAL ACADÉMICO/g,
  \`ON CONFLICT (id) DO NOTHING;\n\${usersAreasInteresSQL}\n-- ============================================================\n-- BLOQUE 4: HISTORIAL ACADÉMICO\`
);

fs.writeFileSync(seedPath, sql, 'utf8');
console.log('Seed updated successfully!');
