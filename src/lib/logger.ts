// /lib/logger.ts
const isDev = process.env.NODE_ENV === 'development';

export function logError(context: string, error: unknown, meta?: Record<string, unknown>) {
  if (!isDev) return; // Silencioso en producción — usar observabilidad externa ahí
  
  const safeError = error instanceof Error
    ? { message: error.message, stack: error.stack }
    : { raw: String(error) };

  console.error(`[ERROR][${context}]`, safeError, meta ?? '');
}
