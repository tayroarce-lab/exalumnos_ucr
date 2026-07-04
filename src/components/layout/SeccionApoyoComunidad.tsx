'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, HandHeart, Network } from 'lucide-react';

export default function SeccionApoyoComunidad() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const items = [
    {
      titulo: 'MENTORÍA ALUMNI',
      descripcion: 'Expertos graduados guían a estudiantes en sus trabajos finales y de investigación, compartiendo experiencia del mundo real y mejores prácticas de la industria.',
      enlace: '/mentorships',
      textoEnlace: 'Explorar mentores',
      mostrarMiniatura: true,
      rutaImagen: '/images/mentoria.png',
      esVideo: false,
      icono: GraduationCap,
      colorAcento: '#54BCEB', // Celeste de marca
      colorFondo: 'rgba(84, 188, 235, 0.12)', // Celeste disminuido
      svgFondo: (
        // Círculos entrelazados (comunidad / unión)
        <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.05] translate-x-4 translate-y-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#54BCEB" strokeWidth="2" strokeDasharray="5 5" />
          <circle cx="50" cy="50" r="25" stroke="#54BCEB" strokeWidth="1.5" />
          <path d="M50 10 L50 90 M10 50 L90 50" stroke="#54BCEB" strokeWidth="1" />
        </svg>
      )
    },
    {
      titulo: 'BECAS',
      descripcion: 'Fondos rápidos y directos destinados a cubrir costos de materiales de laboratorio, encuestas de campo o prototipos físicos para proyectos estudiantiles.',
      enlace: '#play-video',
      textoEnlace: 'Ver Video Informativo',
      mostrarMiniatura: true,
      rutaImagen: '',
      esVideo: true,
      icono: HandHeart,
      colorAcento: '#FF9B18', // Beige/Amarillo de marca
      colorFondo: 'rgba(255, 155, 24, 0.12)', // Beige disminuido
      svgFondo: (
        // Formas geométricas angulares (solidez y estructura)
        <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.05] translate-x-2 translate-y-2 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="30,100 80,20 100,20 50,100" fill="#FF9B18" />
          <polygon points="0,100 50,20 70,20 20,100" fill="#FF9B18" />
        </svg>
      )
    },
    {
      titulo: 'NETWORKING',
      descripcion: 'Conéctate y colabora con la red de profesionales egresados de la Universidad de Costa Rica más grande y activa de la región centroamericana.',
      enlace: '/register',
      textoEnlace: 'Unirse a la red',
      mostrarMiniatura: true,
      rutaImagen: '/images/networking.png',
      esVideo: false,
      icono: Network,
      colorAcento: '#F34B26', // Rosa/Naranja de marca
      colorFondo: 'rgba(243, 75, 38, 0.12)', // Rosa disminuido
      svgFondo: (
        // Pétalo / girasol estilizado sutil
        <svg className="absolute bottom-0 right-0 w-36 h-36 opacity-[0.04] translate-x-6 translate-y-6 transition-transform duration-500 group-hover:rotate-45" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 0 C80 30 100 40 120 60 C100 80 80 90 60 120 C40 90 20 80 0 60 C20 40 40 30 60 0 Z" fill="#F34B26" />
        </svg>
      )
    }
  ];

  return (
    <section 
      className="py-24 px-6 md:px-12 lg:px-24 flex flex-col items-center w-full overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #0284C7 25%, #F34B26 75%) fixed'
      }}
    >
      <div className="text-center mb-16 max-w-3xl relative z-10">
        <h2 className="font-title text-4xl md:text-5xl font-black text-white uppercase tracking-wide mb-4">
          ¿Cómo apoyamos a la comunidad?
        </h2>
        <p className="font-sans text-lg text-slate-200 leading-relaxed">
          Nuestra plataforma facilita la mentoría, el financiamiento y el crecimiento profesional directo a través de una red institucional sólida.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
        {items.map((item, index) => {
          const Icono = item.icono;
          return (
            <motion.div
              key={index}
              className="group relative bg-white rounded-[24px] border border-slate-100 p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between overflow-hidden min-h-[390px] transition-colors duration-300"
              whileHover={{ 
                y: -10, 
                scale: 1.015,
                boxShadow: '0 20px 45px rgba(0, 76, 99, 0.05)',
                borderColor: `${item.colorAcento}35`
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Elemento gráfico de fondo */}
              {item.svgFondo}

              {/* Contenido superior */}
              <div className="relative z-10 flex flex-col items-start gap-6">
                {/* Contenedor del ícono circular */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm"
                  style={{ backgroundColor: item.colorFondo }}
                >
                  <Icono 
                    size={26} 
                    style={{ color: item.colorAcento }}
                    className="transition-transform duration-300"
                  />
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <h3 className="font-title text-2xl font-bold tracking-tight text-[#004C63] uppercase">
                    {item.titulo}
                  </h3>
                  <p className="font-sans text-[0.95rem] text-slate-600 leading-relaxed">
                    {item.descripcion}
                  </p>
                  
                  {item.mostrarMiniatura && (
                    item.esVideo ? (
                      <div 
                        onClick={() => setIsVideoOpen(true)}
                        className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-black shadow-md cursor-pointer mt-4 group/video border border-slate-100 hover:border-amber-300/50 transition-all duration-300"
                      >
                        <video 
                          src="/becas.mp4" 
                          muted 
                          preload="metadata"
                          className="w-full h-full object-cover opacity-90 group-hover/video:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover/video:bg-black/35 transition-colors duration-300">
                          <div className="w-12 h-12 rounded-full bg-[#FF9B18] text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/video:scale-110">
                            <span className="text-xl ml-1">▶</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-slate-100 shadow-md mt-4 group/video border border-slate-100 transition-all duration-300"
                      >
                        <img 
                          src={item.rutaImagen} 
                          alt={item.titulo}
                          className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Botón / Enlace */}
              <div className="relative z-10 mt-8">
                {item.enlace === '#play-video' ? (
                  <button 
                    onClick={() => setIsVideoOpen(true)}
                    className="inline-flex items-center gap-2 font-sans font-bold text-sm transition-all duration-200 text-left"
                    style={{ color: item.colorAcento }}
                  >
                    <span className="hover:underline">{item.textoEnlace}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">▶</span>
                  </button>
                ) : (
                  <Link 
                    href={item.enlace}
                    className="inline-flex items-center gap-2 font-sans font-bold text-sm transition-all duration-200"
                    style={{ color: item.colorAcento }}
                  >
                    <span className="hover:underline">{item.textoEnlace}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Lightbox de Video */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#004C63] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl p-2">
            {/* Botón Cerrar */}
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 hover:scale-110 hover:rotate-90 transition-all duration-300"
              aria-label="Cerrar video"
            >
              ✕
            </button>
            
            {/* Contenedor del video HTML5 nativo */}
            <div className="aspect-video w-full rounded-[16px] overflow-hidden bg-black">
              <video 
                src="/becas.mp4" 
                controls 
                playsInline
                preload="auto"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          {/* Cerrar al hacer click en el fondo */}
          <div 
            className="absolute inset-0 -z-10 cursor-pointer" 
            onClick={() => setIsVideoOpen(false)} 
          />
        </div>
      )}
    </section>
  );
}
