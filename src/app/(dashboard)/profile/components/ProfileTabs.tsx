'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/card'
import { Phone, Linkedin, Twitter, Instagram, GraduationCap, CheckCircle2 } from 'lucide-react'

export default function ProfileTabs({ profile, user, name, email, phone, location, initials, linkedin, twitter, instagram, skills, academic, experience }: any) {
  const [activeTab, setActiveTab] = useState('personal')

  return (
    <>
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
            
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información de contacto</h4>
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{phone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academica' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
              Historial Académico
            </h3>
            {academic.length > 0 ? academic.map((edu: any, idx: number) => (
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
            )) : (
              <p className="text-xs text-slate-500 font-medium">No hay información académica registrada.</p>
            )}

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Habilidades</h4>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">No se han especificado habilidades.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profesional' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
              Experiencia Profesional
            </h3>
            <div className="space-y-6">
              {experience.length > 0 ? experience.map((exp: any, idx: number) => (
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
    </>
  )
}
