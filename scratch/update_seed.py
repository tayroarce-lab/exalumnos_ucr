import os

seed_path = r"c:\Users\Pcfwd\OneDrive\Escritorio\BACKEND\proyectos\exalumnos_ucr\exalumnos_ucr\supabase\seed.sql"

with open(seed_path, 'r', encoding='utf-8') as f:
    sql = f.read()

# 1. Update the columns definition
sql = sql.replace(
    "busca_mentoria, busca_empleo,\n  ofrece_mentoria, visible_en_directorio,",
    "busca_mentoria, busca_empleo, busca_pasantia,\n  ofrece_mentoria, visible_en_directorio,"
)

# 2. Update users. We add a boolean before ofrece_mentoria (which is the 11th value, after busca_empleo).
# The pattern for an admin is:
# 'admin', TRUE, TRUE, NULL,\n  FALSE, FALSE, FALSE, FALSE, 0, now()
# The values are:
# 1:'admin', 2:email_verified, 3:activo, 4:foto_url, 
# 5:busca_mentoria, 6:busca_empleo, 7:ofrece_mentoria, 8:visible_en_directorio, 9:reportes, 10:created_at

sql = sql.replace(
    "'admin', TRUE, TRUE, NULL,\n  FALSE, FALSE, FALSE, FALSE, 0, now()",
    "'admin', TRUE, TRUE, NULL,\n  FALSE, FALSE, FALSE, FALSE, FALSE, 0, now()"
)

sql = sql.replace(
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/andres_quesada.jpg',\n  FALSE, FALSE, TRUE, TRUE, 0, now()",
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/andres_quesada.jpg',\n  FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()"
)

sql = sql.replace(
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/valeria_mora.jpg',\n  FALSE, FALSE, TRUE, TRUE, 0, now()",
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/valeria_mora.jpg',\n  FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()"
)

sql = sql.replace(
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/rodrigo_arias.jpg',\n  FALSE, FALSE, TRUE, TRUE, 0, now()",
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/rodrigo_arias.jpg',\n  FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()"
)

sql = sql.replace(
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/carolina_jimenez.jpg',\n  FALSE, FALSE, FALSE, TRUE, 0, now()",
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/carolina_jimenez.jpg',\n  FALSE, FALSE, FALSE, FALSE, TRUE, 0, now()"
)

sql = sql.replace(
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/pablo_saenz.jpg',\n  FALSE, FALSE, TRUE, TRUE, 0, now()",
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/pablo_saenz.jpg',\n  FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()"
)

sql = sql.replace(
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/natalia_brenes.jpg',\n  FALSE, FALSE, TRUE, TRUE, 0, now()",
    "'exalumno', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/natalia_brenes.jpg',\n  FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()"
)

sql = sql.replace(
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/ana_guerrero.jpg',\n  TRUE, FALSE, FALSE, TRUE, 0, now()",
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/ana_guerrero.jpg',\n  TRUE, FALSE, TRUE, FALSE, TRUE, 0, now()"
)

sql = sql.replace(
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/marco_artavia.jpg',\n  TRUE, TRUE, FALSE, TRUE, 0, now()",
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/marco_artavia.jpg',\n  TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()"
)

sql = sql.replace(
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/sofia_campos.jpg',\n  FALSE, TRUE, FALSE, TRUE, 0, now()",
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/sofia_campos.jpg',\n  FALSE, TRUE, FALSE, FALSE, TRUE, 0, now()"
)

sql = sql.replace(
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/daniel_rojas.jpg',\n  TRUE, TRUE, FALSE, TRUE, 0, now()",
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/daniel_rojas.jpg',\n  TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()"
)

sql = sql.replace(
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/valentina_pizarro.jpg',\n  TRUE, FALSE, FALSE, TRUE, 0, now()",
    "'estudiante', TRUE, TRUE,\n  'https://storage.fundacionucr.ac.cr/avatars/valentina_pizarro.jpg',\n  TRUE, FALSE, TRUE, FALSE, TRUE, 0, now()"
)

sql = sql.replace(
    "'estudiante', FALSE, TRUE,\n  NULL,\n  FALSE, FALSE, FALSE, FALSE, 0, now()",
    "'estudiante', FALSE, TRUE,\n  NULL,\n  FALSE, FALSE, FALSE, FALSE, FALSE, 0, now()"
)

users_areas = """ON CONFLICT (id) DO NOTHING;

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

-- ============================================================
-- BLOQUE 4: HISTORIAL ACADÉMICO"""

sql = sql.replace(
    "ON CONFLICT (id) DO NOTHING;\n\n-- ============================================================\n-- BLOQUE 4: HISTORIAL ACADÉMICO",
    users_areas
)

with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(sql)
