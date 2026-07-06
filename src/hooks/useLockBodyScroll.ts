import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal is open.
 * @param isLocked whether the scroll should be locked
 */
export function useLockBodyScroll(isLocked: boolean = true) {
  useEffect(() => {
    if (isLocked) {
      // Guarda el estilo original
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Previene el scroll en el body
      document.body.style.overflow = 'hidden';

      // Restaura el estilo al desmontar o si isLocked cambia a false
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLocked]);
}
