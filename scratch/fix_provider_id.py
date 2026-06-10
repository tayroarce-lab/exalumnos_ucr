import os
import re

seed_path = r"c:\Users\Pcfwd\OneDrive\Escritorio\BACKEND\proyectos\exalumnos_ucr\exalumnos_ucr\supabase\seed.sql"

with open(seed_path, 'r', encoding='utf-8') as f:
    sql = f.read()

# 1. Update columns
old_cols = "id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at"
new_cols = "id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at"
sql = sql.replace(old_cols, new_cols)

# 2. Update values
# The pattern looks like:
# ('aa000001-0000-0000-0000-000000000001','aa000001-0000-0000-0000-000000000001',
# Let's match: \('([a-f0-9\-]{36})','([a-f0-9\-]{36})',
# Replace with: \('\1','\2','\2',

def repl(match):
    # match.group(1) is id, match.group(2) is user_id
    # We want: ('id','provider_id','user_id',
    # Since provider_id should be user_id, we just duplicate match.group(2)
    return f"('{match.group(1)}','{match.group(2)}','{match.group(2)}',"

sql = re.sub(r"\('([a-f0-9\-]{36})','([a-f0-9\-]{36})',", repl, sql)

# Also wait, ON CONFLICT in identities might need updating.
# Currently it is: ON CONFLICT (id) DO NOTHING;
# In Supabase GoTrue, the primary key of identities is usually (provider, provider_id) or just `provider_id`.
# "ON CONFLICT (provider_id) DO NOTHING" or "ON CONFLICT (provider_id, provider) DO NOTHING" 
# Let's use: ON CONFLICT (provider_id, provider) DO NOTHING; to be safe if that's the PK. 
# Wait, let's keep it as ON CONFLICT (provider_id) DO NOTHING; or let's look for how it was.
# The original seed had ON CONFLICT (id) DO NOTHING; for identities.
# Let's see if id is still unique. If so, ON CONFLICT (id) works. Let's try not to change it unless it fails.

# Wait, let's check if the ON CONFLICT changed recently for identities
sql = sql.replace(
    "ON CONFLICT (id) DO NOTHING;\n\n-- 3C: public.users",
    "ON CONFLICT (provider_id, provider) DO NOTHING;\n\n-- 3C: public.users"
)
sql = sql.replace(
    "ON CONFLICT (provider_id, provider) DO NOTHING;\n\n-- 3C: public.users",
    "ON CONFLICT (provider_id) DO NOTHING;\n\n-- 3C: public.users"
)

# Wait! The identities table ON CONFLICT usually requires the exact unique constraint.
# Supabase's auth.identities PK is (provider_id). Or sometimes (provider_id, provider).
# Let's just leave it as ON CONFLICT (provider_id) or we can use DO NOTHING without specifying conflict target!
# No, "ON CONFLICT DO NOTHING" without a target applies to ALL unique constraints. This is safer.
# Let's replace "ON CONFLICT (id) DO NOTHING;" with "ON CONFLICT DO NOTHING;" for auth.identities.
# Wait, auth.identities ON CONFLICT is at line 397.
# I will use a precise regex to find the ON CONFLICT for auth.identities and replace it.

pattern_identities_conflict = r"format\('\{\"sub\":\"%s\",\"email\":\"%s\"\}','([a-f0-9\-]{36})','[^']+'\)::jsonb,'email',now\(\),now\(\),now\(\)\)\nON CONFLICT \([^\)]+\) DO NOTHING;"
# actually let's just do a string replace since we know the text exactly from line 396-397.
old_end = ",'lucia.vindas@ucr.ac.cr')::jsonb,'email',now(),now(),now())\nON CONFLICT (id) DO NOTHING;"
new_end = ",'lucia.vindas@ucr.ac.cr')::jsonb,'email',now(),now(),now())\nON CONFLICT (provider_id) DO NOTHING;"
if old_end in sql:
    sql = sql.replace(old_end, new_end)
else:
    # Just generic replace
    sql = re.sub(
        r"now\(\),now\(\)\)\nON CONFLICT \([^\)]+\) DO NOTHING;\n\n-- 3C: public.users",
        r"now(),now())\nON CONFLICT (provider_id) DO NOTHING;\n\n-- 3C: public.users",
        sql
    )

with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(sql)

print("Provider IDs added!")
