import re

seed_path = r"c:\Users\Pcfwd\OneDrive\Escritorio\BACKEND\proyectos\exalumnos_ucr\exalumnos_ucr\supabase\seed.sql"
with open(seed_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any "ON CONFLICT (column_names) DO NOTHING;" with "ON CONFLICT DO NOTHING;"
# Except we shouldn't replace it if there's no unique constraint at all, but every table has a PK.
# Actually, replacing it globally is safest for a seed file.
# We'll replace ON CONFLICT (col) DO NOTHING with ON CONFLICT DO NOTHING
content = re.sub(r"ON CONFLICT \([^)]+\)\s*DO NOTHING", "ON CONFLICT DO NOTHING", content)

with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("All ON CONFLICT fixed")
