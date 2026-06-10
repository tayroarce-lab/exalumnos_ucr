import os

seed_path = r"c:\Users\Pcfwd\OneDrive\Escritorio\BACKEND\proyectos\exalumnos_ucr\exalumnos_ucr\supabase\seed.sql"

with open(seed_path, 'r', encoding='utf-8') as f:
    sql = f.read()

# Replace invalid UUID prefixes with valid hex
# Keep the exact length to maintain the 8-4-4-4-12 UUID format
replacements = {
    "ex0000": "e80000",
    "st0000": "570000",
    "po0000": "f00000",
    "ma0000": "1a0000",
    "don000": "d07000",
    "cv0000": "c70000",
    "ver000": "be7000",
    "app000": "a11000",
    "cert00": "ce7700"
}

for old, new in replacements.items():
    sql = sql.replace(old, new)

with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(sql)

print("UUIDs fixed!")
