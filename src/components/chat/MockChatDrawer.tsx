'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, Send, Settings, CheckSquare, Trash, Edit2, ShieldAlert } from 'lucide-react'
import ChatSettingsPanel from './ChatSettingsPanel'

interface ChatMessage {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_deleted: boolean
  is_edited: boolean
}

export default function MockChatDrawer() {
  const [expanded, setExpanded] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender_id: 'other', content: 'Hola! Vi tu perfil y me gustaría conectar.', created_at: new Date(Date.now() - 600000).toISOString(), is_deleted: false, is_edited: false },
    { id: '2', sender_id: 'me', content: '¡Hola! Claro, un gusto. ¿En qué trabajas actualmente?', created_at: new Date(Date.now() - 300000).toISOString(), is_deleted: false, is_edited: false }
  ])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [showSettings, setShowSettings] = useState(false)
  const [chatSettings, setChatSettings] = useState<any>({ background_url: '', message_expiration: 'nunca' })
  
  const [manageMode, setManageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const themeColor = '#54BCEB' // Celeste estudiante

  useEffect(() => {
    if (expanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, expanded])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    if (editingMsg) {
      setMessages(prev => prev.map(m => m.id === editingMsg.id ? { ...m, content: inputText, is_edited: true } : m))
      setEditingMsg(null)
      setInputText('')
      return
    }

    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      sender_id: 'me',
      content: inputText,
      created_at: new Date().toISOString(),
      is_deleted: false,
      is_edited: false
    }])
    setInputText('')
  }

  const handleDeleteSelected = () => {
    setMessages(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, content: 'Este mensaje fue eliminado.', is_deleted: true } : m))
    setSelectedIds([])
    setManageMode(false)
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

  const toggleSelect = (id: string, isSender: boolean) => {
    if (!manageMode || !isSender) return
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id))
    } else {
      setSelectedIds(prev => [...prev, id])
    }
  }

  const bgImage = chatSettings?.background_url ? `url(${chatSettings.background_url})` : 'none'

  return (
    <div 
      className={`fixed bottom-0 right-6 w-80 bg-white border border-slate-200 rounded-t-lg shadow-xl z-50 transition-all duration-300 flex flex-col overflow-hidden ${
        expanded ? 'h-[500px]' : 'h-12'
      }`}
    >
      {showSettings && (
        <ChatSettingsPanel 
          matchId="mock" 
          blockedUserId="mock"
          currentExpiration={chatSettings?.message_expiration}
          currentBackground={chatSettings?.background_url}
          onClose={() => setShowSettings(false)}
          onSettingsUpdated={() => {}}
          themeColor={themeColor}
        />
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 cursor-pointer bg-slate-50"
        style={{ borderTop: `4px solid ${themeColor}` }}
      >
        <div className="flex items-center gap-2 flex-1" onClick={() => !manageMode && setExpanded(!expanded)}>
          <div className="relative">
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white" style={{ backgroundColor: themeColor }}>
              EX
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
          </div>
          <span className="text-sm font-bold text-slate-800 pr-2">
            Chat con Exalumno
          </span>
        </div>
        
        {expanded && !manageMode && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="text-slate-500 hover:text-slate-800 p-1">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => setManageMode(true)} className="text-slate-500 hover:text-slate-800 p-1">
              <CheckSquare className="w-4 h-4" />
            </button>
            <ChevronRight onClick={() => setExpanded(false)} className={`w-4 h-4 transform rotate-90 text-slate-500`} />
          </div>
        )}
        {expanded && manageMode && (
          <div className="flex items-center gap-2">
            {selectedIds.length === 1 && (
              <button onClick={handleEditClick} className="text-blue-500 hover:text-blue-700 p-1"><Edit2 className="w-4 h-4" /></button>
            )}
            {selectedIds.length > 0 && (
              <button onClick={handleDeleteSelected} className="text-red-500 hover:text-red-700 p-1"><Trash className="w-4 h-4" /></button>
            )}
            <button onClick={() => { setManageMode(false); setSelectedIds([]); setEditingMsg(null); }} className="text-slate-500 text-xs font-bold px-2">
              Cancelar
            </button>
          </div>
        )}
        {!expanded && (
          <ChevronRight onClick={() => setExpanded(true)} className={`w-4 h-4 transform -rotate-90 text-slate-500`} />
        )}
      </div>

      {expanded && (
        <>
          <div 
            className="flex-1 p-3 overflow-y-auto flex flex-col space-y-3 relative bg-cover bg-center"
            style={{ backgroundImage: bgImage, backgroundColor: chatSettings?.background_url ? 'transparent' : undefined }}
          >
            {messages.map(msg => {
              const isMe = msg.sender_id === 'me'
              const isSelected = selectedIds.includes(msg.id)
              
              return (
                <div 
                  key={msg.id} 
                  onClick={() => toggleSelect(msg.id, isMe)}
                  className={`relative z-10 flex flex-col max-w-[85%] cursor-pointer ${
                    isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[9px] text-slate-500 mb-0.5 px-1 font-medium bg-white/50 rounded backdrop-blur-sm">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  <div className={`p-2.5 text-sm leading-snug shadow-sm flex items-center gap-2 relative ${
                    isMe 
                      ? 'text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm'
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
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-end gap-2 relative z-10">
            {editingMsg && (
              <div className="absolute -top-7 left-0 w-full bg-blue-50 text-blue-600 text-xs px-3 py-1 font-medium border-t border-blue-100 flex justify-between">
                <span>Editando mensaje...</span>
                <button type="button" onClick={() => { setEditingMsg(null); setInputText(''); }}>Cancelar</button>
              </div>
            )}
            <textarea 
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
              }}
              placeholder="Escribe un mensaje..."
              className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 resize-none bg-slate-50"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
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
