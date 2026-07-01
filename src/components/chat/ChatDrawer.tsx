'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Send, Settings, CheckSquare, Trash, Edit2, ShieldAlert, Maximize2, Minimize2 } from 'lucide-react'
import { sendMessage, deleteMessages, editMessage } from '@/actions/chat'
import ChatSettingsPanel from './ChatSettingsPanel'

interface ChatMessage {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_deleted: boolean
  is_edited: boolean
}

interface ChatDrawerProps {
  matchId: string
  currentUserId: string
  otherUserName: string
  otherUserInitials: string
  themeColor: string
  initialMessages: ChatMessage[]
  initialSettings: any
}

export default function ChatDrawer({ matchId, currentUserId, otherUserName, otherUserInitials, themeColor, initialMessages, initialSettings }: ChatDrawerProps) {
  const [expanded, setExpanded] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || [])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [showSettings, setShowSettings] = useState(false)
  const [chatSettings, setChatSettings] = useState<any>(initialSettings)
  const [otherUserId, setOtherUserId] = useState<string>('')
  
  // Selection / Edit Mode
  const [manageMode, setManageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!matchId) return

    const loadData = async () => {
      // Fetch match to get other user id (solo adminClient en el server lo hacía, pero aquí lo necesitamos para los settings)
      const { data: matchInfo } = await supabase
        .from('matches')
        .select('estudiante_id, exalumno_id')
        .eq('id', matchId)
        .single()
      
      if (matchInfo) {
        setOtherUserId(matchInfo.estudiante_id === currentUserId ? matchInfo.exalumno_id : matchInfo.estudiante_id)
      }
    }

    loadData()

    // Subscribe to realtime
    const channel = supabase
      .channel(`chat_${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `match_id=eq.${matchId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as ChatMessage])
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as ChatMessage : m))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, currentUserId])

  useEffect(() => {
    if (expanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, expanded])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    if (editingMsg) {
      try {
        setLoading(true)
        await editMessage(editingMsg.id, inputText)
        setMessages(prev => prev.map(m => m.id === editingMsg.id ? { ...m, content: inputText, is_edited: true } : m))
        setEditingMsg(null)
        setInputText('')
      } catch (err: any) {
        alert(err.message)
      } finally {
        setLoading(false)
      }
      return
    }

    try {
      setLoading(true)
      const newMsg = await sendMessage(matchId, inputText)
      if (newMsg) {
        setMessages(prev => {
          if (prev.some(m => m.id === (newMsg as any).id)) return prev
          return [...prev, newMsg as unknown as ChatMessage]
        })
      }
      setInputText('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.length} mensaje(s)?`)) return

    try {
      setLoading(true)
      await deleteMessages(selectedIds)
      setMessages(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, is_deleted: true, content: 'Este mensaje fue eliminado.' } : m))
      setSelectedIds([])
      setManageMode(false)
    } catch(err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = () => {
    if (selectedIds.length !== 1) return
    const msgToEdit = messages.find(m => m.id === selectedIds[0])
    if (msgToEdit) {
      setEditingMsg(msgToEdit)
      setInputText(msgToEdit.content)
      setManageMode(false)
      setSelectedIds([])
    }
  }

  const toggleSelect = (id: string, isSender: boolean, createdAt: string) => {
    if (!manageMode || !isSender) return
    
    // Validar < 5 min localmente también
    const createdAtTime = new Date(createdAt).getTime()
    const now = new Date().getTime()
    if ((now - createdAtTime) / 60000 > 5) {
      alert('Solo puedes gestionar mensajes enviados en los últimos 5 minutos.')
      return
    }

    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id))
    } else {
      setSelectedIds(prev => [...prev, id])
    }
  }

  const bgImage = chatSettings?.background_url ? `url(${chatSettings.background_url})` : 'none'

  if (!matchId) return null

  return (
    <div 
      className={`fixed bottom-0 right-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-lg shadow-xl z-50 transition-all duration-300 flex flex-col overflow-hidden ${
        expanded 
          ? isMaximized ? 'w-[90vw] sm:w-[600px] h-[85vh] max-h-[800px]' : 'w-80 h-[500px] max-h-[80vh]'
          : 'w-80 h-12'
      }`}
    >
      {/* Settings Panel */}
      {showSettings && (
        <ChatSettingsPanel 
          matchId={matchId} 
          blockedUserId={otherUserId}
          currentExpiration={chatSettings?.message_expiration}
          currentBackground={chatSettings?.background_url}
          onClose={() => setShowSettings(false)}
          onSettingsUpdated={() => {
            // Recargar settings localmente
            supabase.from('chat_settings' as any).select('*').eq('match_id', matchId).eq('user_id', currentUserId).maybeSingle().then(({data}) => {
              if (data) setChatSettings(data)
            })
          }}
          themeColor={themeColor}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800"
        style={{ borderTop: `4px solid ${themeColor}` }}
      >
        <div className="flex items-center gap-2 flex-1" onClick={() => !manageMode && setExpanded(!expanded)}>
          <div className="relative">
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white" style={{ backgroundColor: themeColor }}>
              {otherUserInitials}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-white truncate pr-2">
            Chat con {otherUserName.split(' ')[0]}
          </span>
        </div>
        
        {expanded && !manageMode && (
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Minimizar" : "Expandir"} className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-1">
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowSettings(true)} title="Configuración" className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-1">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => setManageMode(true)} title="Gestionar Mensajes" className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-1">
              <CheckSquare className="w-4 h-4" />
            </button>
            <ChevronRight onClick={() => setExpanded(false)} className={`w-4 h-4 transform rotate-90 text-slate-500`} />
          </div>
        )}
        {expanded && manageMode && (
          <div className="flex items-center gap-2">
            {selectedIds.length === 1 && (
              <button onClick={handleEditClick} className="text-blue-500 hover:text-blue-700 p-1" title="Editar">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {selectedIds.length > 0 && (
              <button onClick={handleDeleteSelected} className="text-red-500 hover:text-red-700 p-1" title="Eliminar">
                <Trash className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => { setManageMode(false); setSelectedIds([]); setEditingMsg(null); }} className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold px-2">
              Cancelar
            </button>
          </div>
        )}
        {!expanded && (
          <ChevronRight onClick={() => setExpanded(true)} className={`w-4 h-4 transform -rotate-90 text-slate-500`} />
        )}
      </div>

      {/* Messages Area */}
      {expanded && (
        <>
          <div 
            className="flex-1 p-3 overflow-y-auto flex flex-col space-y-3 relative bg-cover bg-center"
            style={{ backgroundImage: bgImage, backgroundColor: chatSettings?.background_url ? 'transparent' : undefined }}
          >
            {/* Si hay fondo, ponemos un overlay translúcido opcional para legibilidad */}
            {chatSettings?.background_url && (
              <div className="absolute inset-0 bg-white/40 dark:bg-black/60 pointer-events-none"></div>
            )}

            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-500 my-auto relative z-10">
                Inicia la conversación.
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_id === currentUserId
                const isSelected = selectedIds.includes(msg.id)
                
                return (
                  <div 
                    key={msg.id} 
                    onClick={() => toggleSelect(msg.id, isMe, msg.created_at)}
                    className={`relative z-10 flex flex-col max-w-[85%] cursor-pointer ${
                      isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                    } ${manageMode && isMe ? 'hover:opacity-80' : ''}`}
                  >
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 mb-0.5 px-1 font-medium bg-white/50 dark:bg-black/50 rounded backdrop-blur-sm">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    <div className={`p-2.5 text-sm leading-snug shadow-sm flex items-center gap-2 relative ${
                      isMe 
                        ? 'text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-tl-sm'
                    } ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500' : ''} ${msg.is_deleted ? 'opacity-60 italic' : ''}`}
                    style={{ backgroundColor: isMe ? themeColor : undefined }}
                    >
                      {manageMode && isMe && (
                        <div className={`w-3 h-3 rounded-full border shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white'}`}></div>
                      )}
                      <div>
                        {msg.content}
                        {msg.is_edited && !msg.is_deleted && <span className="text-[10px] opacity-75 ml-2">(editado)</span>}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-end gap-2 relative z-10">
            {editingMsg && (
              <div className="absolute -top-7 left-0 w-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs px-3 py-1 font-medium border-t border-blue-100 flex justify-between">
                <span>Editando mensaje...</span>
                <button type="button" onClick={() => { setEditingMsg(null); setInputText(''); }}>Cancelar</button>
              </div>
            )}
            <textarea 
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Escribe un mensaje..."
              className="flex-1 text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-1 resize-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
              style={{ backgroundColor: themeColor }}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </>
      )}
    </div>
  )
}
