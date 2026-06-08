// =============================================================================
// ARCHIVO: middlewares/rateLimiter.ts
// Descripción: Limitador de peticiones (Rate Limiting) implementado con el
//              algoritmo de ventana deslizante (Sliding Window). Compatible
//              con el Edge Runtime de Next.js sin dependencias externas.
// =============================================================================

// Almacenamiento en memoria del registro de peticiones por IP
// Estructura: Map<ip, { timestamps: number[] }>
const registroPeticiones = new Map<string, { timestamps: number[] }>();

// [VERDE - FUNCION: limpiarRegistrosVencidos]
// Elimina las entradas del Map cuya ventana de tiempo ya expiró para
// evitar que el servidor acumule memoria indefinidamente.
function limpiarRegistrosVencidos(ventanaMs: number): void {
  const ahora = Date.now();
  for (const [ip, datos] of registroPeticiones.entries()) {
    const activos = datos.timestamps.filter(t => ahora - t < ventanaMs);
    if (activos.length === 0) {
      registroPeticiones.delete(ip);
    } else {
      datos.timestamps = activos;
    }
  }
}

// [VERDE - FUNCION: verificarLimite]
// Función reutilizable que evalúa si una IP supera el límite configurado
// dentro de la ventana de tiempo indicada.
// Retorna: { permitido: boolean, reintentoEn?: number }
export function verificarLimite(
  ip: string,
  opciones: {
    limiteMaximo: number;   // Máximo de peticiones permitidas en la ventana
    ventanaMs: number;      // Tamaño de la ventana en milisegundos
  }
): { permitido: boolean; reintentoEn?: number } {
  const ahora = Date.now();
  const { limiteMaximo, ventanaMs } = opciones;

  // Limpieza periódica para liberar memoria
  limpiarRegistrosVencidos(ventanaMs);

  // Obtener o inicializar el registro de la IP
  const entradaIp = registroPeticiones.get(ip) ?? { timestamps: [] };

  // Filtrar solo los timestamps dentro de la ventana activa
  const peticionesActivas = entradaIp.timestamps.filter(t => ahora - t < ventanaMs);

  if (peticionesActivas.length >= limiteMaximo) {
    // Calcular cuánto tiempo falta para que expire la petición más antigua
    const peticionMasAntigua = Math.min(...peticionesActivas);
    const reintentoEn = Math.ceil((peticionMasAntigua + ventanaMs - ahora) / 1000);

    return { permitido: false, reintentoEn };
  }

  // Registrar la petición actual y actualizar el Map
  peticionesActivas.push(ahora);
  registroPeticiones.set(ip, { timestamps: peticionesActivas });

  return { permitido: true };
}

// =============================================================================
// CONFIGURACIONES PREDEFINIDAS (Exportadas para el middleware principal)
// =============================================================================

// [VERDE - FUNCION: configLoginEstricto]
// Regla de seguridad máxima para el endpoint de autenticación.
// Máximo 5 intentos cada 15 minutos para prevenir ataques de fuerza bruta.
export const configLoginEstricto = {
  limiteMaximo: 5,
  ventanaMs: 15 * 60 * 1000, // 15 minutos en milisegundos
};

// [VERDE - FUNCION: configVacantesEstandar]
// Regla anti-scraping para el endpoint de posiciones de empleo.
// Máximo 50 peticiones por minuto para uso legítimo pero bloqueando bots.
export const configVacantesEstandar = {
  limiteMaximo: 50,
  ventanaMs: 60 * 1000, // 1 minuto en milisegundos
};
