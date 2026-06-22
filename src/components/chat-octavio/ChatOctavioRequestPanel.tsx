'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck, Clock, Check, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import {
  chatoctavio_getRequests,
  chatoctavio_sendRequest,
  chatoctavio_respondToRequest,
  chatoctavio_searchStudents
} from '@/actions/ChatOctavioActions';
import { ChatOctavioRequest, ChatOctavioUser } from '@/types/ChatOctavioTypes';
import { useToast } from '@/components/ui/use-toast';

interface ChatOctavioRequestPanelProps {
  onBackToChat: () => void;
  onRequestAccepted: () => void;
}

export default function ChatOctavioRequestPanel({ onBackToChat, onRequestAccepted }: ChatOctavioRequestPanelProps) {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'search'>('incoming');
  const [incoming, setIncoming] = useState<ChatOctavioRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ChatOctavioRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<ChatOctavioUser & {
    requestStatus: 'no_request' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';
    requestId?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await chatoctavio_getRequests();
      if (res.data) {
        setIncoming(res.data.incoming);
        setOutgoing(res.data.outgoing);
      } else if (res.error) {
        toast({ title: 'Error', description: res.error, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await chatoctavio_searchStudents(searchQuery);
      if (res.data) {
        setSearchResults(res.data);
      } else if (res.error) {
        toast({ title: 'Error', description: res.error, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (studentId: string) => {
    setActionLoading(studentId);
    try {
      const res = await chatoctavio_sendRequest(studentId);
      if (res.success) {
        toast({
          title: 'Solicitud enviada',
          description: 'Se ha enviado la invitación al estudiante.'
        });
        // Actualizar resultados de búsqueda
        setSearchResults(prev =>
          prev.map(item =>
            item.id === studentId ? { ...item, requestStatus: 'pending_sent' } : item
          )
        );
        loadRequests();
      } else {
        toast({
          title: 'Error al enviar',
          description: res.error || 'No se pudo enviar la solicitud.',
          variant: 'destructive'
        });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    setActionLoading(requestId);
    try {
      const res = await chatoctavio_respondToRequest(requestId, accept);
      if (res.success) {
        toast({
          title: accept ? 'Solicitud aceptada' : 'Solicitud rechazada',
          description: accept ? 'La conversación ha sido habilitada.' : 'Se ha rechazado la solicitud.'
        });
        loadRequests();
        if (accept) {
          onRequestAccepted();
        }
      } else {
        toast({
          title: 'Error',
          description: res.error || 'No se pudo procesar la respuesta.',
          variant: 'destructive'
        });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Conexiones Estudiantiles</h2>
          <p className="text-xs text-slate-500 mt-1">Conecta y chatea con compañeros del proyecto</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBackToChat}>
          Volver al Chat
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
            activeTab === 'incoming'
              ? 'border-brand-emerald text-brand-emerald'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Recibidas ({incoming.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
            activeTab === 'outgoing'
              ? 'border-brand-emerald text-brand-emerald'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Enviadas ({outgoing.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
            activeTab === 'search'
              ? 'border-brand-emerald text-brand-emerald'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Buscar Compañeros
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && <div className="text-center py-10 text-slate-400 text-sm">Cargando...</div>}

        {!loading && activeTab === 'incoming' && (
          <div className="space-y-4">
            {incoming.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto opacity-30 mb-3" />
                <p className="text-sm">No tienes solicitudes pendientes.</p>
              </div>
            ) : (
              incoming.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    {req.other_user.foto_url ? (
                      <img src={req.other_user.foto_url} alt={req.other_user.nombre} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center font-bold text-sm">
                        {req.other_user.nombre.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.other_user.nombre}</p>
                      <p className="text-xs text-slate-400">{req.other_user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5"
                      isLoading={actionLoading === req.id}
                      onClick={() => handleRespond(req.id, true)}
                    >
                      <Check className="w-4 h-4 mr-1" /> Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg px-3 py-1.5"
                      isLoading={actionLoading === req.id}
                      onClick={() => handleRespond(req.id, false)}
                    >
                      <X className="w-4 h-4 mr-1" /> Rechazar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'outgoing' && (
          <div className="space-y-4">
            {outgoing.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto opacity-30 mb-3" />
                <p className="text-sm">No has enviado ninguna solicitud.</p>
              </div>
            ) : (
              outgoing.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    {req.other_user.foto_url ? (
                      <img src={req.other_user.foto_url} alt={req.other_user.nombre} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center font-bold text-sm">
                        {req.other_user.nombre.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.other_user.nombre}</p>
                      <p className="text-xs text-slate-400">{req.other_user.email}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> Pendiente
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'search' && (
          <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Nombre o correo del compañero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-xl"
              />
              <Button type="submit" className="shrink-0 rounded-xl px-5">
                <Search className="w-4 h-4 mr-1" /> Buscar
              </Button>
            </form>

            <div className="space-y-4">
              {searchResults.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    {student.foto_url ? (
                      <img src={student.foto_url} alt={student.nombre} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center font-bold text-sm">
                        {student.nombre.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-800">{student.nombre}</p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>
                  </div>

                  <div>
                    {student.requestStatus === 'no_request' && (
                      <Button
                        size="sm"
                        isLoading={actionLoading === student.id}
                        onClick={() => handleSendRequest(student.id)}
                        className="rounded-lg py-1.5 px-3"
                      >
                        <UserPlus className="w-4 h-4 mr-1" /> Solicitar Chat
                      </Button>
                    )}
                    {student.requestStatus === 'pending_sent' && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> Enviada
                      </span>
                    )}
                    {student.requestStatus === 'pending_received' && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        Revisa "Recibidas"
                      </span>
                    )}
                    {student.requestStatus === 'accepted' && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                        <UserCheck className="w-3.5 h-3.5" /> Conectado
                      </span>
                    )}
                    {student.requestStatus === 'rejected' && (
                      <Button
                        size="sm"
                        isLoading={actionLoading === student.id}
                        onClick={() => handleSendRequest(student.id)}
                        className="rounded-lg py-1.5 px-3"
                      >
                        Reintentar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {searchQuery && searchResults.length === 0 && !loading && (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No se encontraron estudiantes activos con esa descripción.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
