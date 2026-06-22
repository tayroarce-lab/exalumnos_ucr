import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/card'
import { Phone, ShieldCheck } from 'lucide-react'

import ProfileHeader from './components/ProfileHeader'
import ProfileTabs from './components/ProfileTabs'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const rol = user.user_metadata?.rol as string | undefined
  const isAdmin = rol === 'admin'

  const name = profile?.full_name || user.user_metadata?.nombre || 'Nuevo Usuario'
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const email = profile?.email || user.email || ''
  const phone = profile?.phone || 'No especificado'
  const location = profile?.pais_ciudad || 'No especificada'
  
  const headline = isAdmin 
    ? 'Administrador del Sistema' 
    : (profile?.cargo_actual ? `${profile.cargo_actual} en ${profile.empresa_actual}` : 'Exalumno UCR')

  const skills = (profile?.skills as string[]) || []
  const academicRaw = (profile?.academic as any[]) || []
  const academic = academicRaw.map((a: any) => ({
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

  return (
    <div className="py-8 px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Unificado */}
        <ProfileHeader 
          name={name}
          initials={initials}
          email={email}
          location={location}
          headline={headline}
          avatarUrl={profile?.foto_url}
          bannerUrl={profile?.banner_url}
          isOwner={true}
        />

        {isAdmin ? (
          <Card hoverEffect={false} className="space-y-6 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                Información Administrativa
              </h3>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium text-emerald-600">Nivel de acceso total</span>
              </div>
            </div>
          </Card>
        ) : (
          <ProfileTabs 
            profile={profile}
            user={user}
            name={name}
            email={email}
            phone={phone}
            location={location}
            initials={initials}
            linkedin={linkedin}
            twitter={twitter}
            instagram={instagram}
            skills={skills}
            academic={academic}
            experience={experience}
          />
        )}
      </div>
    </div>
  )
}
