'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/button';
import { chatoctavio_getMessages, chatoctavio_sendMessage } from '@/actions/ChatOctavioActions';
import { ChatOctavioConversation, ChatOctavioMessage, ChatOctavioUser } from '@/types/ChatOctavioTypes';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

interface ChatOctavioWindowProps {
  activeConversation: ChatOctavioConversation;
  currentUser: ChatOctavioUser;
}

export default function ChatOctavioWindow({ activeConversation, currentUser }: ChatOctavioWindowProps) {
  const [messages, setMessages] = useState<ChatOctavioMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await chatoctavio_getMessages(activeConversation.id);
      if (res.data) {
        setMessages(res.data);
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
    loadMessages();

    // Suscribirse a los cambios en la tabla chatoctavio_mensajes para tiempo real
    const channel = supabase
      .channel(`chat_messages_${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatoctavio_mensajes',
          filter: `conversation_id=eq.${activeConversation.id}`
        },
        (payload) => {
          const newMsg = payload.new as ChatOctavioMessage;
          setMessages(prev => {
            // Evitar duplicados si el remitente ya lo insertó localmente
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation.id]);

  useEffect(() => {
    // Desplazar automáticamente al fondo
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await chatoctavio_sendMessage(activeConversation.id, messageText);
      if (res.data) {
        // Añadir el mensaje de forma optimista
        setMessages(prev => {
          if (prev.some(m => m.id === res.data!.id)) return prev;
          return [...prev, res.data!];
        });
      } else if (res.error) {
        toast({ title: 'Error al enviar', description: res.error, variant: 'destructive' });
        setNewMessage(messageText); // Devolver el texto en caso de error
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const partner = activeConversation.other_user;

  // Determinar los colores según el rol del interlocutor
  const getRoleBadgeClass = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-[#004C63]/10 text-[#004C63]';
      case 'exalumno': return 'bg-[#F34B26]/10 text-[#F34B26]';
      default: return 'bg-[#54BCEB]/10 text-slate-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-300">
      {/* Header del Chat */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
        {partner.foto_url ? (
          <img src={partner.foto_url} alt={partner.nombre} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center font-bold text-sm shadow-sm border border-brand-emerald/20">
            {partner.nombre.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-tight">{partner.nombre}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getRoleBadgeClass(partner.rol)}`}>
              {partner.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Historial de Mensajes */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4 min-h-0">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <span className="animate-spin h-6 w-6 text-brand-emerald mb-2" />
            <p className="text-xs">Cargando conversación...</p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-4">
            <MessageSquare className="w-12 h-12 mb-3 opacity-20 text-brand-emerald" />
            <p className="text-sm font-bold text-slate-600">¡Inicia la conversación!</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Escribe un mensaje abajo para comenzar tu chat privado.</p>
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      isMine
                        ? 'bg-brand-emerald text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.contenido}</p>
                    <span
                      className={`text-[9px] mt-1 block text-right ${
                        isMine ? 'text-white/70' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* Input de Envío */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex gap-2 items-center">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all focus:outline-none"
        />
        <Button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="h-11 w-11 rounded-xl flex items-center justify-center p-0 shrink-0 bg-brand-emerald text-white hover:bg-brand-emerald/90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
