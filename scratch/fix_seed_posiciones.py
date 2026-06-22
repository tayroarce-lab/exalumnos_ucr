import re
import sys

seed_path = r"c:\Users\Pcfwd\OneDrive\Escritorio\BACKEND\proyectos\exalumnos_ucr\exalumnos_ucr\supabase\seed.sql"
with open(seed_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove "carrera_requerida, tipo_posicion" from the INSERT INTO posiciones
content = content.replace("carrera_requerida, tipo_posicion", "")
# Fix the trailing comma if it was left hanging: "estado,\n  \n)" -> "estado\n)"
content = re.sub(r"estado,\s*\)", "estado\n)", content)

# 2. Remove the last two values for the 4 posiciones
# They look like:
#   'activa',
#   'Ciencias de la Computación e Informática',
#   'pasantia'
# )
# We can replace:
#   'activa',\s*'[^']+',\s*'(?:pasantia|empleo)'\s*\)
# with:
#   'activa'\n)

content = re.sub(r"'activa',\s*'[^']+',\s*'(?:pasantia|empleo)'\s*\)", "'activa'\n)", content)

# Write back
with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Posiciones fixed")
