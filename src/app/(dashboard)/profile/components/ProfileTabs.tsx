'use client'

import React, { useState, useEffect } from 'react'
import Card from '@/components/ui/card'
import { getProyectoFileUrl } from '@/lib/utils'
import ProyectoDonacionesProgreso from '@/components/ProyectoDonacionesProgreso'
import { obtenerInsigniasDonador } from '@/actions/donations'
import { 
  Phone, 
  Linkedin, 
  Twitter, 
  Instagram, 
  GraduationCap, 
  CheckCircle2, 
  Lock,
  BookOpen,
  FileText,
  Video,
  DollarSign,
  Lightbulb
} from 'lucide-react'

export default function ProfileTabs({ profile, user, name, email, phone, location, initials, linkedin, twitter, instagram, skills, academic, experience }: any) {
  const isStudent = profile?.rol === 'estudiante'
  const [insignias, setInsignias] = useState<any[]>([])

  useEffect(() => {
    if (profile?.id && profile?.rol === 'exalumno') {
      obtenerInsigniasDonador(profile.id).then(setInsignias)
    }
  }, [profile])
  
  const tabs = isStudent 
    ? ['personal', 'academica', 'proyecto'] 
    : ['personal', 'academica', 'profesional']

  const [activeTab, setActiveTab] = useState('personal')

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'personal': return 'Información personal'
      case 'academica': return 'Académica'
      case 'profesional': return 'Profesional'
      case 'proyecto': return 'Proyecto de Graduación'
      default: return tab
    }
  }

  const formatBeca = (beca: string) => {
    if (!beca) return 'No registrada'
    switch (beca.toLowerCase()) {
      case 'ninguna': return 'Ninguna'
      case 'nivel1': return 'Beca 1'
      case 'nivel2': return 'Beca 2'
      case 'nivel3': return 'Beca 3'
      case 'nivel4': return 'Beca 4'
      case 'nivel5': return 'Beca 5 (100%)'
      default: return beca
    }
  }

  const formatNivel = (nivel: string) => {
    if (!nivel) return 'No especificado'
    const mappings: Record<string, string> = {
      bachillerato: 'Bachillerato',
      licenciatura: 'Licenciatura',
      maestria: 'Maestría',
      doctorado: 'Doctorado'
    }
    return mappings[nivel.toLowerCase()] || nivel
  }

  const formatProyectoTipo = (tipo: string) => {
    if (!tipo) return 'Proyecto de Graduación'
    switch (tipo.toLowerCase()) {
      case 'tfg': return 'Trabajo Final de Graduación (TFG)'
      case 'tesis': return 'Tesis de Grado'
      case 'practica_dirigida': return 'Práctica Dirigida'
      case 'seminario': return 'Seminario de Graduación'
      default: return tipo
    }
  }

  return (
    <>
      {/* Pestañas */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-[#F34B26] text-[#F34B26]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      <Card hoverEffect={false} className="space-y-6 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-in fade-in duration-300">
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

            {profile?.bio && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biografía / Acerca de mí</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {user?.hobbies && user.hobbies.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pasatiempos / Hobbies</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.hobbies.map((hobby: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{hobby}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Insignias AlumniUCR */}
            {!isStudent && insignias.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  Insignias AlumniUCR
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {insignias.map((insignia) => (
                    <div 
                      key={insignia.id}
                      title={insignia.description}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all hover:scale-105 cursor-help ${insignia.color}`}
                    >
                      <span className="text-base shrink-0">{insignia.icon}</span>
                      <span>{insignia.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'academica' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {isStudent ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#F34B26]" />
                    Expediente Académico UCR
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información Pública/Académica */}
                  <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalles de Carrera</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Carrera</span>
                        <span className="text-sm font-bold text-slate-800">{profile.carrera || 'Carrera no especificada'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Escuela / Facultad</span>
                        <span className="text-sm font-semibold text-slate-700">{profile.escuela_facultad || 'No especificada'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Sede</span>
                        <span className="text-sm font-semibold text-slate-700">{profile.sede || 'No especificada'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Año de Ingreso</span>
                        <span className="text-sm font-semibold text-slate-700">{profile.anio_ingreso || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Nivel Académico Actual</span>
                        <span className="text-sm font-semibold text-slate-700 capitalize">{formatNivel(profile.nivel_academico)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Información Privada (Solo visible para el dueño) */}
                  <div className="space-y-4 bg-amber-50/20 p-5 rounded-2xl border border-amber-200/50 relative overflow-hidden">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        Privado (Solo visible para ti)
                      </h4>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">Protegido</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Carné Estudiantil</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{profile.carnet_ucr || 'No registrado'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Promedio Ponderado</span>
                        <span className="text-sm font-bold text-slate-800">
                          {profile.promedio_ponderado !== undefined && profile.promedio_ponderado !== null && profile.promedio_ponderado !== 0 
                            ? Number(profile.promedio_ponderado).toFixed(2) 
                            : 'No registrado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Nivel de Beca Socioeconómica</span>
                        <span className="text-sm font-bold text-slate-800">{formatBeca(profile.beca_socioeconomica)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
              </div>
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

        {activeTab === 'profesional' && !isStudent && (
          <div className="space-y-6 animate-in fade-in duration-300">
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

            {(profile?.areas_de_interes && profile.areas_de_interes.length > 0) && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Áreas de Interés</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.areas_de_interes.map((area: string, idx: number) => (
                    <span key={idx} className="bg-[#54BCEB]/10 text-[#54BCEB] px-3 py-1 rounded-full text-xs font-semibold">{area}</span>
                  ))}
                </div>
              </div>
            )}

            {(profile?.ofrece_mentoria || profile?.ofrece_empleo || profile?.ofrece_pasantia || profile?.ofrece_proyecto || profile?.ofrece_donacion_dinero || profile?.busca_mentoria || profile?.busca_empleo || profile?.busca_pasantia) && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disposición e Intereses</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  {profile?.ofrece_mentoria && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Ofrece mentoría técnica/profesional {profile?.horas_mes_mentoria ? `(${profile.horas_mes_mentoria}h/mes)` : ''}</span>
                    </li>
                  )}
                  {profile?.ofrece_empleo && (
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Ofrece oportunidades de empleo</span></li>
                  )}
                  {profile?.ofrece_pasantia && (
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Ofrece oportunidades de pasantía</span></li>
                  )}
                  {profile?.ofrece_proyecto && (
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Apoya proyectos de graduación (TFG)</span></li>
                  )}
                  {profile?.ofrece_donacion_dinero && (
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Apoya financieramente proyectos</span></li>
                  )}
                  {profile?.busca_mentoria && (
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#54BCEB] shrink-0 mt-0.5" /><span>Busca mentoría profesional</span></li>
                  )}
                  {profile?.busca_empleo && (
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#54BCEB] shrink-0 mt-0.5" /><span>Busca empleo</span></li>
                  )}
                  {profile?.busca_pasantia && (
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#54BCEB] shrink-0 mt-0.5" /><span>Busca pasantía</span></li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'proyecto' && isStudent && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#54BCEB]" />
                Proyecto de Graduación
              </h3>
            </div>

            {profile?.proyecto_titulo ? (
              <div className="space-y-6">
                {/* Título y Tipo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#54BCEB]/10 text-[#54BCEB] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {formatProyectoTipo(profile.proyecto_tipo)}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Avance: {profile.proyecto_porcentaje_avance || 0}%
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 leading-snug">{profile.proyecto_titulo}</h4>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Progreso del proyecto</span>
                    <span>{profile.proyecto_porcentaje_avance || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#54BCEB] to-[#F34B26] transition-all duration-500" 
                      style={{ width: `${profile.proyecto_porcentaje_avance || 0}%` }}
                    />
                  </div>
                </div>

                {/* Barra de donaciones si busca financiamiento */}
                {profile.busca_financiamiento && profile.proyecto_valor_monto && (
                  <ProyectoDonacionesProgreso 
                    proyectoId={profile.id || profile.user_id || user?.id} 
                    metaMonto={profile.proyecto_valor_monto} 
                    metaMoneda={profile.proyecto_valor_moneda} 
                  />
                )}

                {/* Imagen del Proyecto */}
                {profile.proyecto_foto_url && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-80 w-full relative">
                    <img 
                      src={getProyectoFileUrl(profile.proyecto_foto_url) || ''} 
                      alt={`Imagen de ${profile.proyecto_titulo}`}
                      className="w-full h-full object-cover object-center max-h-80"
                    />
                  </div>
                )}

                {/* Descripción */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción del Proyecto</h5>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.proyecto_descripcion}</p>
                </div>

                {/* Beneficios para donadores */}
                {profile.proyecto_beneficios && (
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Beneficios para patrocinadores</h5>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.proyecto_beneficios}</p>
                    {profile.proyecto_beneficios_fotos && profile.proyecto_beneficios_fotos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                        {profile.proyecto_beneficios_fotos.map((fotoUrl: string, idx: number) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-square relative bg-slate-105">
                            <img 
                              src={getProyectoFileUrl(fotoUrl) || ''} 
                              alt={`Recompensa ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Grid de detalles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Apoyo Financiero */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                      Apoyo Financiero
                    </h5>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        {profile.busca_financiamiento ? (
                          <>
                            El estudiante <span className="font-bold text-emerald-600">busca financiamiento</span> para este proyecto.
                          </>
                        ) : (
                          "Este proyecto no requiere financiamiento económico directo."
                        )}
                      </p>
                      {profile.busca_financiamiento && profile.proyecto_valor_monto && (
                        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Presupuesto / Apoyo Solicitado</span>
                          <span className="text-lg font-bold text-emerald-700">
                            {profile.proyecto_valor_moneda || 'USD'} {Number(profile.proyecto_valor_monto).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documentación y Video */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enlaces y Recursos</h5>
                    <div className="flex flex-col gap-2">
                      {profile.proyecto_documento_url ? (
                        <a 
                          href={getProyectoFileUrl(profile.proyecto_documento_url) || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-3 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                        >
                          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Ver Documentación / Propuesta</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2.5 p-3 bg-slate-100/50 text-slate-400 border border-slate-200/50 rounded-xl text-xs font-semibold">
                          <FileText className="w-4 h-4 text-slate-300 shrink-0" />
                          <span>No hay documento cargado</span>
                        </div>
                      )}

                      {profile.proyecto_video_url ? (
                        <a 
                          href={profile.proyecto_video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-3 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                        >
                          <Video className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>Ver Video de Presentación</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2.5 p-3 bg-slate-100/50 text-slate-400 border border-slate-200/50 rounded-xl text-xs font-semibold">
                          <Video className="w-4 h-4 text-slate-300 shrink-0" />
                          <span>No hay video cargado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Necesidades del Proyecto */}
                {profile.proyecto_necesidades && profile.proyecto_necesidades.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-[#FF9B18]" />
                      Necesidades del Proyecto
                    </h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.proyecto_necesidades.map((nec: string, idx: number) => (
                        <span key={idx} className="bg-[#FF9B18]/10 text-[#FF9B18] px-3 py-1 rounded-full text-xs font-semibold">
                          {nec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disposición del Estudiante */}
                {(profile.busca_mentoria || profile.busca_empleo || profile.busca_pasantia) && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intereses del Estudiante</h5>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {profile.busca_mentoria && (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#54BCEB] shrink-0 mt-0.5" />
                          <span>Busca mentoría profesional/técnica con egresados</span>
                        </li>
                      )}
                      {profile.busca_pasantia && (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#54BCEB] shrink-0 mt-0.5" />
                          <span>Busca oportunidades de pasantía</span>
                        </li>
                      )}
                      {profile.busca_empleo && (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#54BCEB] shrink-0 mt-0.5" />
                          <span>Busca empleo formal / primer empleo</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">No se han registrado detalles del proyecto de graduación.</p>
            )}
          </div>
        )}
      </Card>
    </>
  )
}
