'use client';

import React, { useState } from 'react';
import { requestConnection, respondToConnection, cancelDirectConnection } from '@/actions/matches';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Users, Briefcase, GraduationCap, User } from 'lucide-react';
import Link from 'next/link';

// Tipos básicos basados en la consulta de getMyMatches
type UserMatchInfo = {
  nombre: string;
  foto_url: string | null;
  carrera_principal_id: number | null;
  sector_industria?: string[] | null;
  proyecto_area_tematica?: string | null;
  hobbies: string[] | null;
};

type MatchType = {
  id: string;
  exalumno_id: string;
  estudiante_id: string;
  tipo_apoyo: string;
  score_match: number;
  estado: string;
  resultado: string | null;
  iniciado_por: string | null;
  created_at: string;
  exalumno: UserMatchInfo | UserMatchInfo[];
  estudiante: UserMatchInfo | UserMatchInfo[];
};

export function MatchesList({ initialMatches, currentUserId, currentUserRole }: { initialMatches: MatchType[], currentUserId: string, currentUserRole: string }) {
  const [matches, setMatches] = useState<MatchType[]>(initialMatches);
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConnect = async (matchId: string) => {
    setLoadingId(matchId);
    try {
      const res = await requestConnection(matchId);
      if (res.success) {
        toast({ title: 'Conexión solicitada', description: 'Se ha notificado a la otra parte.' });
        setMatches(matches.map(m => m.id === matchId ? { ...m, estado: 'contactado', iniciado_por: currentUserRole } : m));
      } else {
        toast({ title: 'Error', description: res.error || 'No se pudo solicitar la conexión.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancelRequest = async (matchId: string, exalumnoId: string, estudianteId: string, currentUserId: string) => {
    setLoadingId(matchId);
    // The cancel action uses target user ID
    const targetId = currentUserId === exalumnoId ? estudianteId : exalumnoId;
    try {
      const res = await cancelDirectConnection(targetId);
      if (res.success) {
        toast({ title: 'Solicitud cancelada', description: 'Tu solicitud fue retirada correctamente.' });
        setMatches(matches.map(m => m.id === matchId ? { ...m, estado: 'sugerido', iniciado_por: null } : m));
      } else {
        toast({ title: 'Error', description: res.error || 'No se pudo cancelar la solicitud.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleResponse = async (matchId: string, accept: boolean) => {
    setLoadingId(matchId);
    try {
      const res = await respondToConnection(matchId, accept);
      if (res.success) {
        toast({ 
          title: accept ? 'Conexión Aceptada' : 'Conexión Rechazada', 
          description: accept ? 'Ahora pueden comunicarse.' : 'El match ha sido cerrado.' 
        });
        setMatches(matches.map(m => m.id === matchId ? { 
          ...m, 
          estado: accept ? 'activo' : 'cerrado', 
          resultado: accept ? 'en_progreso' : 'cancelado' 
        } : m));
      } else {
        toast({ title: 'Error', description: res.error || 'Hubo un error al procesar tu respuesta.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500 mb-4">Aún no tienes sugerencias de conexión.</p>
        <p className="text-sm text-gray-400">Asegúrate de completar tu perfil al 100% para recibir mejores sugerencias.</p>
      </div>
    );
  }

  // Filtrar matches cerrados (rechazados) para no mostrarlos, a menos que se quiera un historial
  const activeMatches = matches.filter(m => m.estado !== 'cerrado');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeMatches.map((match) => {
        const isEstudiante = currentUserId === match.estudiante_id;
        // La otra persona:
        const otherUser = isEstudiante ? match.exalumno : match.estudiante;
        // Supabase puede retornar arrays o un solo objeto dependiendo del setup
        const otherUserInfo = Array.isArray(otherUser) ? otherUser[0] : otherUser;

        const isContactado = match.estado === 'contactado';
        const isActivo = match.estado === 'activo';
        // En DB, iniciado_por guarda el rol ('estudiante' o 'exalumno'), no el ID
        const yaSolicite = isContactado && match.iniciado_por === currentUserRole;
        const isMiTurnoDeResponder = isContactado && match.iniciado_por !== currentUserRole;

        return (
          <Card key={match.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{otherUserInfo?.nombre || 'Usuario Desconocido'}</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {match.score_match}% Match
                </span>
              </div>
              
              <div className="space-y-2 mb-6 text-sm text-slate-600">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium text-slate-900">Tipo de apoyo:</span>
                  {match.tipo_apoyo === 'mentoria' && <><GraduationCap className="w-4 h-4 ml-1 text-blue-600" /> <span>Mentoría profesional</span></>}
                  {match.tipo_apoyo === 'empleo' && <><Briefcase className="w-4 h-4 ml-1 text-emerald-600" /> <span>Oferta de empleo</span></>}
                  {match.tipo_apoyo === 'pasantia' && <><Users className="w-4 h-4 ml-1 text-violet-600" /> <span>Pasantía</span></>}
                  {match.tipo_apoyo === 'donacion' && <><Heart className="w-4 h-4 ml-1 text-orange-600" /> <span>Donación económica</span></>}
                  {!['mentoria', 'empleo', 'pasantia', 'donacion'].includes(match.tipo_apoyo) && <span className="capitalize ml-1">{match.tipo_apoyo}</span>}
                </div>
                {otherUserInfo?.hobbies && otherUserInfo.hobbies.length > 0 && (
                  <p><span className="font-medium text-slate-900">Hobbies:</span> {otherUserInfo.hobbies.join(', ')}</p>
                )}
                {otherUserInfo?.proyecto_area_tematica && (
                  <p><span className="font-medium text-slate-900">Área Proyecto:</span> {otherUserInfo.proyecto_area_tematica}</p>
                )}
                {otherUserInfo?.sector_industria && otherUserInfo.sector_industria.length > 0 && (
                  <p><span className="font-medium text-slate-900">Sector:</span> {otherUserInfo.sector_industria.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              {match.estado === 'sugerido' && (
                <Button 
                  onClick={() => handleConnect(match.id)} 
                  disabled={loadingId === match.id}
                  className="w-full"
                >
                  {loadingId === match.id ? 'Cargando...' : 'Conectar'}
                </Button>
              )}

              {yaSolicite && (
                <div className="flex flex-col gap-2">
                  <Button disabled variant="secondary" className="w-full opacity-70">
                    ✓ Solicitud Enviada
                  </Button>
                  <button
                    onClick={() => handleCancelRequest(match.id, match.exalumno_id, match.estudiante_id, currentUserId)}
                    disabled={loadingId === match.id}
                    className="w-full text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl py-2 transition-all duration-150 disabled:opacity-40"
                  >
                    {loadingId === match.id ? 'Cancelando...' : '✕ Cancelar solicitud'}
                  </button>
                </div>
              )}

              {isMiTurnoDeResponder && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleResponse(match.id, true)} 
                    disabled={loadingId === match.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Aceptar
                  </Button>
                  <Button 
                    onClick={() => handleResponse(match.id, false)} 
                    disabled={loadingId === match.id}
                    variant="secondary"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Rechazar
                  </Button>
                </div>
              )}

              {isActivo && (
                <>
                  <div className="bg-emerald-50 border border-emerald-300/50 text-emerald-700 rounded p-3 text-center text-sm mb-2">
                    <p className="font-medium">¡Conexión Activa!</p>
                    <p className="text-xs mt-1">Revisa tu correo para ver los datos de contacto.</p>
                  </div>
                  <Link
                    href={`/network/${isEstudiante ? match.exalumno_id : match.estudiante_id}`}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-sm font-medium hover:bg-emerald-500/20 active:scale-[0.98] transition-all duration-150"
                  >
                    <User className="w-4 h-4" />
                    Ver información
                  </Link>
                </>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
