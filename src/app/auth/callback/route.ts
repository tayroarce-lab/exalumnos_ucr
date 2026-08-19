import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next is the URL to redirect to after sign in
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && authData?.user) {
      // Sync user safely with admin rights
      const adminClient = createAdminClient();
      const user = authData.user;
      
      const { data: dbUser } = await adminClient.from('users').select('id').eq('id', user.id).maybeSingle();
      if (!dbUser) {
        const rol = user.user_metadata?.rol || 'estudiante';
        await adminClient.from('users').insert({
          id: user.id,
          email: user.email,
          nombre: user.user_metadata?.nombre || user.user_metadata?.full_name || user.email?.split('@')[0],
          rol: rol,
          activo: true,
          email_verified: true
        });
      }
      
      const { data: dbProfile } = await adminClient.from('profiles').select('id').eq('id', user.id).maybeSingle();
      if (!dbProfile) {
        const rol = user.user_metadata?.rol || 'estudiante';
        await adminClient.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.nombre || user.user_metadata?.full_name || user.email?.split('@')[0],
          es_exalumno: rol === 'exalumno'
        });
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=InvalidToken`)
}
