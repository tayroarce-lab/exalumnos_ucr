import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function CompletarPerfilRedirect() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verificar el rol del usuario en la tabla users
  const { data: userData } = await supabase
    .from('users')
    .select('rol, perfil_completo')
    .eq('id', user.id)
    .single();

  if (userData?.perfil_completo) {
    redirect('/dashboard');
  }

  if (userData?.rol === 'estudiante') {
    redirect('/completar-perfil/estudiante');
  } else if (userData?.rol === 'exalumno') {
    // Si más adelante se hace uno para exalumnos
    redirect('/completar-perfil/exalumno');
  } else {
    // Fallback
    redirect('/profile/edit');
  }
}
