import { NextRequest, NextResponse } from 'next/server';
import { verificarLimite, configLoginEstricto, configVacantesEstandar } from './middlewares/rateLimiter';

// =============================================================================
// ARCHIVO: middleware.ts (raíz del proyecto)
// Descripción: Punto de entrada del middleware global de Next.js 14.
//              Intercepta peticiones entrantes y aplica las reglas de
//              Rate Limiting según el endpoint al que se intenta acceder.
// =============================================================================

// [VERDE - FUNCION: middleware]
// Interceptor principal que clasifica la ruta entrante y aplica la política
// de límite de peticiones correspondiente. Extrae la IP real del cliente
// priorizando encabezados de proxies reversos (Vercel, Cloudflare).
export function middleware(req: NextRequest) {
  const ruta = req.nextUrl.pathname;

  // Resolución de IP real: encabezados de proxy → remoteAddress → fallback
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'ip-desconocida';

  // ── POLÍTICA 1: Login (Anti Fuerza Bruta) ──────────────────────────────────
  // Aplica a cualquier ruta de autenticación bajo /api/auth
  if (ruta.startsWith('/api/auth')) {
    const resultado = verificarLimite(ip, configLoginEstricto);

    if (!resultado.permitido) {
      // Respuesta 429 con encabezados estándar de Rate Limiting
      return new NextResponse(
        JSON.stringify({
          error: 'Demasiados intentos de inicio de sesión.',
          mensaje: `Intente de nuevo en ${resultado.reintentoEn} segundos.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(resultado.reintentoEn ?? 60),
            // Encabezados informativos para el cliente
            'X-RateLimit-Limit': String(configLoginEstricto.limiteMaximo),
            'X-RateLimit-Reset': String(
              Math.ceil(Date.now() / 1000) + (resultado.reintentoEn ?? 60)
            ),
          },
        }
      );
    }
  }

  // ── POLÍTICA 2: Posiciones de Empleo (Anti Scraping) ─────────────────────
  // Aplica a las rutas de consulta de vacantes disponibles
  if (ruta.startsWith('/api/posiciones') || ruta.startsWith('/api/positions')) {
    const resultado = verificarLimite(ip, configVacantesEstandar);

    if (!resultado.permitido) {
      return new NextResponse(
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
      );
    }
  }

  // Si ninguna política bloquea la petición, la deja pasar normalmente
  return NextResponse.next();
}

// [VERDE - FUNCION: config]
// Matcher de Next.js: define sobre qué rutas se activa el middleware.
// Se excluyen archivos estáticos (_next) para no penalizar el rendimiento.
export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/posiciones/:path*',
    '/api/positions/:path*',
  ],
};
