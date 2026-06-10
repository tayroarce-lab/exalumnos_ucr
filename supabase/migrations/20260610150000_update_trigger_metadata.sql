-- Update function to extract nombre and apellidos from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    created_at, 
    perfil_completo,
    nombre,
    apellidos
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NOW(), 
    20,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'apellidos'
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellidos = EXCLUDED.apellidos;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
