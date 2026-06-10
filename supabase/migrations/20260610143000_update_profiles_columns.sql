-- Add missing columns for directory functionality
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS apellidos TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS carrera_principal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS escuela_principal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facultad_principal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anio_graduacion INTEGER;
