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
  Briefcase,
  Globe,
  Twitter,
  Instagram,
  CheckCircle2
} from 'lucide-react'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal')

  const [profile, setProfile] = useState({
    name: 'Ana Maria González',
    initials: 'AG',
    title: 'Ingeniera en Sistemas',
    company: 'Tech Costa Rica',
    location: 'San José, Costa Rica',
    email: 'ana.maria@ucr.ac.cr',
    phone: '+506 8888-8888',
    linkedin: 'linkedin.com/in/anamaria-gonzalez',
    twitter: 'twitter.com/anamaria',
    instagram: 'instagram.com/anamaria',
    bio: 'Ingeniera en Sistemas con pasión por la tecnología, la educación y el impacto social. Me encanta contribuir a mi comunidad UCR.',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Cloud Computing'],
    academic: [
      {
        degree: 'Bachillerato en Ciencias de la Computación e Informática',
        school: 'Escuela de Ciencias de la Computación e Informática (ECCI), UCR',
        year: 'Graduada en 2021',
        verified: true
      }
    ],
    experience: [
      {
        role: 'Senior Software Engineer',
        company: 'Tech Costa Rica',
        period: '2023 - Presente',
        desc: 'Diseño e implementación de microservicios y frontend interactivos de alta disponibilidad.'
      },
      {
        role: 'Software Developer',
        company: 'GBM',
        period: '2021 - 2023',
        desc: 'Desarrollo de integraciones empresariales y optimización de consultas de bases de datos relacionales.'
      }
    ]
  })

  React.useEffect(() => {
    const storedName = localStorage.getItem('userName')
    const storedEmail = localStorage.getItem('userEmail')
    if (storedName || storedEmail) {
      const name = storedName || 'Ana Maria González'
      const initials = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      
      setProfile((prev) => ({
        ...prev,
        name,
        email: storedEmail || prev.email,
        initials
      }))
    }
  }, [])

  return (
    <div className="py-8 px-6 lg:px-10">
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
              ? 'border-institutional text-institutional'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Información personal
        </button>
        <button
          onClick={() => setActiveTab('academica')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'academica'
              ? 'border-institutional text-institutional'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Académica
        </button>
        <button
          onClick={() => setActiveTab('profesional')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'profesional'
              ? 'border-institutional text-institutional'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Profesional
        </button>
          <Link href="/profile/edit" className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-slate-400 hover:text-slate-600 whitespace-nowrap">
            Configuración
          </Link>
        </div>

        {/* Contenido Principal */}
        <Card hoverEffect={false} className="space-y-6 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        
        {/* Pestaña: Información Personal */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Cabecera de Perfil */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                {/* Foto circular con avatar dinámico */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-institutional text-3xl">
                    {profile.initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-institutional text-white rounded-full p-1 border border-white">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-xl text-slate-800 uppercase tracking-wider">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{profile.email}</span>
                  </p>
                  <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{profile.phone}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profile.location}</span>
                  </p>
                </div>
              </div>

              <Link href="/profile/edit">
                <Button variant="primary" className="bg-brand-blue hover:bg-brand-blue/90 font-bold uppercase tracking-wider text-xs px-6 py-2.5">
                  Editar perfil
                </Button>
              </Link>
            </div>

            {/* Acerca de mí y Redes Sociales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="md:col-span-2 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acerca de mí</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {profile.bio}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Redes sociales</h4>
                <div className="flex items-center gap-3">
                  <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" title="Ver perfil de LinkedIn" className="p-2.5 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-500 rounded-xl transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href={`https://${profile.twitter}`} target="_blank" rel="noopener noreferrer" title="Ver perfil de Twitter" className="p-2.5 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-500 rounded-xl transition-all">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href={`https://${profile.instagram}`} target="_blank" rel="noopener noreferrer" title="Ver perfil de Instagram" className="p-2.5 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-500 rounded-xl transition-all">
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Habilidades */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Información Académica */}
        {activeTab === 'academica' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
              Historial Académico
            </h3>
            {profile.academic.map((edu, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl shrink-0">
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
            ))}
          </div>
        )}

        {/* Pestaña: Información Profesional */}
        {activeTab === 'profesional' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
              Experiencia Profesional
            </h3>
            <div className="space-y-6">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-200 space-y-1.5">
                  <div className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-brand-blue"></div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{exp.role}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-brand-celeste">{exp.company}</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        </Card>
      </div>
    </div>
  )
}
