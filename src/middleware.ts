import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Modo demo: todas las rutas son accesibles sin autenticación real.
  // Cuando integres Supabase de verdad, restaura la lógica de autenticación.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
