export default function AuthBackground() {
  // Celeste institucional UCR
  const c = '91, 184, 232'; // #5BB8E8

  return (
    <div className="auth-bg-fixed">
      {/* ── Formas de fondo ── */}
      <div className="deco-circulo-grande-bg" />
      <div className="deco-circulo-medio-bg" />

      <div className="deco-hexagono-bg">
        <svg width="210" height="242" viewBox="0 0 210 242" fill="none">
          <polygon points="105,6 200,55 200,185 105,236 10,185 10,55"
            stroke={`rgba(${c},0.25)`} strokeWidth="2" fill="none" />
          <polygon points="105,26 180,67 180,175 105,216 30,175 30,67"
            stroke={`rgba(${c},0.15)`} strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* ── Iconos educativos flotantes ── */}

      {/* Birrete de graduación — arriba izquierda */}
      <div className="deco-icono deco-gorro-graduacion">
        <svg width="58" height="58" viewBox="0 0 24 24" fill="none"
          stroke={`rgba(${c},0.85)`} strokeWidth="1.3"
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
          stroke={`rgba(${c},0.70)`} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>

      {/* Átomo — esquina superior derecha, girando */}
      <div className="deco-icono deco-atomo">
        <svg width="88" height="88" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
          <circle cx="12" cy="12" r="1.5" fill={`rgba(${c},0.50)`} />
          <ellipse cx="12" cy="12" rx="10" ry="4"
            stroke={`rgba(${c},0.35)`} strokeWidth="1" />
          <ellipse cx="12" cy="12" rx="10" ry="4"
            stroke={`rgba(${c},0.28)`} strokeWidth="1"
            transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4"
            stroke={`rgba(${c},0.28)`} strokeWidth="1"
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
          stroke={`rgba(${c},0.70)`} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
            fill="rgba(255,155,24,0.45)" stroke="rgba(255,155,24,0.88)" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Microscopio — zona alta izquierda */}
      <div className="deco-icono deco-microscopio">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
          stroke={`rgba(${c},0.65)`} strokeWidth="1.3"
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

      {/* Estrella celeste pequeña */}
      <div className="deco-icono deco-estrella-2">
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill={`rgba(${c},0.50)`} stroke={`rgba(${c},0.80)`} strokeWidth="1.5">
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
            stroke={`rgba(${c},0.45)`} strokeWidth="2" strokeDasharray="8 5" />
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
    </div>
  );
}
