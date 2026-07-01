import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StitchProfileClient from './StitchProfileClient';
import { ArrowLeft, Briefcase, MapPin, Linkedin, Mail, Twitter, Instagram, GraduationCap, CheckCircle2, ChevronLeft, Lock, Users } from 'lucide-react';
import ConnectButton from './ConnectButton';
import ReportButton from './ReportButton';
import { getAvatarUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NetworkProfilePage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.user_metadata?.rol === 'admin';

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
  };

  // Comprobar estado de conexión
  let connectionStatus: 'none' | 'contactado' | 'activo' = 'none';
  if (!isAdmin && user && user.id !== profile.id) {
    const adminClient = createAdminClient();
    const { data: matchData } = await adminClient
      .from('matches')
      .select('estado')
      .or(`and(estudiante_id.eq.${user.id},exalumno_id.eq.${profile.id}),and(estudiante_id.eq.${profile.id},exalumno_id.eq.${user.id})`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (matchData) {
      if (matchData.estado === 'activo') connectionStatus = 'activo';
      else if (matchData.estado === 'contactado') connectionStatus = 'contactado';
      else if (matchData.estado === 'sugerido') connectionStatus = 'none';
    }
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
      exalumnos (cargo_actual, empresa_actual)
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
    <StitchProfileClient 
      profile={profile}
      isAdmin={isAdmin}
      connectionStatus={connectionStatus}
      recommendedProfiles={recommendedProfiles}
      currentUserId={user?.id}
    />
  );
}
