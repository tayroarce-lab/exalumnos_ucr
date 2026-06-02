import { ApiResponse } from '@/types';

// Obtener el URL base del API desde variables de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Cliente de API basado en fetch para homogeneizar las peticiones al backend.
 * Maneja la inyección del token de sesión y el procesamiento básico de errores.
 * 
 * @param endpoint - Ruta relativa del endpoint (ej. '/auth/login').
 * @param options - Opciones de configuración de fetch más parámetros de búsqueda (query params).
 * @returns Promesa con los datos tipados de la respuesta.
 */
export async function apiClient<T>(
  endpoint: string,
  { params, headers, ...customConfig }: RequestOptions = {}
): Promise<T> {
  // Construir la URL completa
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Obtener el token de acceso desde localStorage (solo en entorno del cliente)
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }

  // Establecer cabeceras por defecto
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers: defaultHeaders,
  };

  try {
    const response = await fetch(url.toString(), config);

    // Si ocurre un error de sesión expirada (401), limpiar token y redirigir
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error('Sesión inactiva o expirada. Por favor inicie sesión de nuevo.');
    }

    // Para respuestas de eliminación exitosa sin cuerpo
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      // Retornar error estructurado si es provisto por el backend
      throw data || new Error('Ocurrió un error inesperado en el servidor.');
    }

    return data as T;
  } catch (error: unknown) {
    console.error(`Error en petición API [${endpoint}]:`, error);
    throw error;
  }
}
