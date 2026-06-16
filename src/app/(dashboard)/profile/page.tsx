'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  MapPin,
  Mail,
  Linkedin,
  Phone,
  GraduationCap,
  Twitter,
  Instagram,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'

import { useProfile } from '@/contexts/ProfileContext'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal')
  const { user, profile, isLoading } = useProfile()
  const router = useRouter()

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return <div className="py-20 text-center text-slate-500 font-medium">Cargando perfil...</div>
  }

  const rol = user?.user_metadata?.rol as string | undefined
  const isAdmin = rol === 'admin'

  const name = profile?.full_name || user?.user_metadata?.nombre || 'Nuevo Usuario'
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const email = profile?.email || user?.email || ''
  const phone = profile?.phone || 'No especificado'
  const location = profile?.pais_ciudad || 'No especificada'
  const bio = profile?.bio || 'Sin biografía'
  const skills = (profile?.skills as string[]) || []

  const academicRaw = (profile?.academic as any[]) || []
  const academic = academicRaw.map(a => ({
    degree: a.carrera || 'Carrera no especificada',
    school: a.escuela || 'Escuela no especificada',
    year: a.anio ? `Graduado/a en ${a.anio}` : 'Año no especificado',
    verified: false
  }))

  const experience: { role: string; company: string; period: string; desc: string }[] = []
  if (profile?.empresa_actual && profile?.cargo_actual) {
    experience.push({
      role: profile.cargo_actual,
      company: profile.empresa_actual,
      period: profile.anos_experiencia ? `${profile.anos_experiencia} años de exp.` : 'Actualidad',
      desc: profile.sector_industria && (profile.sector_industria as string[]).length > 0
        ? `Sector: ${(profile.sector_industria as string[]).join(', ')}`
        : ''
    })
  }

  const linkedin = profile?.linkedin_url || ''
  const twitter = profile?.twitter_url || ''
  const instagram = profile?.instagram_url || ''

  if (isAdmin) {
    return (
      <div className="py-8 px-6 lg:px-10">
<<<<<<< HEAD
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="pt-2 space-y-1">
            <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">Mi Perfil</h1>
            <p className="text-sm text-slate-600 font-medium">Gestiona tu información personal.</p>
          </div>
=======
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="pt-2 space-y-1">
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">Mi Perfil</h1>
          <p className="text-sm text-slate-600 font-medium">Gestiona tu información personal, académica y profesional.</p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'personal'
              ? 'border-[#F34B26] text-[#F34B26]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Información personal
        </button>
        <button
          onClick={() => setActiveTab('academica')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'academica'
              ? 'border-[#F34B26] text-[#F34B26]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Académica
        </button>
        <button
          onClick={() => setActiveTab('profesional')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'profesional'
              ? 'border-[#F34B26] text-[#F34B26]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Profesional
        </button>
        </div>
>>>>>>> 98348902efc77a6241f34bb8f970a96c6592b08c

          <Card hoverEffect={false} className="space-y-6 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-[#F34B26] flex items-center justify-center font-bold text-white text-3xl">
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#F34B26] text-white rounded-full p-1 border border-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-xl text-slate-800 uppercase tracking-wider">{name}</h3>
                  <span className="inline-block bg-[#F34B26]/10 text-[#F34B26] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Administrador
                  </span>
                  <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1 pt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{email}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{location}</span>
                  </p>
                </div>
              </div>

              <Link href="/profile/edit">
                <Button variant="primary" className="bg-[#F34B26] hover:bg-[#C82A08] hover:scale-105 active:scale-95 transition-all duration-300 font-bold uppercase tracking-wider text-xs px-6 py-2.5 border-0">
                  Editar perfil
                </Button>
              </Link>
            </div>

            {/* Info adicional */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{phone}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ─── VISTA ESTÁNDAR PARA EXALUMNOS / ESTUDIANTES ───────────────────────────
  return (
    <div className="py-8 px-6 lg:px-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pt-2 space-y-1">
          <h1 className="text-4xl font-extrabold uppercase font-display text-slate-900 tracking-wide">Mi Perfil</h1>
          <p className="text-sm text-slate-600 font-medium">Gestiona tu información personal, académica y profesional.</p>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {['personal', 'academica', 'profesional'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-[#F34B26] text-[#F34B26]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'personal' ? 'Información personal' : tab === 'academica' ? 'Académica' : 'Profesional'}
            </button>
          ))}
        </div>

        <Card hoverEffect={false} className="space-y-6 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-[#F34B26]/10 border border-[#F34B26]/20 overflow-hidden flex items-center justify-center font-bold text-[#F34B26] text-3xl">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#F34B26] text-white rounded-full p-1 border border-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-black text-xl text-slate-800 uppercase tracking-wider">{name}</h3>
                    <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1">
                      <Mail className="w-3.5 h-3.5" /><span>{email}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1">
                      <Phone className="w-3.5 h-3.5" /><span>{phone}</span>
                    </p>
                    <p className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3.5 h-3.5" /><span>{location}</span>
                    </p>
                  </div>
                </div>
                <Link href="/profile/edit">
                  <Button variant="primary" className="bg-[#F34B26] hover:bg-[#C82A08] hover:scale-105 active:scale-95 transition-all duration-300 font-bold uppercase tracking-wider text-xs px-6 py-2.5 border-0">
                    Editar perfil
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Redes sociales</h4>
                <div className="flex items-center gap-3">
                  {linkedin && (
                    <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" title="Ver perfil de LinkedIn" className="p-2.5 bg-slate-100 hover:bg-[#F34B26] hover:text-white text-slate-500 rounded-xl transition-all">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {twitter && (
                    <a href={twitter.startsWith('http') ? twitter : `https://${twitter}`} target="_blank" rel="noopener noreferrer" title="Ver perfil de Twitter" className="p-2.5 bg-slate-100 hover:bg-[#F34B26] hover:text-white text-slate-500 rounded-xl transition-all">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {instagram && (
                    <a href={instagram.startsWith('http') ? instagram : `https://${instagram}`} target="_blank" rel="noopener noreferrer" title="Ver perfil de Instagram" className="p-2.5 bg-slate-100 hover:bg-[#F34B26] hover:text-white text-slate-500 rounded-xl transition-all">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {!linkedin && !twitter && !instagram && (
                    <span className="text-xs text-slate-400 font-medium">No configurado</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academica' && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Historial Académico
              </h3>
              {academic.length > 0 ? academic.map((edu, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="p-3 bg-[#F34B26]/10 text-[#F34B26] border border-[#F34B26]/10 rounded-xl shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{edu.degree}</h4>
                      {edu.verified && (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verificado</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{edu.school}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{edu.year}</p>
                  </div>
                </div>
<<<<<<< HEAD
              )) : (
                <p className="text-xs text-slate-500 font-medium">No hay información académica registrada.</p>
              )}
=======
                <Link href="/profile/edit">
                  <Button variant="primary" className="bg-brand-blue hover:bg-brand-blue/90 font-bold uppercase tracking-wider text-xs px-6 py-2.5">
                    Editar perfil
                  </Button>
                </Link>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Redes sociales</h4>
                  <div className="flex items-center gap-3">
                    {linkedin && (
                      <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="p-2.5 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-500 rounded-xl transition-all">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {twitter && (
                      <a href={twitter.startsWith('http') ? twitter : `https://${twitter}`} target="_blank" rel="noopener noreferrer" title="Twitter" className="p-2.5 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-500 rounded-xl transition-all">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {instagram && (
                      <a href={instagram.startsWith('http') ? instagram : `https://${instagram}`} target="_blank" rel="noopener noreferrer" title="Instagram" className="p-2.5 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-500 rounded-xl transition-all">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {!linkedin && !twitter && !instagram && (
                      <span className="text-xs text-slate-400 font-medium">No configurado</span>
                    )}
                  </div>
                </div>
>>>>>>> 98348902efc77a6241f34bb8f970a96c6592b08c

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Habilidades</h4>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium">No se han especificado habilidades.</p>
                  )}
                </div>
              </div>
            </div>
          )}

<<<<<<< HEAD
=======
          {/* Pestaña: Información Académica */}
          {activeTab === 'academica' && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Historial Académico
              </h3>
              <div className="space-y-6">
                {academic.length > 0 ? academic.map((edu, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="p-3 bg-institutional/10 text-institutional border border-institutional/10 rounded-xl shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{edu.degree}</h4>
                      <p className="text-xs font-bold text-institutional">{edu.school}</p>
                      <p className="text-xs text-slate-500 font-medium">{edu.year}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 font-medium">No hay información académica registrada.</p>
                )}
              </div>
            </div>
          )}

>>>>>>> 98348902efc77a6241f34bb8f970a96c6592b08c
          {activeTab === 'profesional' && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Experiencia Profesional
              </h3>
              <div className="space-y-6">
                {experience.length > 0 ? experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-200 space-y-1.5">
                    <div className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#F34B26]"></div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{exp.role}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#FF9B18]">{exp.company}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{exp.desc}</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 font-medium">No hay experiencia profesional registrada.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
