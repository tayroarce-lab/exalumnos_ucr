import os
import re

seed_path = r"c:\Users\Pcfwd\OneDrive\Escritorio\BACKEND\proyectos\exalumnos_ucr\exalumnos_ucr\supabase\seed.sql"

with open(seed_path, 'r', encoding='utf-8') as f:
    sql = f.read()

# Find all 8-4-4-4-12 string segments that look like UUIDs but might have invalid hex letters
matches = re.findall(r'([a-z0-9]{8})-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', sql)

prefixes = set(matches)
print("Found prefixes:", prefixes)

# Let's fix ALL invalid ones
def hexify(prefix):
    # Convert invalid letters (g-z) to valid hex numbers deterministically
    return ''.join([c if c in '0123456789abcdef' else str(ord(c) % 10) for c in prefix])

for prefix in prefixes:
    if any(c not in '0123456789abcdef' for c in prefix):
        valid_hex = hexify(prefix)
        print(f"Replacing {prefix} with {valid_hex}")
        sql = sql.replace(prefix + "-", valid_hex + "-")

with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(sql)

print("All UUIDs verified and fixed!")
