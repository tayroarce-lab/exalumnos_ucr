'use client';

import React, { useState } from 'react';
import { Search, Users, MessageSquare } from 'lucide-react';
import { ChatOctavioConversation, ChatOctavioUser } from '@/types/ChatOctavioTypes';

interface ChatOctavioSidebarProps {
  conversations: ChatOctavioConversation[];
  activeConversation: ChatOctavioConversation | null;
  onSelectConversation: (conv: ChatOctavioConversation) => void;
  currentUser: ChatOctavioUser;
  onOpenRequests: () => void;
}

export default function ChatOctavioSidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  currentUser,
  onOpenRequests
}: ChatOctavioSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-300">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all focus:outline-none"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        {/* Botón de solicitudes si es estudiante */}
        {currentUser.rol === 'estudiante' && (
          <button
            onClick={onOpenRequests}
            className="w-full mt-3 h-10 flex items-center justify-center gap-2 bg-brand-emerald/10 text-brand-emerald font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-emerald hover:text-white transition-all duration-300 active:scale-[0.98] border border-brand-emerald/10"
          >
            <Users className="w-4 h-4" />
            Conexiones Estudiantiles
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <MessageSquare className="w-10 h-10 mx-auto opacity-10 mb-2" />
            No hay conversaciones activas.
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConversation?.id === conv.id;
            const otherUser = conv.other_user;
            const hasUnread = conv.last_message && 
                             conv.last_message.sender_id !== currentUser.id && 
                             !conv.last_message.leido;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                  isSelected ? 'bg-slate-50/80 border-r-4 border-brand-emerald' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {otherUser.foto_url ? (
                    <img src={otherUser.foto_url} alt={otherUser.nombre} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center font-bold text-sm">
                      {otherUser.nombre.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {hasUnread && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs font-bold truncate ${hasUnread ? 'text-slate-900 font-extrabold' : 'text-slate-800'}`}>
                      {otherUser.nombre}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {formatMessageTime(conv.last_message?.created_at)}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${hasUnread ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                    {conv.last_message ? conv.last_message.contenido : 'Sin mensajes aún'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
