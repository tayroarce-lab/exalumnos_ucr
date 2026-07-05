import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StitchProfileClient from './StitchProfileClient';
import { ArrowLeft, Briefcase, MapPin, Linkedin, Mail, Twitter, Instagram, GraduationCap, CheckCircle2, ChevronLeft, Lock, Users } from 'lucide-react';
import { obtenerInsigniasDonador } from '@/actions/donations';
import ProyectoDonacionesProgreso from '@/components/ProyectoDonacionesProgreso';
import ConnectButton from './ConnectButton';
import ReportButton from './ReportButton';
import ChatDrawer from '@/components/chat/ChatDrawer';
import { getAvatarUrl, getProyectoFileUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NetworkProfilePage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: loggedInUserData } = await supabase.from('users').select('rol').eq('id', user.id).single();
    isAdmin = loggedInUserData?.rol === 'admin' || user.user_metadata?.rol === 'admin';
  }

  const { data: userRecord, error } = await supabase
    .from('users')
    .select(`
      *,
      exalumnos (*),
      estudiantes (*),
      curriculums (sobre_mi, habilidades_tecnicas, habilidades_blandas, url_linkedin)
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !userRecord) {
    notFound();
  }

  // Cargar foto_url y banner_url personalizados desde profiles
  let custom_foto_url: string | null = null;
  let banner_url: string | null = null;
  try {
    const { data: profData } = await supabase
      .from('profiles')
      .select('foto_url, banner_url')
      .eq('id', resolvedParams.id)
      .maybeSingle();

    if (profData) {
      custom_foto_url = profData.foto_url;
      banner_url = profData.banner_url;
    }
  } catch (err) {
    console.error('Error fetching profile banner/foto:', err);
  }

  const exalumnoData = Array.isArray(userRecord.exalumnos) ? userRecord.exalumnos[0] : userRecord.exalumnos;
  const estudianteData = Array.isArray(userRecord.estudiantes) ? userRecord.estudiantes[0] : userRecord.estudiantes;
  const curriculumData = Array.isArray(userRecord.curriculums) ? userRecord.curriculums[0] : userRecord.curriculums;

  const profile = {
    id: userRecord.id,
    full_name: `${userRecord.nombre || ''} ${userRecord.apellidos || ''}`.trim() || 'Usuario',
    foto_url: custom_foto_url || userRecord.foto_url,
    banner_url: banner_url,
    es_exalumno: userRecord.rol === 'exalumno',
    rol: userRecord.rol,
    email: userRecord.email,
    linkedin_url: exalumnoData?.linkedin_url || curriculumData?.url_linkedin,
    twitter_url: userRecord.twitter_url,
    instagram_url: userRecord.instagram_url,
    cargo_actual: exalumnoData?.cargo_actual,
    empresa_actual: exalumnoData?.empresa_actual,
    pais_ciudad: exalumnoData?.pais_ciudad,
    ofrece_mentoria: exalumnoData?.ofrece_mentoria || false,
    ofrece_empleo: exalumnoData?.ofrece_empleo || false,
    ofrece_pasantia: exalumnoData?.ofrece_pasantia || false,
    bio: exalumnoData?.bio || curriculumData?.sobre_mi || null,
    skills: [...(exalumnoData?.habilidades || []), ...(curriculumData?.habilidades_tecnicas ? (Array.isArray(curriculumData.habilidades_tecnicas) ? curriculumData.habilidades_tecnicas : Object.keys(curriculumData.habilidades_tecnicas)) : [])],
    areas_de_interes: exalumnoData?.areas_de_interes || estudianteData?.areas_de_interes || [],
    proyecto_titulo: estudianteData?.proyecto_titulo,
    proyecto_descripcion: estudianteData?.proyecto_descripcion,
    proyecto_valor_monto: estudianteData?.proyecto_valor_monto,
    proyecto_valor_moneda: estudianteData?.proyecto_valor_moneda,
    proyecto_documento_url: estudianteData?.proyecto_documento_url,
    proyecto_video_url: estudianteData?.proyecto_video_url,
    proyecto_beneficios: estudianteData?.proyecto_beneficios,
    proyecto_beneficios_fotos: estudianteData?.proyecto_beneficios_fotos,
  };

  const insignias = profile.es_exalumno ? await obtenerInsigniasDonador(profile.id) : [];

  // Comprobar estado de conexión
  let connectionStatus: 'none' | 'contactado' | 'activo' = 'none';
  let matchId: string | null = null;
  if (!isAdmin && user && user.id !== profile.id) {
    const adminClient = createAdminClient();
    const { data: matchData } = await adminClient
      .from('matches')
      .select('id, estado')
      .or(`and(estudiante_id.eq.${user.id},exalumno_id.eq.${profile.id}),and(estudiante_id.eq.${profile.id},exalumno_id.eq.${user.id})`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (matchData) {
      if (matchData.estado === 'activo') {
        connectionStatus = 'activo';
        matchId = matchData.id;
      }
      else if (matchData.estado === 'contactado') connectionStatus = 'contactado';
      else if (matchData.estado === 'sugerido') connectionStatus = 'none';
    }
  }

  const themeColor = user?.user_metadata?.rol === 'estudiante' ? '#54BCEB' : '#F34B26';

  let initialMessages = [];
  let initialSettings = null;
  if (matchId && user) {
    const adminClient = createAdminClient();
    const { data: msgs } = await adminClient.from('chat_messages' as any).select('*').eq('match_id', matchId).order('created_at', { ascending: true });
    if (msgs) initialMessages = msgs;

    const { data: setts } = await adminClient.from('chat_settings' as any).select('*').eq('match_id', matchId).eq('user_id', user.id).maybeSingle();
    if (setts) initialSettings = setts;
  }

  // Fetch up to 3 recommended profiles (excluding the current one)
  const { data: recData } = await supabase
    .from('users')
    .select(`
      id,
      nombre,
      apellidos,
      foto_url,
      rol,
      exalumnos (cargo_actual, empresa_actual, bio)
    `)
    .eq('rol', 'exalumno')
    .eq('visible_en_directorio', true)
    .eq('activo', true)
    .neq('id', resolvedParams.id)
    .limit(3);

  const recommendedProfiles = (recData || []).map((u: any) => {
    const ex = Array.isArray(u.exalumnos) ? u.exalumnos[0] : u.exalumnos;
    const headline = ex?.cargo_actual && ex?.empresa_actual
      ? `${ex.cargo_actual} en ${ex.empresa_actual}`
      : ex?.cargo_actual || 'Exalumno UCR';
    return {
      id: u.id,
      full_name: `${u.nombre || ''} ${u.apellidos || ''}`.trim() || 'Exalumno',
      foto_url: u.foto_url,
      headline,
      bio: ex?.bio || null,
      rol: u.rol
    };
  });

  const displayName = profile.full_name;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const showContactInfo = isAdmin || connectionStatus === 'activo' || (user && profile.id === user.id);

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Back navigation */}
        <Link
          href="/network"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al directorio
        </Link>

        {/* Header Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Banner */}
          <div className="h-40 sm:h-48 relative bg-slate-100">
            {profile.banner_url && (
              <img
                src={profile.banner_url}
                alt="Banner de Perfil"
                className="w-full h-full object-cover absolute inset-0"
              />
            )}
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            {/* Avatar */}
            <div className="absolute -top-14 sm:-top-16 border-4 border-white rounded-full bg-white shadow-sm">
              {profile.foto_url ? (
                <img
                  src={getAvatarUrl(profile.foto_url) as string}
                  alt={displayName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-3xl font-medium">
                  {initials}
                </div>
              )}
            </div>

            {/* Acciones principales - Desktop right align */}
            <div className="flex justify-end pt-4 pb-2 min-h-[64px] sm:min-h-[72px] gap-3 relative z-10">
              {showContactInfo && profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contactar
                </a>
              )}
              {showContactInfo && profile.linkedin_url && (
                <a
                  href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {!isAdmin && user && user.id !== profile.id && (
                <ConnectButton targetUserId={profile.id} initialStatus={connectionStatus} />
              )}
            </div>

            <div className="mt-4 sm:mt-0 space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 flex items-center gap-2">
                {displayName}
                {profile.es_exalumno && (
                  <span title="Exalumno Verificado" className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </span>
                )}
              </h1>

              {(profile.cargo_actual || profile.empresa_actual) && (
                <p className="text-base text-slate-600 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {profile.cargo_actual}
                    {profile.cargo_actual && profile.empresa_actual && ' en '}
                    <span className="font-medium text-slate-800">{profile.empresa_actual}</span>
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
                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md text-xs font-medium">
                  Ofrece Mentoría
                </span>
              )}
              {profile.ofrece_empleo && (
                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md text-xs font-medium">
                  Ofrece Empleo
                </span>
              )}
              {profile.ofrece_pasantia && (
                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md text-xs font-medium">
                  Ofrece Pasantías
                </span>
              )}
              {insignias.map((insignia: any) => (
                <span
                  key={insignia.id}
                  title={insignia.description}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium cursor-help transition-colors hover:bg-slate-50 shrink-0 ${insignia.color}`}
                >
                  <span className="text-xs shrink-0">{insignia.icon}</span>
                  <span>{insignia.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-6">

            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Acerca de
                </h2>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Proyecto Estudiantil */}
            {profile.rol === 'estudiante' && profile.proyecto_titulo && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-wide">
                    <GraduationCap className="w-4 h-4" /> Proyecto
                  </h2>
                  <h3 className="text-xl font-semibold text-slate-900">{profile.proyecto_titulo}</h3>
                </div>

                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {profile.proyecto_descripcion}
                </p>

                {profile.proyecto_beneficios && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Beneficios para Donadores</h4>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.proyecto_beneficios}</p>
                    {profile.proyecto_beneficios_fotos && profile.proyecto_beneficios_fotos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        {profile.proyecto_beneficios_fotos.map((fotoUrl: string, idx: number) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
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

                {profile.proyecto_valor_monto != null && (
                  <div className="pt-4">
                    <ProyectoDonacionesProgreso
                      proyectoId={profile.id}
                      metaMonto={profile.proyecto_valor_monto}
                      metaMoneda={profile.proyecto_valor_moneda || 'USD'}
                      mostrarBotonApoyar={true}
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {profile.proyecto_documento_url && (
                    <a
                      href={profile.proyecto_documento_url.startsWith('http') ? profile.proyecto_documento_url : `https://${profile.proyecto_documento_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Documento
                    </a>
                  )}
                  {profile.proyecto_video_url && (
                    <a
                      href={profile.proyecto_video_url.startsWith('http') ? profile.proyecto_video_url : `https://${profile.proyecto_video_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Video Explicativo
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Habilidades & Áreas de Interés */}
            {(profile.skills && profile.skills.length > 0) || (profile.areas_de_interes && profile.areas_de_interes.length > 0) ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8">
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Habilidades
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string) => (
                        <span key={skill} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.areas_de_interes && profile.areas_de_interes.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Áreas de Interés
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.areas_de_interes.map((area: string) => (
                        <span key={area} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Contacto</h3>

              {!showContactInfo ? (
                <div className="bg-slate-50 rounded-xl p-5 text-center space-y-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
                    <Lock className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Información privada. <br />
                    Conecta para ver sus datos.
                  </p>
                  {!isAdmin && user && user.id !== profile.id && (
                    <div className="pt-2 flex justify-center">
                      <ConnectButton targetUserId={profile.id} initialStatus={connectionStatus} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-slate-300 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-sm truncate">{profile.email}</span>
                    </a>
                  )}

                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-slate-300 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <span className="text-sm truncate">LinkedIn</span>
                    </a>
                  )}

                  {profile.twitter_url && (
                    <a href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://${profile.twitter_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-slate-300 transition-colors">
                        <Twitter className="w-4 h-4" />
                      </div>
                      <span className="text-sm truncate">Twitter</span>
                    </a>
                  )}

                  {profile.instagram_url && (
                    <a href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-slate-300 transition-colors">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <span className="text-sm truncate">Instagram</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Botón de Reporte */}
            {user && user.id !== profile.id && (
              <div className="flex justify-center mt-2">
                <ReportButton targetUserId={profile.id} />
              </div>
            )}

            {/* Perfiles Recomendados (Sidebar) */}
            {recommendedProfiles.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Podrías conocer
                </h3>
                <div className="flex flex-col gap-4">
                  {recommendedProfiles.map((rec: any) => {
                    const init = rec.full_name.substring(0, 2).toUpperCase();
                    return (
                      <Link href={`/network/${rec.id}`} key={rec.id} className="block group">
                        <div className="flex items-center gap-3">
                          {rec.foto_url ? (
                            <img
                              src={getAvatarUrl(rec.foto_url) as string}
                              alt={rec.full_name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-medium flex items-center justify-center shrink-0 text-xs">
                              {init}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 text-sm truncate group-hover:text-slate-700 transition-colors">{rec.full_name}</p>
                            <p className="text-xs text-slate-500 truncate">{rec.headline}</p>
                            {rec.bio && (
                              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {rec.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {matchId && user && (
        <ChatDrawer
          matchId={matchId}
          currentUserId={user.id}
          otherUserName={profile.full_name}
          otherUserInitials={initials}
          themeColor={themeColor}
          initialMessages={initialMessages}
          initialSettings={initialSettings}
        />
      )}
    </div>
  )
}
