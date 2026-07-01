'use client'

import React, { useState } from 'react'
import { blockUser, updateChatSettings } from '@/actions/chat'
import { Settings, X, ShieldAlert } from 'lucide-react'

interface ChatSettingsPanelProps {
  matchId: string
  blockedUserId: string
  currentExpiration: string
  currentBackground: string
  onClose: () => void
  onSettingsUpdated: () => void
  themeColor: string
}

export default function ChatSettingsPanel({ matchId, blockedUserId, currentExpiration, currentBackground, onClose, onSettingsUpdated, themeColor }: ChatSettingsPanelProps) {
  const [backgroundUrl, setBackgroundUrl] = useState(currentBackground || '')
  const [expiration, setExpiration] = useState(currentExpiration || 'nunca')
  const [loading, setLoading] = useState(false)
  const [showBlockWarning, setShowBlockWarning] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateChatSettings(matchId, {
        background_url: backgroundUrl,
        message_expiration: expiration
      })
      onSettingsUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating settings', error)
      alert('Error guardando configuraciones')
    }
    setLoading(false)
  }

  const handleBlock = async () => {
    setLoading(true)
    try {
      await blockUser(blockedUserId, matchId)
      alert('Usuario bloqueado exitosamente. El chat ha sido cerrado.')
      window.location.reload()
    } catch (error) {
      console.error('Error al bloquear', error)
      alert('Error bloqueando al usuario')
    }
    setLoading(false)
  }

  return (
    <div className="absolute top-0 left-0 w-64 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col z-20 shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Settings className="w-4 h-4" /> Configuración
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Límite de tiempo (Auto-eliminar)
          </label>
          <select 
            value={expiration} 
            onChange={(e) => setExpiration(e.target.value)}
            className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
          >
            <option value="nunca">Nunca</option>
            <option value="24_horas">24 horas</option>
            <option value="1_semana">Una semana</option>
            <option value="30_dias">30 días</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">Aplica para los nuevos mensajes que envíes.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Imagen de Fondo (URL)
          </label>
          <input 
            type="text" 
            value={backgroundUrl} 
            onChange={(e) => setBackgroundUrl(e.target.value)}
            placeholder="https://ejemplo.com/fondo.jpg"
            className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
          />
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full py-2 rounded text-white font-bold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: themeColor }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
        {!showBlockWarning ? (
          <button 
            onClick={() => setShowBlockWarning(true)}
            className="w-full py-2 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-semibold text-sm transition-colors"
          >
            <ShieldAlert className="w-4 h-4" /> Bloquear Usuario
          </button>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded text-center">
            <p className="text-xs text-red-800 dark:text-red-300 mb-2 font-medium">¿Estás seguro? Esto cerrará el chat de forma permanente.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowBlockWarning(false)}
                className="flex-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs py-1.5 rounded border border-slate-300 dark:border-slate-600"
              >
                Cancelar
              </button>
              <button 
                onClick={handleBlock}
                disabled={loading}
                className="flex-1 bg-red-600 text-white text-xs font-bold py-1.5 rounded hover:bg-red-700"
              >
                Bloquear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
