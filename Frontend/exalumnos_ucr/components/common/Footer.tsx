import React from 'react';

/**
 * Componente del pie de página global.
 * Muestra información institucional básica y el año corriente de manera dinámica.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>&copy; {currentYear} Universidad de Costa Rica. Todos los derechos reservados.</p>
        <p className="mt-1">Asociación y Comunidad de Exalumnos UCR.</p>
      </div>
    </footer>
  );
}
