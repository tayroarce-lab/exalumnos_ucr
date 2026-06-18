'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logoUCR from '@/images/Logo_UCR.png';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer-principal">
      <div className="footer-contenido">

        {/* Columna marca */}
        <div className="footer-columna footer-marca">
          <Image
            src={logoUCR}
            alt="Logo UCR"
            width={180}
            height={65}
            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          />
          <p className="footer-descripcion">
            Conectamos el legado de nuestros exalumnos con el talento de la
            nueva generación universitaria de Costa Rica.
          </p>
          <div className="footer-redes">
            <a href="#" className="footer-red-icono" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" className="footer-red-icono" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" className="footer-red-icono" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" className="footer-red-icono" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        {/* Columna navegación */}
        <div className="footer-columna">
          <h4 className="footer-titulo-col">Navegación</h4>
          <ul className="footer-lista">
            <li><Link href="/" className="footer-enlace">Inicio</Link></li>
            <li><Link href="/register" className="footer-enlace">Registrarse</Link></li>
            <li><Link href="/login" className="footer-enlace">Iniciar Sesión</Link></li>
            <li><Link href="#" className="footer-enlace">Sobre Nosotros</Link></li>
            <li><Link href="#" className="footer-enlace">Programas</Link></li>
          </ul>
        </div>

        {/* Columna contacto */}
        <div className="footer-columna">
          <h4 className="footer-titulo-col">Contacto</h4>
          <ul className="footer-lista footer-contacto-lista">
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>San José, Costa Rica</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>info@exalumnos.ucr.ac.cr</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.82 16.92z" />
              </svg>
              <span>+506 2511-0000</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-inferior">
        <p>© {new Date().getFullYear()} Fundación Exalumnos UCR · Todos los derechos reservados</p>
        <div className="footer-inferior-links">
          <a href="#" className="footer-enlace-inferior">Política de Privacidad</a>
          <span>·</span>
          <a href="#" className="footer-enlace-inferior">Términos de Uso</a>
        </div>
      </div>
    </footer>
  );
}
