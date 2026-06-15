'use client';

import React, { useState } from 'react';
import { requestConnection, respondToConnection } from '@/actions/matches';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

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

export function MatchesList({ initialMatches, currentUserId }: { initialMatches: MatchType[], currentUserId: string }) {
  const [matches, setMatches] = useState<MatchType[]>(initialMatches);
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConnect = async (matchId: string) => {
    setLoadingId(matchId);
    try {
      const res = await requestConnection(matchId);
      if (res.success) {
        toast({ title: 'Conexión solicitada', description: 'Se ha notificado a la otra parte.' });
        setMatches(matches.map(m => m.id === matchId ? { ...m, estado: 'contactado', iniciado_por: currentUserId } : m));
      } else {
        toast({ title: 'Error', description: res.error || 'No se pudo solicitar la conexión.', variant: 'destructive' });
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
        const isMiTurnoDeResponder = isContactado && match.iniciado_por !== currentUserId;
        const yaSolicite = isContactado && match.iniciado_por === currentUserId;

        return (
          <Card key={match.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{otherUserInfo?.nombre || 'Usuario Desconocido'}</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {match.score_match}% Match
                </span>
              </div>
              
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p><span className="font-medium text-gray-900">Tipo de apoyo:</span> <span className="capitalize">{match.tipo_apoyo}</span></p>
                {otherUserInfo?.hobbies && otherUserInfo.hobbies.length > 0 && (
                  <p><span className="font-medium text-gray-900">Hobbies:</span> {otherUserInfo.hobbies.join(', ')}</p>
                )}
                {otherUserInfo?.proyecto_area_tematica && (
                  <p><span className="font-medium text-gray-900">Área Proyecto:</span> {otherUserInfo.proyecto_area_tematica}</p>
                )}
                {otherUserInfo?.sector_industria && otherUserInfo.sector_industria.length > 0 && (
                  <p><span className="font-medium text-gray-900">Sector:</span> {otherUserInfo.sector_industria.join(', ')}</p>
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
                <Button disabled variant="secondary" className="w-full">
                  Solicitud Enviada
                </Button>
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
                <div className="bg-green-50 border border-green-200 text-green-800 rounded p-3 text-center text-sm">
                  <p className="font-medium">¡Conexión Activa!</p>
                  <p className="text-xs mt-1">Revisa tu correo para ver los datos de contacto.</p>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
