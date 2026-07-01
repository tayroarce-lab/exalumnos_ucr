import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEstudianteById, getEstudiantesRelacionados } from '@/lib/api';
import StudentProfile from '../_components/StudentProfile';
import DirectoryBackground from '@/components/ui/DirectoryBackground';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ChatDrawer from '@/components/chat/ChatDrawer';

export default async function PerfilEstudiantePage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const estudiante = await getEstudianteById(resolvedParams.id);

  if (!estudiante) {
    notFound();
  }



  // Estudiantes relacionados por carrera (único campo confiable disponible en la BD)
  const estudiantesRelacionados = await getEstudiantesRelacionados(
    estudiante.user_id,
    estudiante.carrera || null
  );

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.user_metadata?.rol === 'admin';

  let matchId: string | null = null;
  if (!isAdmin && user && user.id !== estudiante.user_id) {
    const adminClient = createAdminClient();
    const { data: matchData } = await adminClient
      .from('matches')
      .select('id, estado')
      .or(`and(estudiante_id.eq.${user.id},exalumno_id.eq.${estudiante.user_id}),and(estudiante_id.eq.${estudiante.user_id},exalumno_id.eq.${user.id})`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (matchData && matchData.estado === 'activo') {
      matchId = matchData.id;
    }
  }
  const themeColor = user?.user_metadata?.rol === 'estudiante' ? '#54BCEB' : '#F34B26';

  let initialMessages = [];
  let initialSettings = null;
  if (matchId && user) {
    const adminClient = createAdminClient();
    const { data: msgs } = await adminClient.from('chat_messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true });
    if (msgs) initialMessages = msgs;
    
    const { data: setts } = await adminClient.from('chat_settings').select('*').eq('match_id', matchId).eq('user_id', user.id).maybeSingle();
    if (setts) initialSettings = setts;
  }

  return (
    <div className="min-h-screen relative bg-[#FAF9E6] py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 overflow-hidden">
      {/* Fondo alegre decorado */}
      <DirectoryBackground />

      <div className="max-w-xl mx-auto space-y-0 relative z-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/directorio/estudiantes"
            className="inline-flex items-center text-sm font-bold text-[#1F8BB6] hover:text-[#003B4F] transition-colors"
          >
            ← Volver a Directorio
          </Link>
        </div>

        <StudentProfile
          estudiante={estudiante}
          estudiantesRelacionados={estudiantesRelacionados}
        />
      </div>

      {matchId && user && (
        <ChatDrawer 
          matchId={matchId} 
          currentUserId={user.id} 
          otherUserName={estudiante.nombre} 
          otherUserInitials={estudiante.nombre.substring(0, 2).toUpperCase()} 
          themeColor={themeColor} 
          initialMessages={initialMessages}
          initialSettings={initialSettings}
        />
      )}
    </div>
  );
}
