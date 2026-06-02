import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { User } from '@/types';

// Interfaces de solicitudes (Request payloads)
export interface LoginCredentials {
  email: string;
  password?: string; // Modificable según el mecanismo de login (OAuth, etc.)
}

export interface RegisterCredentials {
  email: string;
  firstName: string;
  lastName: string;
  graduationYear: number;
  major: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Servicio encargado de gestionar las peticiones de autenticación.
 */
export const authService = {
  /**
   * Inicia sesión del usuario con sus credenciales.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Registra a un nuevo exalumno en la plataforma.
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiClient<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Obtiene la información del usuario autenticado actualmente a través del token.
   */
  async getMe(): Promise<User> {
    return apiClient<User>(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
    });
  },

  /**
   * Cierra la sesión del usuario actual en el backend.
   */
  async logout(): Promise<void> {
    return apiClient<void>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },
};
