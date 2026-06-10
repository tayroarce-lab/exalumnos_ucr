import Image from 'next/image';
import Link from 'next/link';
import { User, GraduationCap, HandHeart, Network } from 'lucide-react';
import logoUCR from '@/images/Logo_UCR.png';
import fondoUCR from '@/images/UCRbackground.png';

export const metadata = {
  title: 'Fundación Exalumnos UCR | Inicio',
  description: 'Conectamos el legado de nuestros exalumnos con el talento de la nueva generación.',
};

export default function PaginaInicio() {
  return (
    <div className="pagina-contenedor">
      <BarraNavegacion />
      <main>
        <SeccionHeroSplit />
        <SeccionApoyoComunidad />
      </main>
      <Footer />
    </div>
  );
}

function SeccionApoyoComunidad() {
  return (
    <section className="seccion-apoyo">
      <div className="apoyo-cabecera">
        <h2 className="apoyo-titulo">¿Cómo apoyamos a la comunidad?</h2>
        <p className="apoyo-subtitulo">
          Nuestra plataforma facilita la mentoría y el financiamiento directo a través de una red institucional sólida.
        </p>
      </div>

      <div className="apoyo-cuadricula">
        {/* Tarjeta Grande (Izquierda) */}
        <div className="apoyo-tarjeta-grande">
          <div className="apoyo-tarjeta-bg-shape" />
          <div className="apoyo-tarjeta-contenido">
            <div className="apoyo-icono-contenedor-grande">
              <GraduationCap className="apoyo-icono-grande" size={36} />
            </div>
            
            <div className="apoyo-texto-grande">
              <h3 className="apoyo-tarjeta-titulo-grande">Mentoría Alumni</h3>
              <p className="apoyo-tarjeta-descripcion-grande">
                Expertos graduados guían a estudiantes en sus trabajos finales, compartiendo experiencia del mundo real y mejores prácticas de la industria.
              </p>
              <Link href="/mentores" className="apoyo-enlace-grande">
                Explorar mentores <span className="apoyo-flecha">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="apoyo-columna-derecha">
          {/* Tarjeta Micro-becas */}
          <div className="apoyo-tarjeta-pequena">
            <div className="apoyo-icono-contenedor-pequeno">
              <HandHeart className="apoyo-icono-pequeno" size={24} />
            </div>
            <h3 className="apoyo-tarjeta-titulo-pequeno">Micro-becas</h3>
            <p className="apoyo-tarjeta-descripcion-pequeno">
              Fondos rápidos para materiales de laboratorio, encuestas o prototipos físicos.
            </p>
          </div>

          {/* Tarjeta Networking */}
          <div className="apoyo-tarjeta-pequena">
            <div className="apoyo-icono-contenedor-pequeno">
              <Network className="apoyo-icono-pequeno" size={24} />
            </div>
            <h3 className="apoyo-tarjeta-titulo-pequeno">Networking</h3>
            <p className="apoyo-tarjeta-descripcion-pequeno">
              Conéctate con la red de profesionales UCR más grande de la región.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BarraNavegacion() {
  return (
    <header className="cabecera" id="cabecera-principal">
      <div className="contenedor-logo">
        <Image
          src={logoUCR}
          alt="Logo UCR"
          width={280}
          height={100}
          className="logo-imagen"
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      <div className="contenedor-acciones">
        <Link href="/login" className="boton-signin">
          <User size={18} className="icono-signin" />
          <span>Iniciar Sesión</span>
        </Link>
        <Link href="/register" className="boton-register">
          Registrarse
        </Link>
      </div>
    </header>
  );
}

function SeccionHeroSplit() {
  return (
    <section className="seccion-hero-split">
      {/* ══ LADO IZQUIERDO ══ */}
      <div className="hero-lado-izquierdo">

        {/* ── Formas de fondo ── */}
        <div className="deco-circulo-grande-bg" />
        <div className="deco-circulo-medio-bg" />

        <div className="deco-hexagono-bg">
          <svg width="210" height="242" viewBox="0 0 210 242" fill="none">
            <polygon points="105,6 200,55 200,185 105,236 10,185 10,55"
              stroke="rgba(255,255,255,0.09)" strokeWidth="2" fill="none" />
            <polygon points="105,26 180,67 180,175 105,216 30,175 30,67"
              stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        {/* ── Iconos educativos flotantes ── */}

        {/* Birrete de graduación — arriba izquierda */}
        <div className="deco-icono deco-gorro-graduacion">
          <svg width="58" height="58" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.80)" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
        </div>

        {/* Libro abierto — derecha media */}
        <div className="deco-icono deco-libro">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,155,24,0.90)" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        {/* Lápiz — arriba derecha */}
        <div className="deco-icono deco-lapiz">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.68)" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>

        {/* Átomo — esquina superior derecha, girando */}
        <div className="deco-icono deco-atomo">
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
            <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.35)" />
            <ellipse cx="12" cy="12" rx="10" ry="4"
              stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            <ellipse cx="12" cy="12" rx="10" ry="4"
              stroke="rgba(255,255,255,0.18)" strokeWidth="1"
              transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4"
              stroke="rgba(255,255,255,0.18)" strokeWidth="1"
              transform="rotate(120 12 12)" />
          </svg>
        </div>

        {/* Diploma / Medalla — abajo derecha */}
        <div className="deco-icono deco-diploma">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="rgba(243,75,38,0.82)" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        </div>

        {/* Brújula / Compás — abajo izquierda */}
        <div className="deco-icono deco-brujula">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.62)" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
              fill="rgba(255,155,24,0.45)" stroke="rgba(255,155,24,0.88)" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Microscopio — zona alta izquierda */}
        <div className="deco-icono deco-microscopio">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.55)" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18h8" /><path d="M3 22h18" />
            <path d="M14 22a7 7 0 1 0 0-14h-1" />
            <path d="M9 14h2" /><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
            <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
          </svg>
        </div>

        {/* Estrella amarilla */}
        <div className="deco-icono deco-estrella">
          <svg width="30" height="30" viewBox="0 0 24 24"
            fill="rgba(255,155,24,0.72)" stroke="rgba(255,155,24,0.95)" strokeWidth="1.2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>

        {/* Estrella blanca pequeña */}
        <div className="deco-icono deco-estrella-2">
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.68)" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>

        {/* Puntos decorativos en grid */}
        <div className="deco-puntos-superior" />
        <div className="deco-puntos-inferior" />

        {/* Línea punteada */}
        <div className="deco-linea-diagonal">
          <svg width="130" height="3" viewBox="0 0 130 3">
            <line x1="0" y1="1.5" x2="130" y2="1.5"
              stroke="rgba(255,255,255,0.30)" strokeWidth="2" strokeDasharray="8 5" />
          </svg>
        </div>

        {/* Triángulo naranja */}
        <div className="deco-triangulo-acento">
          <svg width="52" height="46" viewBox="0 0 52 46" fill="none">
            <polygon points="26,2 50,44 2,44"
              stroke="rgba(243,75,38,0.58)" strokeWidth="2"
              fill="rgba(243,75,38,0.08)" />
          </svg>
        </div>

        {/* Contenido Principal */}
        <h1 className="hero-titulo-split">
          {"Bienvenido a\nAlumni UCR"}
        </h1>
        <p className="hero-descripcion-split">
          Forjando puentes entre el legado y el futuro. Conectamos a miles de egresados con las nuevas generaciones de estudiantes para potenciar el crecimiento académico, profesional y social de nuestra comunidad universitaria.
        </p>
        <Link href="/register" className="boton-unirse-red">
          Inscríbete Ahora &rarr;
        </Link>
      </div>

      {/* ══ LADO DERECHO ══ */}
      <div className="hero-lado-derecho">
        <Image
          src={fondoUCR}
          alt="Campus Universidad de Costa Rica"
          fill
          priority
          sizes="50vw"
          style={{ objectFit: 'cover' }}
        />

        {/* Logo UCR sobre la imagen del campus */}
        <div className="logo-alumni-ucr">
          <Image
            src={logoUCR}
            alt="Logo UCR"
            width={2000}
            height={2040}
            style={{
              width: '85%',
              height: 'auto',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1) drop-shadow(0 4px 20px rgba(0,0,0,0.8))',
            }}
            priority
          />
        </div>
      </div>
    </section>
  );
}

function Footer() {
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
