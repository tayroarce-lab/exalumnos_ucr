import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DirectorioIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase.from('users').select('rol').eq('id', user.id).single();
  const rol = userData?.rol || user.user_metadata?.rol;

  if (rol === 'estudiante') {
    // Alumnos ven a los Exalumnos
    redirect('/network');
  } else {
    // Exalumnos ven a los Estudiantes
    redirect('/directorio/estudiantes');
  }
}
