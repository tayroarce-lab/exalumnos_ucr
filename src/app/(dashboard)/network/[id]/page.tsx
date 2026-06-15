import { getAvatarUrl } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Briefcase, MapPin, Linkedin, Mail, Twitter, Instagram, GraduationCap, CheckCircle2, ChevronLeft } from 'lucide-react'

// El servidor inyectará params por ser App Router
export default async function NetworkProfilePage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !profile) {
    notFound()
  }

  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'EX'

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back navigation */}
        <Link 
          href="/network" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-institutional transition-colors uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al Directorio
        </Link>

        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-institutional to-blue-500"></div>
          
          <div className="px-6 sm:px-10 pb-10 relative">
            {/* Avatar */}
            <div className="absolute -top-16 border-4 border-white rounded-full bg-white shadow-md">
              {profile.foto_url ? (
                <img 
                  src={getAvatarUrl(profile.foto_url) as string} 
                  alt={profile.full_name || 'Perfil'} 
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-institutional to-blue-800 text-white flex items-center justify-center text-4xl font-black">
                  {initials}
                </div>
              )}
            </div>

            {/* Acciones principales - Desktop right align */}
            <div className="flex justify-end pt-4 pb-2 min-h-16">
              {profile.linkedin_url && (
                <a 
                  href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-md shadow-blue-900/20"
                >
                  <Linkedin className="w-4 h-4" />
                  Conectar
                </a>
              )}
            </div>

            <div className="mt-4 sm:mt-0 space-y-1">
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 font-display">
                {profile.full_name}
                {profile.es_exalumno && (
                <span title="Exalumno Verificado" className="flex items-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 shrink-0" />
                </span>
                )}
              </h1>
              
              {(profile.cargo_actual || profile.empresa_actual) && (
                <p className="text-lg text-slate-600 font-medium flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>
                    {profile.cargo_actual}
                    {profile.cargo_actual && profile.empresa_actual && ' en '}
                    <span className="font-bold text-slate-800">{profile.empresa_actual}</span>
                  </span>
                </p>
              )}

              {profile.pais_ciudad && (
                <p className="text-sm text-slate-500 flex items-center gap-2 pt-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {profile.pais_ciudad}
                </p>
              )}
            </div>

            {/* Badges de soporte */}
            <div className="flex flex-wrap gap-2 mt-6">
              {profile.ofrece_mentoria && (
                <span className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Ofrece Mentoría
                </span>
              )}
              {profile.ofrece_empleo && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Ofrece Empleo
                </span>
              )}
              {profile.ofrece_pasantia && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Ofrece Pasantías
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
                  Acerca de
                </h2>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Habilidades & Áreas de Interés */}
            {(profile.skills && profile.skills.length > 0) || (profile.areas_de_interes && profile.areas_de_interes.length > 0) ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
                      Habilidades
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string) => (
                        <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-sm font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.areas_de_interes && profile.areas_de_interes.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
                      Áreas de Interés
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.areas_de_interes.map((area: string) => (
                        <span key={area} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-xl text-sm font-semibold">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            
            {/* Contacto Social */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Contacto</h3>
              <div className="space-y-3">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-slate-600 hover:text-institutional transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate">{profile.email}</span>
                  </a>
                )}
                
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#0A66C2] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate">LinkedIn</span>
                  </a>
                )}

                {profile.twitter_url && (
                  <a href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://${profile.twitter_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-sky-500 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate">Twitter</span>
                  </a>
                )}

                {profile.instagram_url && (
                  <a href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-pink-600 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate">Instagram</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
