'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MapPin, Briefcase, GraduationCap, Mail, Linkedin, Twitter, 
  Instagram, Lock, CheckCircle2, Volume2, Bell, Send, 
  MoreHorizontal, Plus, Check, MessageSquare, ExternalLink, 
  FileText, Shield, Star, Award, Heart, Sparkles, X, ChevronRight
} from 'lucide-react'
import { getAvatarUrl } from '@/lib/utils'

interface RecommendedProfile {
  id: string
  full_name: string
  foto_url: string | null
  headline: string
  rol: string
}

interface ProfileData {
  id: string
  full_name: string
  foto_url: string | null
  es_exalumno: boolean
  rol: string
  email: string | null
  linkedin_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  cargo_actual: string | null
  empresa_actual: string | null
  pais_ciudad: string | null
  ofrece_mentoria: boolean
  ofrece_empleo: boolean
  ofrece_pasantia: boolean
  bio: string | null
  skills: string[]
  areas_de_interes: string[]
  proyecto_titulo?: string | null
  proyecto_descripcion?: string | null
  proyecto_valor_monto?: number | null
  proyecto_valor_moneda?: string | null
  proyecto_video_url?: string | null
  proyecto_documento_url?: string | null
}

interface LinkedInProfileClientProps {
  profile: ProfileData
  isAdmin: boolean
  connectionStatus: 'none' | 'contactado' | 'activo'
  recommendedProfiles: RecommendedProfile[]
}

export default function LinkedInProfileClient({
  profile,
  isAdmin,
  connectionStatus: initialConnectionStatus,
  recommendedProfiles
}: LinkedInProfileClientProps) {
  const [connectionStatus, setConnectionStatus] = useState(initialConnectionStatus)
  const [isMuted, setIsMuted] = useState(true)
  const [bellActive, setBellActive] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  
  // Chat drawer state
  const [chatExpanded, setChatExpanded] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{ sender: 'me' | 'them'; text: string; time: string }[]>([
    { sender: 'them', text: `Hola, ¡gracias por conectar! ¿En qué te puedo colaborar?`, time: '10:30 AM' }
  ])

  // Skill validations state
  const [validatedSkills, setValidatedSkills] = useState<Record<string, { count: number; userHasValidated: boolean }>>({})

  // Recommendations state
  const [recommendations, setRecommendations] = useState([
    {
      id: 'r1',
      authorName: 'Antonio David Mora',
      authorTitle: 'Consultor de IA & Automatización',
      authorAvatar: null,
      relationship: 'Trabajó con Santiago en la UCR',
      date: '14 de mayo, 2026',
      text: 'Excelente profesional con una gran disposición para ayudar y compartir conocimientos sobre inteligencia artificial y mentorías.'
    },
    {
      id: 'r2',
      authorName: 'María Fernanda Ruiz',
      authorTitle: 'Directora de Recursos Humanos',
      authorAvatar: null,
      relationship: 'Santiago fue cliente de María Fernanda',
      date: '2 de abril, 2026',
      text: 'Santiago demostró un liderazgo excepcional durante el proyecto de vinculación. Altamente recomendado para mentoría y liderazgo de equipos.'
    }
  ])
  const [showRecommendationModal, setShowRecommendationModal] = useState(false)
  const [newRecommendation, setNewRecommendation] = useState({ text: '', relationship: 'Colaboró con Santiago' })

  // Initialize skills validation count
  useEffect(() => {
    const initial: Record<string, { count: number; userHasValidated: boolean }> = {}
    profile.skills.forEach((skill, idx) => {
      // Deterministic validation count based on skill string length
      initial[skill] = {
        count: (skill.length % 5) + 3,
        userHasValidated: false
      }
    })
    setValidatedSkills(initial)
  }, [profile.skills])

  // Audio pronunciation toggle
  const playPronunciation = () => {
    setIsMuted(false)
    const utterance = new SpeechSynthesisUtterance(profile.full_name)
    utterance.lang = 'es-ES'
    utterance.onend = () => setIsMuted(true)
    window.speechSynthesis.speak(utterance)
  }

  // Handle connection request
  const handleConnect = () => {
    if (connectionStatus === 'none') {
      setConnectionStatus('contactado')
    } else if (connectionStatus === 'contactado') {
      setConnectionStatus('none')
    } else {
      // If active, disconnect/remove
      if (confirm('¿Deseas eliminar a este usuario de tus contactos?')) {
        setConnectionStatus('none')
      }
    }
  }

  // Handle skill validation
  const toggleValidateSkill = (skill: string) => {
    setValidatedSkills(prev => {
      const current = prev[skill]
      if (!current) return prev
      return {
        ...prev,
        [skill]: {
          count: current.userHasValidated ? current.count - 1 : current.count + 1,
          userHasValidated: !current.userHasValidated
        }
      }
    })
  }

  // Handle submitting new recommendation
  const handleAddRecommendation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRecommendation.text.trim()) return

    const newRec = {
      id: `r-${Date.now()}`,
      authorName: 'Tú (Usuario UCR)',
      authorTitle: 'Estudiante en Universidad de Costa Rica',
      authorAvatar: null,
      relationship: newRecommendation.relationship,
      date: 'Hoy',
      text: newRecommendation.text
    }

    setRecommendations([newRec, ...recommendations])
    setNewRecommendation({ text: '', relationship: 'Colaboró con Santiago' })
    setShowRecommendationModal(false)
  }

  // Handle send message in drawer
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    setChatHistory([
      ...chatHistory,
      { sender: 'me', text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ])
    setChatMessage('')

    // Simulated reply after 1.5 seconds
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'them',
          text: `¡Hola! He recibido tu mensaje. Estaré encantado de ponernos en contacto para hablar más al respecto.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    }, 1500)
  }

  const initials = profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'EX'

  return (
    <div className="min-h-screen bg-[#F4F2EE] font-sans antialiased text-[#191919] py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUMNA PRINCIPAL (Izquierda - 3/4) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. TARJETA CABECERA DE PERFIL */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm relative">
            {/* Banner superior */}
            <div className="h-48 w-full bg-gradient-to-r from-[#003B4F] via-[#2F526B] to-[#54BCEB] relative overflow-hidden">
              {/* Patrón de fondo geométrico */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
              
              {/* Información promocional estilo Santiago */}
              <div className="absolute inset-y-0 left-8 right-8 flex justify-between items-center text-white z-10 py-4">
                <div className="max-w-[60%] space-y-1">
                  <div className="flex items-center gap-1.5 bg-[#F34B26] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
                    <Sparkles className="w-2.5 h-2.5" /> Comunidad UCR
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                    {profile.es_exalumno ? 'Exalumno Verificado' : 'Estudiante Activo'}
                  </h2>
                  <p className="text-[10px] md:text-xs text-slate-100 font-medium line-clamp-2">
                    {profile.cargo_actual ? `Profesional en ${profile.cargo_actual}` : 'Explorando oportunidades y proyectos de vinculación.'}
                  </p>
                </div>
                
                {/* Visualización del rol */}
                <div className="hidden sm:flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl shadow-lg text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#54BCEB] leading-none">UCR Network</span>
                  <span className="text-sm font-black mt-1 uppercase tracking-tight">{profile.rol}</span>
                </div>
              </div>
            </div>

            {/* Fila del Avatar */}
            <div className="px-6 md:px-8 relative pb-6">
              {/* Avatar circular solapado */}
              <div className="absolute -top-16 left-6 md:left-8 border-4 border-white rounded-full bg-white shadow-md z-20">
                {profile.foto_url ? (
                  <img 
                    src={getAvatarUrl(profile.foto_url) as string} 
                    alt={profile.full_name} 
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#003B4F] to-[#54BCEB] text-white flex items-center justify-center text-4xl font-extrabold">
                    {initials}
                  </div>
                )}
              </div>

              {/* Botón Campana de notificaciones */}
              <div className="flex justify-end pt-4 pb-2 min-h-[56px] gap-2 items-center">
                <button 
                  onClick={() => setBellActive(!bellActive)}
                  className={`p-2 rounded-full transition-colors ${bellActive ? 'bg-orange-50 text-[#F34B26]' : 'hover:bg-slate-100 text-slate-500'}`}
                  title="Activar notificaciones de publicaciones"
                >
                  <Bell className="w-5 h-5" fill={bellActive ? '#F34B26' : 'none'} />
                </button>
              </div>

              {/* Información Personal (Nombre, Headline, Ubicación) */}
              <div className="mt-4 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    {/* Nombre, Pronunciación y Grado de conexión */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-none">
                        {profile.full_name}
                      </h1>
                      <button 
                        onClick={playPronunciation}
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        title="Escuchar pronunciación del nombre"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-slate-500">
                        · {connectionStatus === 'activo' ? '1er' : '2º'}
                      </span>
                    </div>

                    {/* Headline */}
                    <p className="text-sm text-slate-700 font-medium mt-1 leading-snug max-w-2xl">
                      {profile.cargo_actual 
                        ? `${profile.cargo_actual} en ${profile.empresa_actual || 'Independiente'}` 
                        : (profile.bio ? profile.bio.substring(0, 100) + '...' : 'Exalumno / Estudiante de la Universidad de Costa Rica')}
                    </p>

                    {/* Ubicación e Info de Contacto */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {profile.pais_ciudad || 'San José, Costa Rica'}
                      </span>
                      <span>•</span>
                      <button 
                        onClick={() => setShowContactModal(true)}
                        className="text-[#0A66C2] hover:text-[#004182] font-bold hover:underline"
                      >
                        Información de contacto
                      </button>
                    </div>

                    {/* Seguidores y Contactos */}
                    <p className="text-xs font-semibold text-[#0A66C2] hover:underline cursor-pointer mt-1">
                      {connectionStatus === 'activo' ? '1,844 seguidores · Más de 500 contactos' : '124 seguidores · 45 contactos'}
                    </p>
                  </div>

                  {/* Organización/Universidad en el lado derecho */}
                  <div className="flex items-center gap-2 border border-slate-100 rounded-lg p-2 max-w-xs self-start md:self-center bg-slate-50/50">
                    <div className="w-8 h-8 rounded bg-[#003B4F] flex items-center justify-center text-white shrink-0 font-bold text-xs">
                      UCR
                    </div>
                    <span className="text-xs font-bold text-slate-700 leading-tight">
                      Universidad de Costa Rica
                    </span>
                  </div>
                </div>

                {/* Contactos en común mockeados para total realismo */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-300 border border-white flex items-center justify-center text-[8px] font-black">AD</div>
                    <div className="w-6 h-6 rounded-full bg-[#54BCEB] border border-white flex items-center justify-center text-[8px] font-black text-white">IM</div>
                    <div className="w-6 h-6 rounded-full bg-orange-200 border border-white flex items-center justify-center text-[8px] font-black text-orange-800">MA</div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    <span className="font-bold text-slate-700">Antonio David Mora, Iván Mieres</span> y 4 contactos más en común
                  </p>
                </div>

                {/* Botones de acción principales */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {/* Botón principal de Conexión/Mensaje */}
                  {connectionStatus === 'activo' ? (
                    <button 
                      onClick={() => setChatExpanded(true)}
                      className="bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm px-5 py-1.5 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4 rotate-45 -mt-0.5" /> Enviar mensaje
                    </button>
                  ) : (
                    <button 
                      onClick={handleConnect}
                      className="bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm px-5 py-1.5 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1"
                    >
                      {connectionStatus === 'contactado' ? (
                        <>
                          <Check className="w-4 h-4" /> Pendiente
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Conectar
                        </>
                      )}
                    </button>
                  )}

                  {/* Botón de Contactar por correo */}
                  {profile.email && (
                    <a 
                      href={`mailto:${profile.email}`}
                      className="border border-[#F34B26] hover:bg-orange-50/50 text-[#F34B26] font-bold text-sm px-5 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                    >
                      <Mail className="w-4 h-4" /> Contactar
                    </a>
                  )}

                  {/* Menú Más opciones */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                      className="border border-slate-400 hover:bg-slate-50 text-slate-600 font-bold text-sm p-1.5 rounded-full transition-all"
                      title="Más acciones"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {showMoreDropdown && (
                      <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 text-sm">
                        <button 
                          onClick={() => {
                            window.print()
                            setShowMoreDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                        >
                          <FileText className="w-4 h-4" /> Guardar como PDF
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            alert('Enlace copiado al portapapeles!')
                            setShowMoreDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                        >
                          <ExternalLink className="w-4 h-4" /> Compartir perfil
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 2. SALES INSIGHTS / SEÑALES CLAVE */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              <Shield className="w-4 h-4 text-[#003B4F]" /> Sales Insights
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Señales clave</h3>
            <p className="text-xs text-slate-600 mb-4">Recomendaciones e intereses para entablar una conversación exitosa.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 font-bold">
                  🎓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">UCR Alumni Network</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Estudió en la misma universidad que tú. Es una gran forma de iniciar la conversación.</p>
                </div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 font-bold">
                  🤝
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Apoyo a la Comunidad</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {profile.ofrece_mentoria && 'Ofrece activamente mentorías de carrera. '}
                    {profile.ofrece_empleo && 'Dispone de oportunidades de empleo en su empresa. '}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. BIOGRAFÍA / ACERCA DE */}
          {profile.bio && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Acerca de</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* 4. PROYECTO ESTUDIANTIL (Si es Estudiante) */}
          {profile.rol === 'estudiante' && profile.proyecto_titulo && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F34B26] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">
                  Proyecto de Graduación
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">{profile.proyecto_titulo}</h2>
              </div>
              
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {profile.proyecto_descripcion}
              </p>

              {profile.proyecto_valor_monto != null && (
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Presupuesto Estimado:</span>
                  <span className="text-sm font-black text-emerald-700">
                    {profile.proyecto_valor_moneda === 'USD' ? '$' : '₡'}
                    {profile.proyecto_valor_monto.toLocaleString('es-CR')}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {profile.proyecto_documento_url && (
                  <a 
                    href={profile.proyecto_documento_url.startsWith('http') ? profile.proyecto_documento_url : `https://${profile.proyecto_documento_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5" /> Descargar Documento
                  </a>
                )}
                {profile.proyecto_video_url && (
                  <a 
                    href={profile.proyecto_video_url.startsWith('http') ? profile.proyecto_video_url : `https://${profile.proyecto_video_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-red-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Ver Video Explicativo
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 5. SECCIÓN DE HABILIDADES Y VALIDACIONES */}
          {profile.skills.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Habilidades</h2>
              <p className="text-xs text-slate-500 mb-6">Valida las habilidades de {profile.full_name} si has colaborado con él/ella.</p>
              
              <div className="space-y-4">
                {profile.skills.map((skill) => {
                  const val = validatedSkills[skill] || { count: 0, userHasValidated: false }
                  return (
                    <div key={skill} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-4">
                      <div>
                        <span className="text-sm font-bold text-slate-800">{skill}</span>
                        {val.count > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                            <span>{val.count} {val.count === 1 ? 'validación' : 'validaciones'}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleValidateSkill(skill)}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all border shrink-0 ${
                          val.userHasValidated 
                            ? 'bg-[#0A66C2] text-white border-[#0A66C2] hover:bg-[#004182]' 
                            : 'border-slate-500 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {val.userHasValidated ? 'Validado ✓' : 'Validar'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 6. RECOMENDACIONES (Interactiva!) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Recomendaciones</h2>
              <button 
                onClick={() => setShowRecommendationModal(true)}
                className="text-xs font-bold text-[#0A66C2] hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Escribir recomendación
              </button>
            </div>

            <div className="space-y-6">
              {recommendations.map((rec) => (
                <div key={rec.id} className="flex gap-4 items-start border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-full bg-[#003B4F]/10 text-[#003B4F] flex items-center justify-center font-bold shrink-0">
                    {rec.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{rec.authorName}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {rec.authorTitle} • {rec.relationship}
                    </p>
                    <p className="text-[11px] text-slate-400">{rec.date}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 italic bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                      "{rec.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COLUMNA LATERAL (Derecha - 1/4) */}
        <div className="space-y-6">
          
          {/* 1. AD CARD (Replicación Anuncio LinkedIn) */}
          <div className="bg-[#0A66C2] rounded-lg p-5 text-white shadow-sm flex flex-col justify-between min-h-[300px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="space-y-4 relative z-10">
              {/* Logo LinkedIn mock */}
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-white">Linked</span>
                <span className="bg-white text-[#0A66C2] font-black text-xs px-1 rounded">in</span>
              </div>

              <h3 className="text-xl font-bold leading-tight">
                Your job search powered by your network
              </h3>
              <p className="text-xs text-slate-100/90 leading-relaxed">
                Conéctate con mentores calificados, encuentra empleos y impulsa tu carrera profesional con la comunidad UCR.
              </p>
            </div>

            <div className="mt-6 relative z-10">
              <Link 
                href="/jobs"
                className="inline-block w-full text-center border-2 border-white text-white hover:bg-white/10 font-bold text-xs py-2 rounded-full transition-all"
              >
                Explore jobs
              </Link>
            </div>
          </div>

          {/* 2. RECOMENDADOS (Más perfiles para ti) */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Más perfiles para ti</h3>
            
            <div className="space-y-4">
              {recommendedProfiles.length > 0 ? (
                recommendedProfiles.map((rec) => {
                  const recInit = rec.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  return (
                    <div key={rec.id} className="flex gap-3 items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      {/* Avatar */}
                      <Link href={`/network/${rec.id}`} className="shrink-0">
                        {rec.foto_url ? (
                          <img 
                            src={getAvatarUrl(rec.foto_url) as string} 
                            alt={rec.full_name} 
                            className="w-12 h-12 rounded-full object-cover hover:opacity-85 transition-opacity"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors">
                            {recInit}
                          </div>
                        )}
                      </Link>

                      {/* Info & Botón */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Link 
                            href={`/network/${rec.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-[#0A66C2] hover:underline truncate"
                          >
                            {rec.full_name}
                          </Link>
                          <span className="text-[10px] font-semibold text-slate-400">· 2º</span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                          {rec.headline}
                        </p>
                        
                        {/* Botón de conectar/mensaje */}
                        <Link href={`/network/${rec.id}`} className="inline-flex items-center gap-1 border border-slate-500 hover:bg-slate-50 text-slate-600 text-[10px] font-bold py-1 px-3.5 rounded-full transition-all mt-1">
                          <Send className="w-2.5 h-2.5 rotate-45" /> Mensaje
                        </Link>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-slate-400">No hay otros perfiles disponibles.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ----------------- POPUPS & DRAWER INTERACTIVOS ----------------- */}

      {/* A. MODAL: INFORMACIÓN DE CONTACTO */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Información de contacto de {profile.full_name}
              </h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {profile.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-500">Correo electrónico</h4>
                    <a href={`mailto:${profile.email}`} className="text-sm font-semibold text-[#0A66C2] hover:underline">
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {profile.linkedin_url && (
                <div className="flex items-start gap-3">
                  <Linkedin className="w-5 h-5 text-[#0A66C2] mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-500">Perfil de LinkedIn</h4>
                    <a 
                      href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-sm font-semibold text-[#0A66C2] hover:underline"
                    >
                      {profile.linkedin_url}
                    </a>
                  </div>
                </div>
              )}

              {profile.twitter_url && (
                <div className="flex items-start gap-3">
                  <Twitter className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-500">Twitter</h4>
                    <a 
                      href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://${profile.twitter_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#0A66C2] hover:underline"
                    >
                      {profile.twitter_url}
                    </a>
                  </div>
                </div>
              )}

              {profile.instagram_url && (
                <div className="flex items-start gap-3">
                  <Instagram className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-500">Instagram</h4>
                    <a 
                      href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#0A66C2] hover:underline"
                    >
                      {profile.instagram_url}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. MODAL: ESCRIBIR RECOMENDACIÓN */}
      {showRecommendationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form 
            onSubmit={handleAddRecommendation}
            className="relative w-full max-w-md bg-white rounded-lg shadow-2xl p-6 border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Escribir recomendación para {profile.full_name}
              </h3>
              <button 
                type="button"
                onClick={() => setShowRecommendationModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Relación profesional</label>
                <select 
                  value={newRecommendation.relationship}
                  onChange={e => setNewRecommendation(p => ({ ...p, relationship: e.target.value }))}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded focus:outline-none focus:border-[#0A66C2]"
                >
                  <option value="Colaboró con Santiago">Colaboró con {profile.full_name}</option>
                  <option value="Trabajó con Santiago en la UCR">Trabajó con {profile.full_name} en la UCR</option>
                  <option value="Supervisó a Santiago directamente">Supervisó a {profile.full_name} directamente</option>
                  <option value="Fue cliente de Santiago">Fue cliente de {profile.full_name}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Recomendación</label>
                <textarea 
                  rows={4}
                  required
                  placeholder={`Escribe algo positivo sobre ${profile.full_name}...`}
                  value={newRecommendation.text}
                  onChange={e => setNewRecommendation(p => ({ ...p, text: e.target.value }))}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded focus:outline-none focus:border-[#0A66C2]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setShowRecommendationModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-4 py-2 rounded-full"
              >
                Publicar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* C. MENSAJES DRAWER (Replicación LinkedIn Mensajes) */}
      <div 
        className={`fixed bottom-0 right-6 w-80 bg-white border border-slate-200 rounded-t-lg shadow-xl z-40 transition-all duration-300 ${
          chatExpanded ? 'h-96' : 'h-11'
        }`}
      >
        {/* Header Drawer */}
        <div 
          onClick={() => setChatExpanded(!chatExpanded)}
          className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 cursor-pointer rounded-t-lg select-none hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            {/* Avatar circular con puntito online verde */}
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-[#003B4F]/10 text-[#003B4F] flex items-center justify-center font-bold text-[8px]">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            <span className="text-xs font-bold text-slate-800">Mensajes</span>
          </div>
          <span className="text-slate-500">
            <ChevronRight className={`w-4 h-4 transform transition-transform ${chatExpanded ? 'rotate-90' : '-rotate-90'}`} />
          </span>
        </div>

        {/* Chat Content */}
        {chatExpanded && (
          <div className="flex flex-col h-[calc(100%-44px)]">
            {/* Historial de mensajes */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50">
              {chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[9px] text-slate-400 mb-0.5">{msg.time}</span>
                  <div className={`p-2.5 rounded-lg text-xs leading-normal shadow-sm ${
                    msg.sender === 'me' 
                      ? 'bg-[#0A66C2] text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input para escribir */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 flex gap-1.5 bg-white">
              <input 
                type="text"
                placeholder="Escribe un mensaje..."
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-full focus:outline-none focus:border-[#0A66C2] bg-slate-50"
              />
              <button 
                type="submit"
                disabled={!chatMessage.trim()}
                className="p-1.5 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5 rotate-45 -mt-0.5 mr-0.5" />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  )
}
