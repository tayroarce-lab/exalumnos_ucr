'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Briefcase, Mail, Linkedin, Twitter, Instagram, 
  Lock, CheckCircle2, Volume2, Send, X, Heart, Sparkles, Plus, Clock, Check
} from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';
import { requestDirectConnection, cancelDirectConnection } from '@/actions/matches';
import { useRouter } from 'next/navigation';

interface RecommendedProfile {
  id: string;
  full_name: string;
  foto_url: string | null;
  headline: string;
  rol: string;
}

interface ProfileData {
  id: string;
  full_name: string;
  foto_url: string | null;
  es_exalumno: boolean;
  rol: string;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  cargo_actual: string | null;
  empresa_actual: string | null;
  pais_ciudad: string | null;
  ofrece_mentoria: boolean;
  ofrece_empleo: boolean;
  ofrece_pasantia: boolean;
  bio: string | null;
  skills: string[];
  areas_de_interes: string[];
}

interface StitchProfileClientProps {
  profile: ProfileData;
  isAdmin: boolean;
  connectionStatus: 'none' | 'contactado' | 'activo';
  recommendedProfiles: RecommendedProfile[];
  currentUserId: string | undefined;
}

export default function StitchProfileClient({
  profile,
  isAdmin,
  connectionStatus: initialConnectionStatus,
  recommendedProfiles,
  currentUserId
}: StitchProfileClientProps) {
  const [status, setStatus] = useState(initialConnectionStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setLoading(true);
    const result = await requestDirectConnection(profile.id);
    if (result.success) {
      setStatus('contactado');
      router.refresh();
    } else {
      alert(result.error || 'Error al conectar');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    const result = await cancelDirectConnection(profile.id);
    if (result.success) {
      setStatus('none');
      router.refresh();
    } else {
      alert(result.error || 'Error al cancelar la solicitud');
    }
    setLoading(false);
  };

  const showContactInfo = isAdmin || status === 'activo' || currentUserId === profile.id;
  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'EX';

  return (
    <div className="min-h-screen bg-[#FAF9F0] -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#3C3935]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/network" 
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C877D] hover:text-[#3C3935] transition-colors uppercase tracking-wider"
          >
            ← Volver al Directorio
          </Link>
        </div>

        {/* Main Card (Hero Section) */}
        <div className="bg-white rounded-[32px] border border-[#ECEAE1] shadow-sm overflow-hidden relative">
          
          {/* Banner container */}
          <div className="h-44 bg-gradient-to-r from-[#D7ECFA] to-[#EBF6FF] relative p-6 flex items-start justify-between">
            {/* Left Pill (Role/Badge) */}
            <span className="bg-white border border-[#B34700] text-[#B34700] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              {profile.rol === 'exalumno' ? '🎓 MENTOR EN GENERAL' : '🎓 ESTUDIANTE'}
            </span>

            {/* Right Pill (Connection Request state) */}
            {status === 'contactado' && (
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-[#ECEAE1] px-4 py-1.5 rounded-full shadow-sm">
                <span className="text-[11px] font-bold text-[#6D6A61] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B34700]" />
                  Solicitud Pendiente
                </span>
                <button 
                  onClick={handleCancel} 
                  disabled={loading}
                  className="text-xs font-black text-[#F34B26] hover:text-red-700 transition-colors uppercase"
                >
                  ✕ Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Profile details details container */}
          <div className="px-8 pb-8 relative pt-20">
            {/* Avatar (Overlapping) */}
            <div className="absolute -top-16 left-8 border-4 border-white rounded-full bg-white shadow-sm w-32 h-32 overflow-hidden flex items-center justify-center">
              {profile.foto_url ? (
                <img 
                  src={getAvatarUrl(profile.foto_url) as string} 
                  alt={profile.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#EBF6FF] text-[#0A66C2] flex items-center justify-center text-4xl font-black">
                  {initials}
                </div>
              )}

              {/* Verified badge */}
              {profile.es_exalumno && (
                <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow">
                  <CheckCircle2 className="w-6 h-6 text-[#2ECC71] fill-[#E8F8F5]" />
                </div>
              )}
            </div>

            {/* Top right actions (Desktop align) */}
            <div className="absolute top-4 right-8 flex items-center gap-3">
              {/* Message button (Play-style icon) */}
              <button 
                onClick={() => {
                  if (profile.email) {
                    window.location.href = `mailto:${profile.email}`;
                  } else {
                    alert('Este exalumno no ha configurado un correo electrónico público.');
                  }
                }}
                className="flex items-center gap-2 bg-[#B34700] hover:bg-[#993E00] text-white px-6 py-2.5 rounded-full text-sm font-extrabold transition-colors shadow-sm tracking-wide"
              >
                <Send className="w-4 h-4 fill-white" />
                Enviar mensaje
              </button>

              {/* More button */}
              <button className="w-10 h-10 rounded-full border border-[#ECEAE1] bg-white flex items-center justify-center text-[#6D6A61] hover:bg-slate-50 transition-colors">
                •••
              </button>
            </div>

            {/* Profile text details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black text-[#3C3935] tracking-tight">
                    {profile.full_name}
                  </h1>
                  <button className="p-1 rounded-full hover:bg-slate-100 transition-colors text-[#6D6A61]" title="Pronunciación de nombre">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    1er
                  </span>
                </div>

                {/* Headline */}
                <p className="text-base text-[#6D6A61] leading-relaxed max-w-2xl font-medium">
                  {profile.cargo_actual && profile.empresa_actual 
                    ? `Ayudo a agencias y consultores en UCR. ${profile.cargo_actual} en ${profile.empresa_actual}` 
                    : profile.cargo_actual || 'Exalumno de la Universidad de Costa Rica'}
                </p>
              </div>

              {/* Location & Contact info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#8C877D]">
                {profile.pais_ciudad && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B34700]" />
                    {profile.pais_ciudad}
                  </span>
                )}
                
                {showContactInfo ? (
                  <span className="text-[#B34700] font-bold">Información de contacto</span>
                ) : (
                  <span className="text-[#8C877D] italic">Contacto privado</span>
                )}
              </div>

              {/* Connections stats */}
              <div className="flex items-center gap-3 text-xs font-extrabold text-[#3C3935] pt-1">
                <span className="text-[#B34700]">1.844 <span className="text-[#6D6A61] font-medium">seguidores</span></span>
                <span className="w-px h-3 bg-[#ECEAE1]"></span>
                <span className="text-[#B34700]">Más de 500 <span className="text-[#6D6A61] font-medium">contactos</span></span>
              </div>

              {/* Badges offers */}
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.ofrece_empleo && (
                  <span className="bg-[#E4F3E8] text-[#27AE60] border border-[#C2E8CC] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    ● Ofrece Empleo
                  </span>
                )}
                {profile.ofrece_mentoria && (
                  <span className="bg-[#FFF4E5] text-[#D35400] border border-[#FFE3C2] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    ● Ofrece Mentoría
                  </span>
                )}
                {profile.ofrece_pasantia && (
                  <span className="bg-[#EAF2F8] text-[#2980B9] border border-[#D5E6F2] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    ● Ofrece Pasantía
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column Left (About Me) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Acerca de */}
            <div className="bg-white rounded-[32px] border border-[#ECEAE1] p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B34700] fill-[#B34700]" />
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#B34700]">
                  Acerca de
                </h2>
              </div>

              <p className="text-sm text-[#6D6A61] leading-relaxed whitespace-pre-wrap">
                {profile.bio || 'Sin descripción detallada por el momento. Este exalumno está abierto a conectar y compartir su experiencia profesional.'}
              </p>

              {/* Areas of Interest */}
              {profile.areas_de_interes && profile.areas_de_interes.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#FAF9F0]">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#3C3935]">
                    Áreas de interés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.areas_de_interes.map((area: string) => (
                      <span 
                        key={area} 
                        className="bg-[#EBF6FF] text-[#0A66C2] font-extrabold rounded-xl px-4 py-2 text-xs tracking-wide"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Private Contact Lock Card OR Real Contact Info Card */}
            {!showContactInfo ? (
              <div className="bg-[#F0EEE6] rounded-[32px] border border-[#E1DEC9] p-8 shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#8C877D] shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#3C3935]">
                    Información Privada
                  </h3>
                  <p className="text-xs text-[#6D6A61] max-w-sm leading-relaxed">
                    Conéctate con este usuario para ver sus datos de contacto directos.
                  </p>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="bg-[#9BD8FB] hover:bg-[#82C8F1] text-[#004C70] font-black px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  {loading ? 'Procesando...' : 'Solicitar conexión'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border border-[#ECEAE1] p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#B34700]" />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#B34700]">
                    Información de contacto
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.email && (
                    <a 
                      href={`mailto:${profile.email}`} 
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#ECEAE1] hover:bg-slate-50 transition-colors"
                    >
                      <Mail className="w-4 h-4 text-[#8C877D]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Correo institucional</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{profile.email}</p>
                      </div>
                    </a>
                  )}

                  {profile.linkedin_url && (
                    <a 
                      href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#ECEAE1] hover:bg-slate-50 transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn</p>
                        <p className="text-xs font-bold text-slate-700 truncate">Ver perfil público</p>
                      </div>
                    </a>
                  )}

                  {profile.twitter_url && (
                    <a 
                      href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://${profile.twitter_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#ECEAE1] hover:bg-slate-50 transition-colors"
                    >
                      <Twitter className="w-4 h-4 text-sky-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Twitter</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{profile.twitter_url}</p>
                      </div>
                    </a>
                  )}

                  {profile.instagram_url && (
                    <a 
                      href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#ECEAE1] hover:bg-slate-50 transition-colors"
                    >
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Instagram</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{profile.instagram_url}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Column Right (Human Side) */}
          <div className="space-y-6">
            
            {/* Lado Humano */}
            <div className="bg-[#E8F0EE] rounded-[32px] border border-[#D5E1DE] p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#B34700] fill-[#B34700]" />
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#B34700]">
                  Lado Humano
                </h2>
              </div>

              <p className="text-xs text-[#6D6A61] leading-relaxed">
                Fuera de la oficina, busco el equilibrio en la naturaleza y la captura de momentos auténticos.
              </p>

              {/* Hobbies list */}
              <ul className="space-y-3.5 pt-2">
                <li className="flex items-center gap-3 text-xs font-bold text-[#3C3935]">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm shrink-0">🚴‍♂️</span>
                  Ciclismo de montaña
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-[#3C3935]">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm shrink-0">📷</span>
                  Fotografía analógica
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-[#3C3935]">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm shrink-0">🌱</span>
                  Voluntariado ambiental
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-[#3C3935]">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm shrink-0">⚽</span>
                  Fútbol
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-[#3C3935]">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm shrink-0">🪚</span>
                  Carpintería artesanal
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-[#3C3935]">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm shrink-0">🧘</span>
                  Yoga
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Footer Section: Recommended profiles */}
        {recommendedProfiles && recommendedProfiles.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#3C3935]">
                Más perfiles para ti
              </h2>
              <Link 
                href="/network" 
                className="text-xs font-extrabold text-[#B34700] hover:text-[#993E00] flex items-center gap-1 transition-colors uppercase tracking-wider"
              >
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedProfiles.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-white rounded-2xl border border-[#ECEAE1] p-4 flex items-center gap-3 hover:shadow-md transition-all duration-300 relative group"
                >
                  {/* Photo */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#EBF6FF] flex items-center justify-center shrink-0 border border-slate-100">
                    {p.foto_url ? (
                      <img 
                        src={getAvatarUrl(p.foto_url) as string} 
                        alt={p.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-black text-[#0A66C2]">
                        {p.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 flex-1">
                    <Link href={`/network/${p.id}`} className="block">
                      <h4 className="text-xs font-extrabold text-[#3C3935] hover:text-[#B34700] truncate transition-colors leading-tight">
                        {p.full_name}
                      </h4>
                    </Link>
                    <p className="text-[10px] text-[#8C877D] truncate mt-0.5">
                      {p.headline}
                    </p>
                    <button 
                      onClick={() => router.push(`/network/${p.id}`)}
                      className="mt-2 text-[10px] font-black uppercase text-[#B34700] hover:text-[#993E00] transition-colors"
                    >
                      Seguir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
