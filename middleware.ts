import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { verificarLimite, configLoginEstricto, configVacantesEstandar } from './middlewares/rateLimiter'
import { registrarEventoSeguridad } from './src/services/securityLogger'
import { logError } from '@/lib/logger'

// =============================================================================
// ARCHIVO: middleware.ts (raíz del proyecto)
// Descripción: Middleware global de Next.js con cinco capas de seguridad:
//   1. Security Headers  — protege contra clickjacking, XSS, MIME sniffing
//   2. Rate Limiting      — protege contra fuerza bruta y scraping
//   3. Auth Guard         — protege rutas privadas verificando sesión en el Edge
//   4. Suspension Guard   — bloquea cuentas marcadas como activo=false
//   5. Role Guard         — restringe /admin a usuarios con rol 'admin'
//   + Open-Redirect Protection en el parámetro redirectTo
//   + Security Event Logging — registra eventos de seguridad en la BD
// =============================================================================

// ── Constantes de rutas ──────────────────────────────────────────────────────

/** Rutas que requieren usuario autenticado */
const RUTAS_PROTEGIDAS = [
  '/dashboard',
  '/student-dashboard',
  '/admin',
  '/profile',
  '/jobs',
  '/network',
  '/directorio',
  '/donations',
  '/events',
  '/give-back',
  '/mentorships',
  '/completar-perfil',
  '/mis-aplicaciones',
]

/** Rutas exclusivas para usuarios NO autenticados */
const RUTAS_PUBLICAS_AUTH = ['/login', '/register']

/** Rutas que requieren además rol 'admin' */
const RUTAS_ADMIN = ['/admin']

/** Rutas excluidas de toda lógica de seguridad */
const RUTAS_EXCLUIDAS_PREFIJOS = ['/cuenta-suspendida', '/aviso-legal', '/api/']

// ── Headers de seguridad HTTP ────────────────────────────────────────────────

/**
 * Aplica los headers de seguridad HTTP recomendados por OWASP.
 * Se inyectan en TODAS las respuestas, independientemente de la ruta.
 */
function aplicarSecurityHeaders(response: NextResponse): NextResponse {
  // Previene que la página sea incrustada en iframes (Clickjacking)
  response.headers.set('X-Frame-Options', 'DENY')

  // Evita que el navegador "adivine" el tipo MIME del contenido (MIME Sniffing)
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Controla la información de referente enviada en solicitudes cross-origin
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Deshabilita acceso a funciones de hardware sensibles sin necesidad real
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy: política estricta adaptada a Next.js + Supabase
  // unsafe-inline necesario para los estilos inline de Next.js
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",   // Next.js requiere unsafe-eval en dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} wss://*.supabase.co`,
      "img-src 'self' data: blob: https: http:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // HSTS: fuerza HTTPS por 1 año (solo en producción para no romper localhost)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

// ── Validación de open-redirect ──────────────────────────────────────────────

/**
 * Valida que el parámetro redirectTo sea una ruta relativa segura.
 * Previene ataques de open-redirect donde un atacante puede redirigir
 * a un dominio externo malicioso: /login?redirectTo=https://evil.com
 */
function validarRedirectTo(redirectTo: string | null): string | null {
  if (!redirectTo) return null

  // Solo permitir rutas relativas que empiecen con /
  // Rechazar URLs con protocolo (http://, https://, //)
  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return null
  }

  // Rechazar rutas que contengan caracteres de control o codificación sospechosa
  if (/[<>"'`]/.test(redirectTo) || redirectTo.includes('\\')) {
    return null
  }

  // No redirigir de vuelta a páginas de auth (loop)
  if (RUTAS_PUBLICAS_AUTH.some(r => redirectTo.startsWith(r))) {
    return null
  }

  return redirectTo
}

// ── Middleware principal ─────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const ruta = req.nextUrl.pathname

  // Resolución de IP real: Vercel → Cloudflare → fallback
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'desconocida'

  const userAgent = req.headers.get('user-agent') ?? 'desconocido'

  // ── CAPA 1: Security Headers (aplica a toda respuesta) ─────────────────────

  // La respuesta base se decorará con headers en cada rama de retorno
  // Se usará una función auxiliar al final de cada NextResponse

  // ── CAPA 2: Rate Limiting ──────────────────────────────────────────────────

  if (ruta.startsWith('/api/auth')) {
    const resultado = verificarLimite(ip, configLoginEstricto)

    if (!resultado.permitido) {
      // Registrar evento de rate limit (sin await para no bloquear)
      void registrarEventoSeguridad({
        tipo: 'rate_limit_superado',
        ip,
        ruta,
        metadata: { endpoint: 'auth', userAgent },
      })

      return aplicarSecurityHeaders(
        new NextResponse(
          JSON.stringify({
            error: 'Demasiados intentos de inicio de sesión.',
            mensaje: `Intente de nuevo en ${resultado.reintentoEn} segundos.`,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(resultado.reintentoEn ?? 60),
              'X-RateLimit-Limit': String(configLoginEstricto.limiteMaximo),
              'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + (resultado.reintentoEn ?? 60)),
            },
          }
        )
      )
    }
  }

  if (ruta.startsWith('/api/posiciones') || ruta.startsWith('/api/positions')) {
    const resultado = verificarLimite(ip, configVacantesEstandar)

    if (!resultado.permitido) {
      void registrarEventoSeguridad({
        tipo: 'rate_limit_superado',
        ip,
        ruta,
        metadata: { endpoint: 'posiciones', userAgent },
      })

      return aplicarSecurityHeaders(
        new NextResponse(
          JSON.stringify({
            error: 'Límite de peticiones alcanzado.',
            mensaje: `Espere ${resultado.reintentoEn} segundos antes de realizar otra consulta.`,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(resultado.reintentoEn ?? 60),
              'X-RateLimit-Limit': String(configVacantesEstandar.limiteMaximo),
            },
          }
        )
      )
    }
  }

  // ── Rutas completamente excluidas de auth guard ────────────────────────────

  const esRutaExcluida = RUTAS_EXCLUIDAS_PREFIJOS.some(r => ruta.startsWith(r))
  if (esRutaExcluida) {
    return aplicarSecurityHeaders(NextResponse.next())
  }

  const esRutaProtegida   = RUTAS_PROTEGIDAS.some(r => ruta.startsWith(r))
  const esRutaPublicaAuth = RUTAS_PUBLICAS_AUTH.some(r => ruta.startsWith(r))

  // Rutas de contenido estático o de la raíz — solo aplicar headers
  if (!esRutaProtegida && !esRutaPublicaAuth) {
    return aplicarSecurityHeaders(NextResponse.next())
  }

  // ── CAPA 3: Verificación de sesión Supabase (Edge-compatible) ─────────────

  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Propagar cookies de refresco de token a la respuesta
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // SEGURIDAD CRÍTICA: getUser() valida el JWT contra el servidor de Supabase.
  // NO usar getSession() — solo lee la cookie local y puede ser manipulada.
  let user = null;
  let authError = null;
  try {
    const authResult = await supabase.auth.getUser()
    user = authResult.data?.user;
    authError = authResult.error;
  } catch (err) {
    logError('middleware.ts/getUser', err);
  }
  const hayUsuario = !!user && !authError

  if (esRutaProtegida && !hayUsuario) {
    // Validar y sanear el redirectTo antes de guardarlo
    const redirectTo = validarRedirectTo(ruta)
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    if (redirectTo) {
      url.searchParams.set('redirectTo', redirectTo)
    }
    return aplicarSecurityHeaders(NextResponse.redirect(url))
  }

  // Usuario con sesión activa intenta ir a login/register → redirigir según rol
  if (esRutaPublicaAuth && hayUsuario) {
    // CRÍTICO: usamos service_role para bypasear RLS al leer el rol.
    // El cliente anon es bloqueado por las políticas de la tabla users.
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    let userDataAuth = null;
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('rol')
        .eq('id', user!.id)
        .single()
      if (error) throw error;
      userDataAuth = data;
    } catch (err) {
      logError('middleware.ts/getUserRole', err, { userId: user!.id });
    }

    const rolActual = userDataAuth?.rol ?? 'estudiante'
    const redirectToParam = req.nextUrl.searchParams.get('redirectTo')
    const redirectToPath = validarRedirectTo(redirectToParam)

    const url = req.nextUrl.clone()
    // Redirigir según rol: admin→/admin, exalumno→/dashboard, estudiante→/student-dashboard
    let destino: string
    if (rolActual === 'admin') {
      destino = '/admin'
    } else if (rolActual === 'exalumno') {
      destino = redirectToPath ? redirectToPath : '/dashboard'
    } else {
      destino = redirectToPath ? redirectToPath : '/student-dashboard'
    }
    url.pathname = destino
    url.search = ''
    return aplicarSecurityHeaders(NextResponse.redirect(url))
  }

  // A partir de aquí, el usuario TIENE sesión activa
  if (!hayUsuario) {
    return aplicarSecurityHeaders(response)
  }

  // ── CAPA 4: Suspension Guard ───────────────────────────────────────────────

  // CRÍTICO: usamos service_role para bypasear RLS. El cliente anon es bloqueado
  // por las políticas de seguridad de la tabla users.
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
  let userData = null;
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('activo, rol, suspension_reason')
      .eq('id', user!.id)
      .single()
    if (error) throw error;
    userData = data;
  } catch (err) {
    logError('middleware.ts/getUserSuspensionData', err, { userId: user!.id });
  }

  // Cuenta suspendida → redirigir a página informativa
  if (userData?.activo === false) {
    void registrarEventoSeguridad({
      tipo: 'cuenta_suspendida_intento',
      usuarioId: user.id,
      ip,
      ruta,
      metadata: { userAgent, motivo: userData.suspension_reason ?? 'sin motivo' },
    })

    const url = req.nextUrl.clone()
    url.pathname = '/cuenta-suspendida'
    // Limpiar parámetros para no filtrar información sensible
    url.search = ''
    return aplicarSecurityHeaders(NextResponse.redirect(url))
  }

  // ── CAPA 5: Role Guard para /admin ────────────────────────────────────────

  if (RUTAS_ADMIN.some(r => ruta.startsWith(r))) {
    const esAdmin = userData?.rol === 'admin'

    if (!esAdmin) {
      // Registrar intento de acceso sin privilegios
      void registrarEventoSeguridad({
        tipo: 'acceso_denegado_rol',
        usuarioId: user.id,
        ip,
        ruta,
        metadata: { rolActual: userData?.rol ?? 'desconocido', rolRequerido: 'admin', userAgent },
      })

      // Redirigir silenciosamente sin exponer que la ruta existe
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return aplicarSecurityHeaders(NextResponse.redirect(url))
    }

    // Registrar acceso exitoso a /admin (para auditoría)
    void registrarEventoSeguridad({
      tipo: 'acceso_admin',
      usuarioId: user.id,
      ip,
      ruta,
      metadata: { userAgent },
    })
  }

  // ── Validación de open-redirect en parámetro redirectTo ───────────────────

  const redirectToParam = req.nextUrl.searchParams.get('redirectTo')
  if (redirectToParam) {
    const redirectToSanitizado = validarRedirectTo(redirectToParam)

    // Si fue modificado (o invalidado), reescribir la URL para limpiar el parámetro malicioso
    if (redirectToSanitizado !== redirectToParam) {
      void registrarEventoSeguridad({
        tipo: 'open_redirect_attempt',
        usuarioId: user.id,
        ip,
        ruta,
        metadata: { pathOriginal: redirectToParam, userAgent },
      })

      const url = req.nextUrl.clone()
      if (redirectToSanitizado) {
        url.searchParams.set('redirectTo', redirectToSanitizado)
      } else {
        url.searchParams.delete('redirectTo')
      }
      return aplicarSecurityHeaders(NextResponse.redirect(url))
    }
  }

  // ── CAPA 6: Dashboard Role Guard ──────────────────────────────────────────
  if ((ruta === '/dashboard' || ruta === '/dashboard/') && userData?.rol === 'estudiante') {
    const url = req.nextUrl.clone()
    url.pathname = '/student-dashboard'
    return aplicarSecurityHeaders(NextResponse.redirect(url))
  }

  if ((ruta === '/student-dashboard' || ruta === '/student-dashboard/') && userData?.rol === 'exalumno') {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return aplicarSecurityHeaders(NextResponse.redirect(url))
  }

  return aplicarSecurityHeaders(response)
}

// Matcher amplio: aplica a todas las rutas excepto assets estáticos de Next.js
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
