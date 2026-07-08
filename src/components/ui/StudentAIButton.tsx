'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Maximize2,
  Minimize2,
  Send,
  Sparkles,
  Bot,
  RefreshCw,
  CornerDownLeft,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Users
} from 'lucide-react'
import mascotImg from '@/images/mascota_ucr_3d.png'

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  { text: '📄 ¿Cómo optimizar mi currículum?', type: 'cv', icon: GraduationCap },
  { text: '💼 ¿Dónde ver ofertas de empleo?', type: 'jobs', icon: Briefcase },
  { text: '🤝 ¿Cómo solicitar una mentoría?', type: 'mentorship', icon: Users },
  { text: '🎯 Tips para entrevistas de trabajo', type: 'interview', icon: Sparkles },
]

const MOCK_ANSWERS: Record<string, string> = {
  cv: '¡Excelente pregunta! 🎓 Para optimizar tu currículum:\n\n1. Usa un diseño de una sola página si tienes menos de 5 años de experiencia.\n2. Incluye palabras clave de la oferta de trabajo.\n3. Enfócate en logros y resultados utilizando el formato: "Acción + Contexto + Resultado".',
  jobs: '💼 Para ver las ofertas de empleo disponibles:\n\nVe al panel de inicio y selecciona la tarjeta "Buscar Empleos". Ahí podrás filtrar vacantes por área profesional, modalidad (presencial/remoto) y ver los requerimientos directamente.',
  mentorship: '🤝 Conectar con un mentor es súper fácil:\n\nEntra a "Solicitar Mentoría". Podrás ver perfiles de graduados destacados de tu misma área. Elige uno y envíale una solicitud contándole brevemente tus metas profesionales.',
  interview: '🎯 Prepárate para ganar tu próxima entrevista:\n\n1. Investiga la cultura e historia de la empresa.\n2. Practica el Método STAR para responder preguntas sobre tus experiencias.\n3. Prepara 2 preguntas inteligentes para hacerle al reclutador al final.',
  default: '¡Hola! Estoy listo para ayudarte a navegar tu carrera profesional. ¿Te gustaría que hablemos sobre vacantes de empleo, mentorías o cómo mejorar tu CV?'
}

export default function StudentAIButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response with natural delay
    setTimeout(() => {
      let aiText = MOCK_ANSWERS.default
      const lowercaseText = text.toLowerCase()

      if (lowercaseText.includes('cv') || lowercaseText.includes('currículum') || lowercaseText.includes('curriculum')) {
        aiText = MOCK_ANSWERS.cv
      } else if (lowercaseText.includes('empleo') || lowercaseText.includes('oferta') || lowercaseText.includes('trabajo') || lowercaseText.includes('vacante')) {
        aiText = MOCK_ANSWERS.jobs
      } else if (lowercaseText.includes('mentor') || lowercaseText.includes('mentoría') || lowercaseText.includes('asesor')) {
        aiText = MOCK_ANSWERS.mentorship
      } else if (lowercaseText.includes('entrevista') || lowercaseText.includes('tips') || lowercaseText.includes('consejo')) {
        aiText = MOCK_ANSWERS.interview
      }

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: aiText,
          timestamp: new Date()
        }
      ])
      setIsTyping(false)
    }, 1000)
  }

  const handleResetChat = () => {
    setMessages([])
  }

  return (
    <>
      {/* Floating Action Button (Mascot) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3 mr-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 pointer-events-auto whitespace-nowrap relative flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#54BCEB] animate-pulse" />
              <span>¿Tienes preguntas de tu carrera? ¡Pregúntame!</span>
              <div className="absolute top-full right-6 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-white dark:border-t-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={isOpen ? { scale: 0, opacity: 0 } : { y: [0, -6, 0] }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 0.2 }
          }}
          className="pointer-events-auto"
        >
          <motion.button
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#54BCEB] via-sky-400 to-emerald-400 shadow-[0_8px_32px_rgba(84,188,235,0.45)] dark:shadow-[0_8px_32px_rgba(84,188,235,0.2)] flex items-center justify-center border-[3px] border-white dark:border-slate-800 transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(84,188,235,0.65)] cursor-pointer"
            aria-label="Asistente de Inteligencia Artificial"
          >
            {/* Neon Ring Glow */}
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-[#54BCEB] to-emerald-400 opacity-0 hover:opacity-55 blur-md transition-opacity duration-300 -z-10" />

            <span className="absolute top-0.5 right-0.5 block h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-800 bg-emerald-400 z-20 shadow-sm" />
            <span className="absolute top-0.5 right-0.5 block h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-800 bg-emerald-400 z-20 animate-ping opacity-75" />

            <div className="relative w-[85%] h-[85%] overflow-hidden rounded-full bg-sky-50 flex items-center justify-center shadow-inner">
              <Image
                src={mascotImg}
                alt="Mascota IA UCR"
                fill
                className="object-contain object-bottom scale-110 translate-y-0.5 select-none pointer-events-none"
                priority
              />
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* AI Assistant Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className={`bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 relative ${
                isFullScreen
                  ? 'fixed inset-0 w-screen h-screen rounded-none z-50'
                  : 'w-full max-w-2xl h-[95vh] md:h-[680px] rounded-none md:rounded-2xl border border-slate-100 overflow-hidden'
              }`}
            >
              {/* Header with Creative Gradient Accent */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#54BCEB] via-[#8DD4F0] to-[#F5A623] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-[#54BCEB] shadow-sm">
                    <Image
                      src={mascotImg}
                      alt="Mascota IA"
                      fill
                      className="object-contain object-bottom scale-115 translate-y-0.5"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-display tracking-tight">
                      Asistente de IA
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/80 font-bold">Orientación Profesional Activa</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResetChat}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/30"
                    title="Limpiar chat"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/30"
                    title={isFullScreen ? 'Restaurar ventana' : 'Expandir pantalla completa'}
                  >
                    {isFullScreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false)
                      setIsFullScreen(false)
                    }}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                    title="Cerrar asistente"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Chat Content Space */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-white">
                {messages.length === 0 ? (
                  /* Creative Empty Welcome State */
                  <div className="h-full flex flex-col justify-center items-center py-6 text-center space-y-6">
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#54BCEB] to-emerald-300 p-1 shadow-md">
                      <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={mascotImg}
                          alt="Mascota"
                          width={60}
                          height={60}
                          className="object-contain translate-y-1.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <h4 className="text-base font-black text-slate-800 font-display">
                        ¡Hola! Soy tu guía virtual
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Estoy aquí para ayudarte a mejorar tu perfil, buscar pasantías, empleos o encontrar un mentor ideal. Escribe tu pregunta abajo para empezar.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Conversation list */
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-line ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-[#54BCEB] to-sky-400 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none border-l-4 border-l-[#54BCEB]'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span
                          className={`text-[9px] block text-right mt-2 opacity-60 ${
                            msg.sender === 'user' ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing status indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none border-l-4 border-l-[#54BCEB] px-4 py-3 text-sm shadow-sm flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium">Pensando</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#54BCEB] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#54BCEB] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#54BCEB] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Sticky bottom suggested prompts bar (if chat is active) */}
              {messages.length > 0 && (
                <div className="px-6 py-2 border-t border-slate-100 bg-white flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="text-[10px] font-bold px-3 py-1.5 bg-[#F2F7FA] text-slate-600 hover:text-[#54BCEB] rounded-full border border-slate-200/50 hover:border-[#54BCEB]/50 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Form Area */}
              <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage(inputValue)
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Pregúntame sobre empleo, CV o mentorías..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-[#F9FAFB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#54BCEB]/25 focus:border-[#54BCEB] text-sm text-slate-800 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-3 rounded-xl bg-[#54BCEB] text-white hover:bg-sky-500 transition-colors disabled:opacity-40 disabled:hover:bg-[#54BCEB] cursor-pointer flex items-center justify-center shadow-md shadow-sky-200/40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] text-slate-400">
                  <span>Asistente interactivo • Simulación de respuestas</span>
                  <span className="flex items-center gap-1">
                    Enviar con Enter <CornerDownLeft className="w-2.5 h-2.5 text-slate-300" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
