import re

seed_path = r"c:\Users\Pcfwd\OneDrive\Escritorio\BACKEND\proyectos\exalumnos_ucr\exalumnos_ucr\supabase\seed.sql"
with open(seed_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 'sistema' with 'plataforma' in the context of matches block.
# "sistema" only appears in the matches block in "iniciado_por" column, so we can replace 'sistema' safely if it is between quotes.
content = re.sub(r"'sistema'", "'plataforma'", content)

with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("sistema replaced with plataforma")
