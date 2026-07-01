'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/modal'
import { Select, Textarea } from '@/components/ui/input'
import Button from '@/components/ui/button'
import type { SupportQuery } from '@/lib/supabase/support'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  query: SupportQuery | null
  onSave: (id: string, status: SupportQuery['status'], response: string) => Promise<void>
  isSaving: boolean
}

export function SupportModal({ isOpen, onClose, query, onSave, isSaving }: SupportModalProps) {
  const [status, setStatus] = useState<SupportQuery['status']>('Pendiente')
  const [response, setResponse] = useState('')

  useEffect(() => {
    if (query) {
      setStatus(query.status)
      setResponse(query.response || '')
    }
  }, [query])

  if (!query) return null

  const handleSave = async () => {
    await onSave(query.id, status, response)
  }

  const statusOptions: { value: SupportQuery['status']; label: string }[] = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En proceso', label: 'En proceso' },
    { value: 'Respondida', label: 'Respondida' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de Consulta"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            Guardar cambios
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* User details */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="block font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Remitente</span>
            <span className="font-bold text-slate-800 text-sm">{query.full_name}</span>
          </div>
          <div>
            <span className="block font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Correo</span>
            <a href={`mailto:${query.email}`} className="font-bold text-brand-blue text-sm hover:underline">
              {query.email}
            </a>
          </div>
          <div>
            <span className="block font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Tipo</span>
            <span className="font-bold text-slate-800">{query.query_type}</span>
          </div>
          <div>
            <span className="block font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Fecha</span>
            <span className="font-bold text-slate-800">
              {new Date(query.created_at).toLocaleString('es-CR')}
            </span>
          </div>
        </div>

        {/* Message */}
        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Asunto</span>
          <p className="font-bold text-slate-900 mb-3">{query.subject}</p>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mensaje</span>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
            {query.message}
          </div>
        </div>

        {/* Actions (Status and Response) */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <Select
            label="Estado"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as SupportQuery['status'])}
          />

          <Textarea
            label="Respuesta del Administrador"
            placeholder="Escribe la respuesta o notas de seguimiento..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </Modal>
  )
}
