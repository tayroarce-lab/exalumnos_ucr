import React from 'react';

export default function DirectoryBackground() {
  const cCeleste = '84, 188, 235'; // #54BCEB
  const cNaranja = '243, 75, 38';  // #F34B26
  const cAmarillo = '255, 155, 24'; // #FF9B18

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* ── Formas de fondo y círculos decorativos ── */}
      <div className="deco-circulo-grande-bg opacity-30" />
      <div className="deco-circulo-medio-bg opacity-25" />

      {/* Hexágono fondo */}
      <div className="deco-hexagono-bg opacity-20">
        <svg width="210" height="242" viewBox="0 0 210 242" fill="none">
          <polygon points="105,6 200,55 200,185 105,236 10,185 10,55"
            stroke={`rgba(${cCeleste},0.35)`} strokeWidth="2" fill="none" />
          <polygon points="105,26 180,67 180,175 105,216 30,175 30,67"
            stroke={`rgba(${cCeleste},0.20)`} strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* ── Iconos educativos flotantes ── */}

      {/* Birrete de graduación — arriba izquierda */}
      <div className="deco-icono deco-gorro-graduacion opacity-40">
        <svg width="58" height="58" viewBox="0 0 24 24" fill="none"
          stroke={`rgba(${cCeleste}, 0.9)`} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      </div>

      {/* Libro abierto — derecha media */}
      <div className="deco-icono deco-libro opacity-40">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
          stroke={`rgba(${cAmarillo}, 0.95)`} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>

      {/* Lápiz — arriba derecha */}
      <div className="deco-icono deco-lapiz opacity-40">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none"
          stroke={`rgba(${cCeleste}, 0.8)`} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>

      {/* Átomo — esquina superior derecha, girando */}
      <div className="deco-icono deco-atomo opacity-30">
        <svg width="88" height="88" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
          <circle cx="12" cy="12" r="1.5" fill={`rgba(${cCeleste},0.60)`} />
          <ellipse cx="12" cy="12" rx="10" ry="4"
            stroke={`rgba(${cCeleste},0.45)`} strokeWidth="1" />
          <ellipse cx="12" cy="12" rx="10" ry="4"
            stroke={`rgba(${cCeleste},0.35)`} strokeWidth="1"
            transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4"
            stroke={`rgba(${cCeleste},0.35)`} strokeWidth="1"
            transform="rotate(120 12 12)" />
        </svg>
      </div>

      {/* Diploma / Medalla — abajo derecha */}
      <div className="deco-icono deco-diploma opacity-40">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke={`rgba(${cNaranja}, 0.9)`} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      </div>

      {/* Brújula / Compás — abajo izquierda */}
      <div className="deco-icono deco-brujula opacity-45">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none"
          stroke={`rgba(${cCeleste},0.8)`} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
            fill={`rgba(${cAmarillo},0.35)`} stroke={`rgba(${cAmarillo},0.88)`} strokeWidth="1.2" />
        </svg>
      </div>

      {/* Microscopio — zona alta izquierda */}
      <div className="deco-icono deco-microscopio opacity-35">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
          stroke={`rgba(${cCeleste},0.75)`} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18h8" /><path d="M3 22h18" />
          <path d="M14 22a7 7 0 1 0 0-14h-1" />
          <path d="M9 14h2" /><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
          <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </svg>
      </div>

      {/* Estrella amarilla */}
      <div className="deco-icono deco-estrella opacity-45">
        <svg width="30" height="30" viewBox="0 0 24 24"
          fill={`rgba(${cAmarillo},0.72)`} stroke={`rgba(${cAmarillo},0.95)`} strokeWidth="1.2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      {/* Estrella celeste pequeña */}
      <div className="deco-icono deco-estrella-2 opacity-40">
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill={`rgba(${cCeleste},0.50)`} stroke={`rgba(${cCeleste},0.80)`} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      {/* Puntos decorativos en grid */}
      <div className="deco-puntos-superior opacity-25" />
      <div className="deco-puntos-inferior opacity-25" />

      {/* Línea punteada */}
      <div className="deco-linea-diagonal opacity-30">
        <svg width="130" height="3" viewBox="0 0 130 3">
          <line x1="0" y1="1.5" x2="130" y2="1.5"
            stroke={`rgba(${cCeleste},0.45)`} strokeWidth="2" strokeDasharray="8 5" />
        </svg>
      </div>

      {/* Triángulo naranja */}
      <div className="deco-triangulo-acento opacity-30">
        <svg width="52" height="46" viewBox="0 0 52 46" fill="none">
          <polygon points="26,2 50,44 2,44"
            stroke={`rgba(${cNaranja},0.58)`} strokeWidth="2"
            fill={`rgba(${cNaranja},0.08)`} />
        </svg>
      </div>
    </div>
  );
}
