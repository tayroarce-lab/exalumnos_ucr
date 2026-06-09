import Image from 'next/image';
import Link from 'next/link';
import {
  GraduationCap,
  Coins,
  Network,
  Share2,
  Globe,
  Play,
  User
} from 'lucide-react';
import logoUCR from '@/images/Logo_UCR.png';
import fondoUCR from '@/images/UCRbackground.png';

export const metadata = {
  title: 'Fundación Exalumnos UCR | Inicio',
  description: 'Conectamos el legado de nuestros exalumnos con el talento de la nueva generación para impulsar la educación costarricense.',
};

export default function PaginaInicio() {
  return (
    <div className="pagina-contenedor">
      <BarraNavegacion />
      <main>
        <SeccionHero />
        <SeccionApoyo />
      </main>
      <PiePagina />
    </div>
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

function SeccionHero() {
  return (
    <section className="seccion-hero" id="seccion-hero-principal">
      <div className="hero-fondo">
        <Image
          src={fondoUCR}
          alt="Campus Universidad de Costa Rica"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-contenido">
        <h1 className="hero-titulo">
          Transformando el futuro de la<br />educación costarricense
        </h1>
        <p className="hero-descripcion">
          Conectamos el legado de nuestros exalumnos con el talento de la nueva generación para impulsar proyectos de graduación de alto impacto social.
        </p>
        <div className="hero-botones">
          <Link href="/register" className="boton-registro" id="boton-hero-registrarse">REGISTRARSE</Link>
          <button className="boton-impacto" id="boton-hero-impacto">
            <Play size={20} fill="currentColor" />
            <span>Ver nuestro impacto</span>
          </button>
        </div>
      </div>

      <div className="hero-estadisticas">
        <div className="tarjeta-estadistica" id="estadistica-alumni">
          <span className="estadistica-numero">2.5k+</span>
          <span className="estadistica-etiqueta">Alumni Activos</span>
        </div>
        <div className="tarjeta-estadistica" id="estadistica-proyectos">
          <span className="estadistica-numero">150+</span>
          <span className="estadistica-etiqueta">Proyectos Financiados</span>
        </div>
        <div className="tarjeta-estadistica" id="estadistica-donaciones">
          <span className="estadistica-numero">₡500M</span>
          <span className="estadistica-etiqueta">Donaciones Gestionadas</span>
        </div>
      </div>
    </section>
  );
}

function SeccionApoyo() {
  return (
    <section className="seccion-apoyo" id="seccion-apoyo-comunidad">
      <div className="apoyo-cabecera">
        <h2 className="apoyo-titulo">¿Cómo apoyamos a la comunidad?</h2>
        <p className="apoyo-descripcion">
          Nuestra plataforma facilita la mentoría y el financiamiento directo a través de una red institucional sólida.
        </p>
      </div>

      <div className="apoyo-grid">
        <div className="tarjeta-mentoria" id="tarjeta-apoyo-mentoria">
          <div className="icono-contenedor">
            <GraduationCap size={32} />
          </div>
          <div className="mentoria-info">
            <h3 className="mentoria-titulo">Mentoría Alumni</h3>
            <p className="mentoria-descripcion">
              Expertos graduados guían a estudiantes en sus trabajos finales, compartiendo experiencia del mundo real y mejores prácticas de la industria.
            </p>
            <Link href="/mentores" className="mentoria-enlace">
              <span>Explorar mentores</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="columna-secundaria">
          <div className="tarjeta-secundaria" id="tarjeta-apoyo-becas">
            <div className="cabecera-tarjeta-secundaria">
              <div className="icono-contenedor">
                <Coins size={24} />
              </div>
              <h3 className="secundaria-titulo">Micro-becas</h3>
            </div>
            <p className="secundaria-descripcion">
              Fondos rápidos para materiales de laboratorio, encuestas o prototipos físicos.
            </p>
          </div>

          <div className="tarjeta-secundaria" id="tarjeta-apoyo-networking">
            <div className="cabecera-tarjeta-secundaria">
              <div className="icono-contenedor">
                <Network size={24} />
              </div>
              <h3 className="secundaria-titulo">Networking</h3>
            </div>
            <p className="secundaria-descripcion">
              Conéctate con la red de profesionales UCR más grande de la región.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PiePagina() {
  return (
    <footer className="pie-pagina" id="pie-pagina-principal">
      <div className="pie-grid">
        <div className="pie-columna-marca">
          <h2 className="pie-marca-titulo">Fundación Exalumnos UCR</h2>
          <p className="pie-marca-descripcion">
            Institución de Utilidad Pública dedicada a fortalecer el vínculo entre la Universidad de Costa Rica y sus egresados para fomentar el desarrollo académico y profesional del país.
          </p>
          <div className="pie-redes">
            <button className="boton-red-social" id="pie-social-compartir" aria-label="Compartir">
              <Share2 size={20} />
            </button>
            <button className="boton-red-social" id="pie-social-web" aria-label="Sitio Web">
              <Globe size={20} />
            </button>
          </div>
        </div>

        <div className="pie-columna-enlaces">
          <span className="pie-columna-titulo">Recursos</span>
          <ul className="pie-lista-enlaces">
            <li><Link href="/directorio-carreras" className="pie-enlace">Directorio de Carreras</Link></li>
            <li><Link href="/guia-donaciones" className="pie-enlace">Guía de Donaciones</Link></li>
            <li><Link href="/bolsa-empleo" className="pie-enlace">Bolsa de Empleo</Link></li>
            <li><Link href="/transparencia" className="pie-enlace">Transparencia</Link></li>
          </ul>
        </div>

        <div className="pie-columna-enlaces">
          <span className="pie-columna-titulo">Contacto</span>
          <div className="pie-lista-enlaces">
            <p className="pie-contacto-item">Info@exalumnosucr.org</p>
            <p className="pie-contacto-item">+506 2511-0000</p>
            <p className="pie-contacto-item">Ciudad Universitaria Rodrigo Facio</p>
          </div>
        </div>
      </div>

      <div className="pie-barra-inferior">
        <span>&copy; 2024 Fundación Exalumnos UCR. Todos los derechos reservados. Institución de Utilidad Pública.</span>
        <div className="pie-legales">
          <Link href="/aviso-legal" className="pie-enlace-legal">Aviso Legal</Link>
          <Link href="/privacidad" className="pie-enlace-legal">Privacidad</Link>
        </div>
      </div>
    </footer>
  );
}
