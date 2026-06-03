import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook personalizado para consumir el contexto de autenticación rápidamente.
 * 
 * @returns El estado y funciones provistas por el AuthContext.
 * @throws Error si se utiliza fuera del AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  
  return context;
}
