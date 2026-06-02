import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina nombres de clases de Tailwind CSS de manera segura, resolviendo conflictos de clases.
 * 
 * @param inputs - Lista de clases de CSS condicionales, objetos o arreglos.
 * @returns Un string de clases CSS concatenadas y optimizadas para Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
