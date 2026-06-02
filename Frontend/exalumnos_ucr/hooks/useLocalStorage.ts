'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para persistir un estado reactivo en localStorage de forma segura para Server-Side Rendering (SSR).
 * 
 * @param key - Clave con la que se guardará el elemento en localStorage.
 * @param initialValue - Valor inicial por defecto si la clave no existe.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Inicialización de estado segura para evitar errores de hidratación en Next.js
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error al leer la clave "${key}" en localStorage:`, error);
    }
  }, [key]);

  /**
   * Actualiza el valor en el estado de React y en local storage.
   */
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error al escribir la clave "${key}" en localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
