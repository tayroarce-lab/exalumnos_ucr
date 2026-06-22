'use client';

import React, { useState, useEffect } from 'react';
import ChatOctavioSidebar from './ChatOctavioSidebar';
import ChatOctavioWindow from './ChatOctavioWindow';
import ChatOctavioRequestPanel from './ChatOctavioRequestPanel';
import { chatoctavio_getCurrentUser, chatoctavio_getConversations } from '@/actions/ChatOctavioActions';
import { ChatOctavioConversation, ChatOctavioUser } from '@/types/ChatOctavioTypes';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, ArrowLeft } from 'lucide-react';

export default function ChatOctavioContainer() {
  const [currentUser, setCurrentUser] = useState<ChatOctavioUser | null>(null);
  const [conversations, setConversations] = useState<ChatOctavioConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatOctavioConversation | null>(null);
  const [showRequests, setShowRequests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const { toast } = useToast();
  const supabase = createClient();

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const userRes = await chatoctavio_getCurrentUser();
      if (userRes.error || !userRes.data) {
        toast({ title: 'Error de autenticación', description: userRes.error || 'No se pudo obtener el usuario.', variant: 'destructive' });
        return;
      }
      setCurrentUser(userRes.data);

      const convRes = await chatoctavio_getConversations();
      if (convRes.data) {
        setConversations(convRes.data);
      } else if (convRes.error) {
        toast({ title: 'Error al cargar chats', description: convRes.error, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Suscribirse a cambios en chatoctavio_conversaciones y chatoctavio_mensajes para actualizar la lista en tiempo real
    const channel = supabase
      .channel('chat_list_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chatoctavio_conversaciones' },
        async () => {
          // Recargar conversaciones cuando cambie la tabla de conversaciones (nueva sala, etc.)
          const convRes = await chatoctavio_getConversations();
          if (convRes.data) setConversations(convRes.data);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chatoctavio_mensajes' },
        async () => {
          // Recargar conversaciones cuando haya un nuevo mensaje para actualizar el "last_message"
          const convRes = await chatoctavio_getConversations();
          if (convRes.data) setConversations(convRes.data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const handleSelectConversation = (conv: ChatOctavioConversation) => {
    setActiveConversation(conv);
    setShowRequests(false);
    setMobileView('detail');
  };

  const handleOpenRequests = () => {
    setShowRequests(true);
    setActiveConversation(null);
    setMobileView('detail');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500">
        <span className="animate-spin h-8 w-8 text-brand-emerald mb-3" />
        <p className="text-sm font-semibold">Cargando módulo de chat...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-sm">Por favor, inicia sesión para acceder al chat.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] max-h-[800px] flex gap-6 relative">
      {/* Sidebar - Visible en desktop, o en mobile si el view es 'list' */}
      <div
        className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
          mobileView === 'detail' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ChatOctavioSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          currentUser={currentUser}
          onOpenRequests={handleOpenRequests}
        />
      </div>

      {/* Ventana de Chat / Panel de Solicitudes - Visible en desktop, o en mobile si el view es 'detail' */}
      <div
        className={`flex-1 h-full flex flex-col relative ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Botón de regreso en Mobile */}
        <div className="md:hidden mb-2">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1 text-slate-600 hover:text-brand-emerald font-bold text-xs uppercase tracking-wider py-2"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a chats
          </button>
        </div>

        {showRequests && currentUser.rol === 'estudiante' ? (
          <ChatOctavioRequestPanel
            onBackToChat={() => {
              setShowRequests(false);
              setMobileView('list');
            }}
            onRequestAccepted={() => {
              setShowRequests(false);
              // Recargar conversaciones
              chatoctavio_getConversations().then(res => {
                if (res.data) setConversations(res.data);
              });
            }}
          />
        ) : activeConversation ? (
          <ChatOctavioWindow
            activeConversation={activeConversation}
            currentUser={currentUser}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden text-slate-400 p-8 text-center bg-gradient-to-br from-slate-50/50 to-white">
            <MessageSquare className="w-16 h-16 mb-4 opacity-10 text-brand-emerald animate-pulse" />
            <p className="text-sm font-bold text-slate-700">Tu Buzón Privado</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {currentUser.rol === 'estudiante'
                ? 'Selecciona una conversación del menú lateral, o haz clic en "Conexiones Estudiantiles" para iniciar chats con otros estudiantes.'
                : 'Selecciona una conversación con un estudiante con el que colabores.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
