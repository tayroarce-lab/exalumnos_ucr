'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Maximize2, Minimize2, Send, Sparkles, RefreshCw,
  GraduationCap, Briefcase, FileText
} from 'lucide-react'
import mascotImg from '@/images/mascota_ucr_3d.png'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { getOrCreateActiveAiChat, getTfgDraft } from '@/actions/ai-chat'
import TfgDraftPreview, { TfgDraft } from '@/components/tfg/TfgDraftPreview'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: Date
}

const SUGGESTED_PROMPTS = [
  { text: '📄 Ayuda para formular mi TFG', type: 'tfg', icon: FileText },
  { text: '🎓 ¿Cómo optimizar mi currículum?', type: 'cv', icon: GraduationCap },
  { text: '💼 ¿Dónde ver ofertas de empleo?', type: 'jobs', icon: Briefcase },
  { text: '🎯 Tips para entrevistas de trabajo', type: 'interview', icon: Sparkles },
]

export default function StudentAIButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showDraft, setShowDraft] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [draft, setDraft] = useState<TfgDraft | null>(null)

  const chatIdRef = useRef<string | null>(null)

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/chat',
      body: { chatId: chatIdRef.current },
      prepareSendMessagesRequest: ({ messages, id, body }) => ({
        body: {
          ...body,
          chatId: chatIdRef.current,
          messages,
          id,
        }
      })
    })
  }, [])

  const { messages, setMessages, sendMessage, status } = useChat({
    transport,
  })

  const [input, setInput] = useState('')
  const isLoading = status === 'submitted' || status === 'streaming'

  // Fetch draft when chat is open and messages change
  useEffect(() => {
    if (isOpen && showDraft) {
      getTfgDraft().then(res => setDraft(res as TfgDraft))
    }
  }, [messages, isOpen, showDraft])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  useEffect(() => {
    chatIdRef.current = chatId
  }, [chatId])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || !chatId) return
    sendMessage({ text: input })
    setInput('')
  }

  const sendText = (text: string) => {
    if (!chatId) return
    sendMessage({ text })
  }

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  useEffect(() => {
    if (isOpen && !chatId && !isLoadingHistory) {
      setIsLoadingHistory(true)
      getOrCreateActiveAiChat().then(res => {
        if (res.chatId) {
          setChatId(res.chatId)
          setMessages(res.initialMessages as any)
        }
        setIsLoadingHistory(false)
      })
    }
  }, [isOpen, chatId, isLoadingHistory, setMessages])

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !chatId) return
    sendText(text)
  }

  const handleResetChat = () => {
    setMessages([])
    setChatId(null)
  }

  // Format the text representation of message, handling tool calls
  const renderMessageContent = (msg: any) => {
    let text = msg.content || '';
    if (msg.parts && Array.isArray(msg.parts)) {
      text = msg.parts.map((p: any) => p.text || '').join('');
    }
    
    // Add visual indicator for tool invocations
    if (msg.toolInvocations && msg.toolInvocations.length > 0) {
      const isSaving = msg.toolInvocations.some((t: any) => !t.state || t.state !== 'result');
      return (
        <div className="flex flex-col gap-2">
          {text && <p>{text}</p>}
          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
            {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
            <span>{isSaving ? 'Actualizando borrador TFG...' : 'Borrador TFG actualizado.'}</span>
          </div>
        </div>
      )
    }
    return <p>{text}</p>
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3 mr-2 px-4 py-2.5 bg-white text-slate-800 text-xs font-bold rounded-2xl shadow-xl border border-slate-100 pointer-events-auto whitespace-nowrap relative flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#54BCEB] animate-pulse" />
              <span>¿Tienes preguntas de tu carrera? ¡Pregúntame!</span>
              <div className="absolute top-full right-6 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-white" />
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
            className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#54BCEB] via-sky-400 to-emerald-400 shadow-[0_8px_32px_rgba(84,188,235,0.45)] flex items-center justify-center border-[3px] border-white transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(84,188,235,0.65)] cursor-pointer"
            aria-label="Asistente de Inteligencia Artificial"
          >
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-[#54BCEB] to-emerald-400 opacity-0 hover:opacity-55 blur-md transition-opacity duration-300 -z-10" />
            <span className="absolute top-0.5 right-0.5 block h-4 w-4 rounded-full ring-2 ring-white bg-emerald-400 z-20 shadow-sm" />
            <span className="absolute top-0.5 right-0.5 block h-4 w-4 rounded-full ring-2 ring-white bg-emerald-400 z-20 animate-ping opacity-75" />
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

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className={`bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 relative ${
                isFullScreen
                  ? 'fixed inset-0 w-screen h-screen rounded-none z-50'
                  : showDraft 
                    ? 'w-full max-w-[1000px] h-[95vh] md:h-[680px] rounded-none md:rounded-2xl border border-slate-100 overflow-hidden'
                    : 'w-full max-w-2xl h-[95vh] md:h-[680px] rounded-none md:rounded-2xl border border-slate-100 overflow-hidden'
              }`}
            >
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
                    onClick={() => setShowDraft(!showDraft)}
                    className={`p-2 rounded-xl transition-all cursor-pointer border ${showDraft ? 'bg-white text-[#54BCEB] border-white' : 'text-white/80 hover:text-white hover:bg-white/20 border-transparent hover:border-white/30'}`}
                    title="Ver Mi Borrador TFG"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
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
                  >
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); setIsFullScreen(false) }}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                <div className={`flex flex-col h-full bg-white transition-all duration-300 ${showDraft ? 'w-1/2 border-r border-slate-200' : 'w-full'}`}>
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-white">
                    {messages.length === 0 ? (
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
                          <h4 className="text-base font-black text-slate-800 font-display">¡Hola! Soy tu guía virtual</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Estoy aquí para ayudarte a formular tu TFG paso a paso, mejorar tu perfil o buscar empleo.
                          </p>
                          {isLoadingHistory && (
                            <p className="text-xs text-[#54BCEB] font-medium animate-pulse mt-4">
                              Cargando historial...
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-line ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-[#54BCEB] to-sky-400 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none border-l-4 border-l-[#54BCEB]'
                            }`}
                          >
                            {renderMessageContent(msg)}
                            <span className={`text-[9px] block text-right mt-2 opacity-60 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                              {((msg as any).createdAt instanceof Date) 
                                ? ((msg as any).createdAt as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                : new Date((msg as any).createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
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

                  <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Escribe aquí tu respuesta o pregunta..."
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-[#F9FAFB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#54BCEB]/25 focus:border-[#54BCEB] text-sm text-slate-800 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading || isLoadingHistory}
                        className="p-3 rounded-xl bg-[#54BCEB] text-white hover:bg-sky-500 transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center shadow-md shadow-sky-200/40"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {showDraft && (
                  <div className="w-1/2 bg-slate-50 flex flex-col relative">
                    <TfgDraftPreview draft={draft} />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
