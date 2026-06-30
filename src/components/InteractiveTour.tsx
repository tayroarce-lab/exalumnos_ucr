'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import 'shepherd.js/dist/css/shepherd.css'

export default function InteractiveTour() {
  const pathname = usePathname()
  const { user } = useProfile()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Solo activar en el inicio del dashboard correspondiente a los roles
    const isDashboard = pathname === '/dashboard' || pathname === '/student-dashboard'
    if (!user || !isDashboard) return

    const role = user?.user_metadata?.rol || 'exalumno'
    const isStudent = role === 'estudiante'

    const startTour = async () => {
      const { default: Shepherd } = await import('shepherd.js')

      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'shepherd-theme-custom shadow-2xl rounded-2xl bg-white border border-slate-200 text-slate-800 font-sans p-6 max-w-md',
          scrollTo: { behavior: 'smooth', block: 'center' }
        }
      })

      // Paso 1: Bienvenida
      tour.addStep({
        id: 'welcome',
        title: isStudent ? '🎓 ¡BIENVENIDO AL PORTAL ESTUDIANTE!' : '✨ ¡BIENVENIDO A TU PORTAL ALUMNI!',
        text: isStudent
          ? 'Este es tu portal para buscar empleo, solicitar mentorías y acelerar tu crecimiento profesional con el apoyo de exalumnos.'
          : 'Esta plataforma te permite conectar con estudiantes con beca socioeconómica, ofrecer mentorías, proponer vacantes y mucho más.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Comenzar Recorrido',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 2: Banner
      tour.addStep({
        id: 'banner',
        attachTo: {
          element: '#tour-welcome-banner',
          on: 'bottom'
        },
        title: '📢 EVENTOS Y ACCIONES CLAVE',
        text: 'Desde este banner principal puedes acceder rápidamente a las vacantes de empleo disponibles y ver convocatorias destacadas.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 3: Accesos Rápidos
      tour.addStep({
        id: 'summary',
        attachTo: {
          element: '#tour-quick-summary',
          on: 'top'
        },
        title: isStudent ? '⚡ ACCESOS RÁPIDOS' : '📊 RESUMEN RÁPIDO',
        text: isStudent
          ? 'Aquí tienes acceso directo a tus aplicaciones de empleo, mentorías solicitadas y a la red de contactos.'
          : 'Consulta en tiempo real la cantidad de mentorías, empleos, eventos y fondos de donación activos.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 4: Próximos pasos
      tour.addStep({
        id: 'events',
        attachTo: {
          element: '#tour-upcoming-events',
          on: 'top'
        },
        title: isStudent ? '🚀 ¿POR DÓNDE EMPEZAR?' : '📅 PRÓXIMOS EVENTOS',
        text: isStudent
          ? 'Sigue estos pasos numerados para completar tu perfil y postularte a las primeras oportunidades.'
          : 'Descubre los talleres, charlas y ferias de empleo programadas por la comunidad. Inscríbete con un solo clic.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 5: Inicio
      tour.addStep({
        id: 'nav-inicio',
        attachTo: {
          element: '#tour-nav-inicio',
          on: 'bottom'
        },
        title: '🏠 INICIO',
        text: 'Regresa al Dashboard principal de tu portal en cualquier momento.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 6: Directorios
      tour.addStep({
        id: 'nav-directorios',
        attachTo: {
          element: '#tour-nav-directorios',
          on: 'bottom'
        },
        title: '👥 DIRECTORIOS',
        text: 'Explora y conecta con estudiantes o graduados de la comunidad UCR.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 7: Mentorías
      tour.addStep({
        id: 'nav-mentorias',
        attachTo: {
          element: '#tour-nav-mentorias',
          on: 'bottom'
        },
        title: '🤝 MENTORÍAS',
        text: isStudent
          ? 'Solicita acompañamiento profesional de exalumnos experimentados.'
          : 'Regístrate como mentor para guiar a estudiantes activos.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 8: Matches
      tour.addStep({
        id: 'nav-matches',
        attachTo: {
          element: '#tour-nav-matches',
          on: 'bottom'
        },
        title: '⚡ MATCHES',
        text: 'Revisa tus conexiones de mentoría aprobadas y activas.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 9: Eventos
      tour.addStep({
        id: 'nav-eventos',
        attachTo: {
          element: '#tour-nav-eventos',
          on: 'bottom'
        },
        title: '📅 EVENTOS',
        text: 'Consulta charlas, talleres y ferias programadas.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 10: Empleos
      tour.addStep({
        id: 'nav-empleos',
        attachTo: {
          element: '#tour-nav-empleos',
          on: 'bottom'
        },
        title: '💼 EMPLEOS',
        text: isStudent
          ? 'Explora y postula a oportunidades laborales exclusivas.'
          : 'Publica ofertas de trabajo o pasantías para la comunidad.',
        buttons: [
          {
            text: 'Omitir',
            classes: 'px-4 py-2 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 transition-colors mr-auto cursor-pointer',
            action: () => tour.cancel()
          },
          {
            text: 'Siguiente',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.next()
          }
        ]
      })

      // Paso 6: Menú de usuario
      tour.addStep({
        id: 'user-menu',
        attachTo: {
          element: '#tour-user-menu',
          on: 'bottom'
        },
        title: '⚙️ TU PERFIL Y CONFIGURACIÓN',
        text: 'Administra tu cuenta, actualiza tu hoja de vida/proyecto y repite este tour cuando lo necesites.',
        buttons: [
          {
            text: 'Finalizar',
            classes: `px-5 py-2 text-xs uppercase font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
              isStudent ? 'bg-[#54BCEB] hover:bg-[#3FAEDD]' : 'bg-[#F34B26] hover:bg-[#D03816]'
            }`,
            action: () => tour.complete()
          }
        ]
      })

      const handleTourEnd = () => {
        localStorage.setItem('alumni_ucr_tour_completed', 'true')
      }

      tour.on('complete', handleTourEnd)
      tour.on('cancel', handleTourEnd)

      tour.start()
    }

    // Auto-disparo sólo la primera vez
    const hasCompletedTour = localStorage.getItem('alumni_ucr_tour_completed')
    if (hasCompletedTour !== 'true') {
      const timer = setTimeout(() => {
        startTour()
      }, 1500)
      return () => clearTimeout(timer)
    }

    // Escuchar el evento de inicio manual
    const handleManualStart = () => {
      startTour()
    }
    window.addEventListener('start-interactive-tour', handleManualStart)
    return () => {
      window.removeEventListener('start-interactive-tour', handleManualStart)
    }
  }, [pathname, user])

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* Estilos para el tooltip de Shepherd */
      .shepherd-theme-custom {
        border-radius: 1.25rem !important;
        border: 1px solid rgba(226, 232, 240, 0.8) !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        font-family: 'DM Sans', 'Work Sans', sans-serif !important;
        padding: 0.5rem !important;
      }
      .exalumnos-theme-dark .shepherd-theme-custom {
        background-color: #0b1329 !important;
        color: #f1f5f9 !important;
        border-color: rgba(51, 65, 85, 0.8) !important;
      }
      .shepherd-header {
        background: transparent !important;
        padding: 0.75rem 1rem 0.25rem 1rem !important;
      }
      .shepherd-title {
        font-family: 'Barlow Semi Condensed', sans-serif !important;
        font-size: 1.1rem !important;
        font-weight: 800 !important;
        letter-spacing: 0.05em !important;
        color: #0f172a !important;
      }
      .exalumnos-theme-dark .shepherd-title {
        color: #f8fafc !important;
      }
      .shepherd-text {
        font-size: 0.875rem !important;
        line-height: 1.5 !important;
        color: #475569 !important;
        padding: 0.25rem 1rem 1rem 1rem !important;
      }
      .exalumnos-theme-dark .shepherd-text {
        color: #cbd5e1 !important;
      }
      .shepherd-footer {
        padding: 0.5rem 1rem 1rem 1rem !important;
        display: flex !important;
        justify-content: flex-end !important;
        align-items: center !important;
      }
      .shepherd-button {
        transition: all 0.2s ease-in-out !important;
      }
      .shepherd-cancel-icon {
        display: none !important;
      }
      .shepherd-arrow,
      .shepherd-arrow::before {
        background: white !important;
      }
      .exalumnos-theme-dark .shepherd-arrow,
      .exalumnos-theme-dark .shepherd-arrow::before {
        background: #0b1329 !important;
      }
    `}} />
  )
}
