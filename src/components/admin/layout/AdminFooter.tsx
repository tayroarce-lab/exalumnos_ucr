import React from 'react';
import Link from 'next/link';
import '@/styles/admin-footer.css';

export const AdminFooter: React.FC = () => {
  return (
    <footer className="admin-footer">
      <div className="admin-footer-copy">
        &copy; {new Date().getFullYear()} Fundación Exalumnos UCR. Todos los derechos reservados.
      </div>
      <div className="admin-footer-links">
        <Link href="/terminos" className="admin-footer-link">Términos de Servicio</Link>
        <Link href="/privacidad" className="admin-footer-link">Política de Privacidad</Link>
      </div>
    </footer>
  );
};
