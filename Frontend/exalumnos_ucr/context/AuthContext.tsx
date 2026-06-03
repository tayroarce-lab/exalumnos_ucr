'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authService, LoginCredentials, RegisterCredentials } from '@/services/authService';
import { ROUTES } from '@/constants/routes';

/**
 * Contrato del estado global de autenticación expuesto a la aplicación.
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de autenticación global.
 * Controla el ciclo de vida de la sesión (recuperación de token, login, logout).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Restaurar sesión al inicializar la app en el cliente
  useEffect(() => {
    async function loadUser() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch (error) {
        console.error('Error cargando la sesión activa:', error);
        // Limpiar token en caso de fallo de validación
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  /**
   * Realiza el inicio de sesión del usuario.
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario exalumno.
   */
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error al registrarse:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Finaliza la sesión actual del usuario.
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      // Ignorar errores del endpoint de logout para asegurar la limpieza del cliente
      console.warn('Fallo en el servicio de logout del servidor:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsLoading(false);
      router.push(ROUTES.LOGIN);
    }
  };

  /**
   * Sincroniza/actualiza la información del usuario del estado local con el backend.
   */
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (error) {
      console.error('Error al sincronizar datos de usuario:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
