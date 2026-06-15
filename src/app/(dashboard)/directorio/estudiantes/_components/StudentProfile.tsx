'use client';

import React from 'react';
import { EstudianteDirectorio } from '@/types/estudiantes';
import GrillaEstudiantes from './GrillaEstudiantes';

interface Props {
  estudiante: EstudianteDirectorio;
  estudiantesRelacionados: EstudianteDirectorio[];
}

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconShare = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
  </svg>
);
const IconHand = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const IconBrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.98-3 2.5 2.5 0 0 1-1.32-4.24A3 3 0 0 1 4.5 8.5a2.5 2.5 0 0 1 5-1"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0 1.32-4.24A3 3 0 0 0 19.5 8.5a2.5 2.5 0 0 0-5-1"/>
  </svg>
);
const IconMonitor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
  </svg>
);
const IconLock = ({ color = '#dc2626', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconBulb = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);
const IconSupport = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/>
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const IconDot = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
  </svg>
);
const IconMoney = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

export default function StudentProfile({ estudiante, estudiantesRelacionados }: Props) {
  const iniciales = estudiante.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const tecnicas = estudiante.habilidades_tecnicas ?? [];
  const blandas = estudiante.habilidades_blandas ?? [];
  const nd = (v: any) => v || 'No disponible';
  
  // Especialización Principal Fallback
  const especializacion = estudiante.proyecto_area_tematica || estudiante.proyecto_tipo || (estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? estudiante.areas_de_interes[0] : 'Información no disponible');

  // Modal states
  const [showMentoriaModal, setShowMentoriaModal] = React.useState(false);
  const [showApoyarModal, setShowApoyarModal] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setIsAdmin(user.user_metadata?.rol === 'admin')
        }
      })
    })
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 120, height: 120, borderRadius: 14, background: '#dce8f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #c8d8ea' }}>
            {estudiante.foto_url
              ? <img src={getAvatarUrl(estudiante.foto_url) as string} alt={estudiante.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 36, fontWeight: 700, color: '#5a7fa0' }}>{iniciales}</span>
            }
          </div>
          <div style={{ position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1e7a4a', background: '#e8f5ee', border: '1px solid #a8d5be', borderRadius: 20, padding: '2px 10px', display: 'inline-block', marginBottom: 6 }}>Estudiante Activo</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f1e2e', margin: 0, lineHeight: 1.2 }}>{estudiante.nombre}</h1>
          {estudiante.carrera && <p style={{ color: '#4a6a8a', fontSize: 15, margin: '4px 0 0' }}>{estudiante.carrera}</p>}
          {estudiante.sede && <p style={{ color: '#7a96ae', fontSize: 13, margin: '3px 0 0' }}>📍 {estudiante.sede}</p>}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, background: '#1e3a5f', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <IconMail /> Contactar
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, background: 'white', color: '#1e3a5f', border: '1.5px solid #c5d5e5', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <IconShare /> Compartir Perfil
          </button>
        </div>
      </div>

      {/* ── DOS COLUMNAS ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* ── IZQUIERDA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Proyecto */}
          <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', borderLeft: '4px solid #1e3a5f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#4a7aaa', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Proyecto de Graduación</span>
              {estudiante.proyecto_area_tematica && (
                <span style={{ fontSize: 11, fontWeight: 600, color: 'white', background: '#2a7abf', borderRadius: 20, padding: '3px 12px' }}>{estudiante.proyecto_area_tematica}</span>
              )}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f1e2e', margin: '0 0 12px' }}>
              {estudiante.proyecto_titulo ?? 'Sin título registrado'}
            </h2>
            {estudiante.proyecto_descripcion
              ? <p style={{ color: '#4a6070', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{estudiante.proyecto_descripcion}</p>
              : <p style={{ color: '#9ab0c0', fontSize: 13, fontStyle: 'italic', margin: 0 }}>El estudiante no ha registrado una descripción aún.</p>
            }
            {typeof estudiante.proyecto_porcentaje_avance === 'number' && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e8eef4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#4a6070' }}>Progreso del Proyecto</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{estudiante.proyecto_porcentaje_avance}%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#dce8f4', borderRadius: 8 }}>
                  <div style={{ width: `${estudiante.proyecto_porcentaje_avance}%`, height: '100%', background: '#1e3a5f', borderRadius: 8 }} />
                </div>
              </div>
            )}
          </div>

          {/* Sobre mí */}
          {estudiante.sobre_mi && (
            <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7aaa', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Sobre mí</p>
              <p style={{ color: '#4a6070', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{estudiante.sobre_mi}</p>
            </div>
          )}

          {/* Necesidades + Intereses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Oportunidades Laborales */}
            <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <IconHand />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1e2e' }}>Oportunidades Laborales</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {estudiante.busca_pasantia === true && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, border: '1.5px solid #c5d5e5', color: '#1e3a5f', fontSize: 12, fontWeight: 500, width: 'fit-content', background: 'white' }} aria-label="Disponible para prácticas">
                    <IconDot /> Disponible para prácticas profesionales
                  </span>
                )}
                {estudiante.busca_empleo && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, border: '1.5px solid #c5d5e5', color: '#1e3a5f', fontSize: 12, fontWeight: 500, width: 'fit-content', background: 'white' }} aria-label="Disponible para empleo">
                    <IconMoney /> Disponible para empleo
                  </span>
                )}
                {estudiante.busca_mentoria && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, border: '1.5px solid #c5d5e5', color: '#1e3a5f', fontSize: 12, fontWeight: 500, width: 'fit-content', background: 'white' }} aria-label="Disponible para mentorías">
                    <IconBulb /> Disponible para mentorías futuras
                  </span>
                )}
                {(!estudiante.busca_pasantia && !estudiante.busca_empleo && !estudiante.busca_mentoria) && (
                  <span style={{ color: '#9ab0c0', fontSize: 12 }} aria-label="Sin preferencias laborales">
                    Preferencias laborales no registradas
                  </span>
                )}
              </div>
            </div>

            {/* Intereses */}
            <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <IconBrain />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1e2e' }}>Intereses</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {blandas.length > 0
                  ? blandas.map((b, i) => (
                      <span key={i} style={{ padding: '5px 12px', borderRadius: 20, border: '1.5px solid #93c5e8', color: '#1a6090', fontSize: 12, fontWeight: 500, background: '#e8f3fb' }}>{b}</span>
                    ))
                  : <span style={{ color: '#9ab0c0', fontSize: 12 }}>No registrados.</span>
                }
              </div>
            </div>
            {/* Áreas de Interés Profesional */}
            <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <IconBrain />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1e2e' }}>Áreas de Interés Profesional</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0
                  ? estudiante.areas_de_interes.map((a, i) => (
                      <span key={i} style={{ padding: '5px 12px', borderRadius: 20, border: '1.5px solid #93c5e8', color: '#1a6090', fontSize: 12, fontWeight: 500, background: '#e8f3fb' }}>{a}</span>
                    ))
                  : <span style={{ color: '#9ab0c0', fontSize: 12 }}>No especificado.</span>
                }
              </div>
            </div>
          </div>

          {/* Habilidades Técnicas — siempre visible */}
          <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <IconMonitor />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1e2e' }}>Habilidades Técnicas</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tecnicas.length > 0
                ? tecnicas.map((h, i) => (
                    <span key={i} style={{ padding: '5px 14px', borderRadius: 20, border: '1.5px solid #c5d5e5', color: '#1e3a5f', fontSize: 12, fontWeight: 500, background: 'white' }}>{h}</span>
                  ))
                : <span style={{ color: '#9ab0c0', fontSize: 12 }}>No registradas aún.</span>
              }
            </div>
          </div>
        </div>

        {/* ── DERECHA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Expediente Académico */}
          <div style={{ borderRadius: 14, background: 'linear-gradient(145deg, #1e3a5f 0%, #0f2540 100%)', padding: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
            {/* Watermark */}
            <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.08, pointerEvents: 'none' }}>
              <svg width="110" height="110" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: '0 0 20px' }}>Expediente Académico</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                // TODO: [Fase Futura] Conectar 'Número de Carné' con campo real de la BD
                { label: 'Número de Carné', value: 'No disponible' },
                { label: 'Sede Universitaria', value: nd(estudiante.sede) },
                // TODO: [Fase Futura] Conectar 'Nivel Actual' con campo real de la BD
                { label: 'Nivel Actual', value: 'No disponible' },
                ...(estudiante.anio_ingreso ? [{ label: 'Año de Ingreso', value: String(estudiante.anio_ingreso) }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#7ab0d8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>{label}</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'white', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Especialización Principal */}
          <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <IconMonitor />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1e2e' }}>Especialización Principal</span>
            </div>
            <div>
              <span style={{ color: especializacion === 'Información no disponible' ? '#9ab0c0' : '#1e3a5f', fontSize: especializacion === 'Información no disponible' ? 12 : 13, fontWeight: especializacion === 'Información no disponible' ? 400 : 500 }}>{especializacion}</span>
            </div>
          </div>

          {/* Privacidad */}
          <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <IconLock color="#dc2626" size={16} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f1e2e' }}>Privacidad</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#6a8090', lineHeight: 1.6, margin: '0 0 16px' }}>
              Para proteger la integridad del estudiante, la información sensible como el nivel de beca y detalles socioeconómicos están restringidos y solo son visibles para la administración de la Fundación.
            </p>
            {[
              // TODO: [Fase Futura] Conectar 'Nivel de Beca' con campo real de la BD
              { label: 'Nivel de Beca', value: 'Categoría 5' },
              // TODO: [Fase Futura] Conectar 'Promedio Ponderado' con campo real de la BD
              { label: 'Promedio Ponderado', value: '9.25' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #edf2f7' }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#7a9ab0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1e2e', margin: 0 }}>{value}</p>
                </div>
                <IconLock color="#b0c4d8" size={14} />
              </div>
            ))}
          </div>

          {/* Acciones para Mentores */}
          {!isAdmin && (
            <div style={{ borderRadius: 14, border: '1.5px dashed #c5d5e5', background: '#f7fafd', padding: 20 }}>
              <p style={{ fontSize: 11, color: '#7a9ab0', textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Acciones para Mentores</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, background: 'white', border: '1.5px solid #c5d5e5', color: '#0f1e2e', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowMentoriaModal(true)}>
                  <IconBulb /> Ofrecer Mentoría
                </button>
                {/* TODO: [Fase Futura] Implementar Modal completo de Apoyar Proyecto que muestre SINPE (actualmente placeholder) y lógica de copia real */}
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, background: 'white', border: '1.5px solid #c5d5e5', color: '#0f1e2e', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowApoyarModal(true)}>
                  <IconSupport /> Apoyar Proyecto
                </button>
              </div>
            </div>
          )}

          {/* Redes */}
          {(estudiante.url_linkedin || estudiante.url_portfolio) && (
            <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#7a9ab0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Redes y Portafolio</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {estudiante.url_linkedin && (
                  <a href={estudiante.url_linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#1a5db0', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>🔗 LinkedIn</a>
                )}
                {estudiante.url_portfolio && (
                  <a href={estudiante.url_portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#1a5db0', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>🌐 Portafolio</a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ESTUDIANTES RELACIONADOS ── */}
      {estudiantesRelacionados.length > 0 && (
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #dce8f0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1e2e', marginBottom: 6 }}>Otros estudiantes que podrían interesarte</h2>
          {estudiante.carrera && <p style={{ color: '#6a8090', marginBottom: 24 }}>Estudiantes de <strong style={{ color: '#1e3a5f' }}>{estudiante.carrera}</strong>.</p>}
          <GrillaEstudiantes estudiantes={estudiantesRelacionados} />
        </div>
      )}
      {/* ── MODAL MENTORÍA ── */}
      {showMentoriaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 30, 46, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button 
              onClick={() => setShowMentoriaModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: '#7a9ab0', fontSize: 24, lineHeight: 1 }}
            >
              &times;
            </button>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f1e2e', margin: '0 0 8px' }}>Ofrecer Mentoría</h2>
              <p style={{ fontSize: 14, color: '#6a8090', margin: 0 }}>Has seleccionado ofrecer mentoría a <strong style={{ color: '#1e3a5f' }}>{estudiante.nombre}</strong>.</p>
            </div>
            
            <div style={{ background: '#f7fafd', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#4a6a8a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Carrera</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1e3a5f', margin: '0 0 12px' }}>{nd(estudiante.carrera)}</p>
              
              <p style={{ fontSize: 12, fontWeight: 600, color: '#4a6a8a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Especialización Principal</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1e3a5f', margin: '0 0 12px' }}>{especializacion}</p>
              
              <p style={{ fontSize: 12, fontWeight: 600, color: '#4a6a8a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Áreas de Interés</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? (
                  estudiante.areas_de_interes.map((a, i) => (
                    <span key={i} style={{ padding: '3px 8px', borderRadius: 20, border: '1px solid #c5d5e5', color: '#1e3a5f', fontSize: 11, fontWeight: 500, background: 'white' }}>{a}</span>
                  ))
                ) : (
                  <span style={{ color: '#9ab0c0', fontSize: 12 }}>No especificado</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#4a6070', lineHeight: 1.5, margin: 0 }}>
                Las mentorías son una excelente forma de conectar exalumnos experimentados con estudiantes que requieren orientación. 
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f1e2e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Información de Contacto</p>
              {estudiante.url_linkedin || estudiante.url_portfolio ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  {estudiante.url_linkedin && (
                    <a href={estudiante.url_linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, background: '#0a66c2', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', flex: 1 }}>
                      LinkedIn
                    </a>
                  )}
                  {estudiante.url_portfolio && (
                    <a href={estudiante.url_portfolio} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, background: '#1e3a5f', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', flex: 1 }}>
                      Portafolio
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ background: '#f0f4f8', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 12.5, color: '#6a8090', fontWeight: 500 }}>La información de contacto será habilitada por la administración.</span>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button 
                onClick={() => setShowMentoriaModal(false)}
                style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1.5px solid #c5d5e5', color: '#4a6a8a', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL APÓYAR PROYECTO ── */}
      {showApoyarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 30, 46, 0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button
              onClick={() => setShowApoyarModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: '#7a9ab0', fontSize: 24, lineHeight: 1 }}
            >
              &times;
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f1e2e', margin: '0 0 8px' }}>Apoyar Proyecto</h2>
            <p style={{ fontSize: 14, color: '#6a8090', margin: '0 0 16px' }}>
              Estás a punto de apoyar a <strong style={{ color: '#1e3a5f' }}>{estudiante.nombre}</strong> en su proyecto.
            </p>
            <div style={{ background: '#f7fafd', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#4a6a8a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Carrera</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1e3a5f', margin: '0 0 12px' }}>{nd(estudiante.carrera)}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#4a6a8a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Especialización Principal</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1e3a5f', margin: '0 0 12px' }}>{especializacion}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#4a6a8a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Áreas de Interés</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {estudiante.areas_de_interes && estudiante.areas_de_interes.length > 0 ? (
                  estudiante.areas_de_interes.map((a, i) => (
                    <span key={i} style={{ padding: '3px 8px', borderRadius: 20, border: '1px solid #c5d5e5', color: '#1e3a5f', fontSize: 11, fontWeight: 500, background: 'white' }}>{a}</span>
                  ))
                ) : (
                  <span style={{ color: '#9ab0c0', fontSize: 12 }}>No especificado</span>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#4a6070', lineHeight: 1.5, margin: 0 }}>
                Si dispones de datos de contacto (LinkedIn o Portafolio) aparecerán abajo. De lo contrario muestra un mensaje informativo.
              </p>
            </div>
            <div style={{ marginBottom: 24 }}>
              {estudiante.url_linkedin || estudiante.url_portfolio ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  {estudiante.url_linkedin && (
                    <a href={estudiante.url_linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, background: '#0a66c2', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', flex: 1 }}>
                      LinkedIn
                    </a>
                  )}
                  {estudiante.url_portfolio && (
                    <a href={estudiante.url_portfolio} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, background: '#1e3a5f', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', flex: 1 }}>
                      Portafolio
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ background: '#f0f4f8', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 12.5, color: '#6a8090', fontWeight: 500 }}>La información de contacto será habilitada por la administración.</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowApoyarModal(false)} style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1.5px solid #c5d5e5', color: '#4a6a8a', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
