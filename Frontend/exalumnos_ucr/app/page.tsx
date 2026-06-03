import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

/**
 * Página principal (Landing Page) de la aplicación.
 * Presenta el propósito del sitio y provee enlaces a los flujos de login y registro.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Barra de navegación superior */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-grow">
        {/* Sección Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Comunidad de <span className="text-blue-600">Exalumnos UCR</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Mantente en contacto con tu Alma Mater, accede a ofertas de empleo exclusivas y participa en eventos de vinculación profesional y académica.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="lg">
                  Registrarse en el Portal
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button variant="outline" size="lg">
                  Iniciar Sesión &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Sección de características principales */}
        <section className="py-16 sm:py-24 bg-gray-50 border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {/* Característica 1 */}
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                  💼
                </div>
                <h3 className="text-xl font-bold text-gray-900">Bolsa de Empleo</h3>
                <p className="text-gray-600">
                  Encuentra puestos de trabajo y pasantías acordes a tu carrera, publicados por empresas vinculadas con la UCR.
                </p>
              </div>

              {/* Característica 2 */}
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                  🤝
                </div>
                <h3 className="text-xl font-bold text-gray-900">Red de Contactos</h3>
                <p className="text-gray-600">
                  Amplía tu círculo profesional conectando con colegas egresados de diversas facultades y carreras de la universidad.
                </p>
              </div>

              {/* Característica 3 */}
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                  📅
                </div>
                <h3 className="text-xl font-bold text-gray-900">Charlas y Reuniones</h3>
                <p className="text-gray-600">
                  Participa de talleres, congresos científicos y encuentros anuales de exalumnos y graduados destacados.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
