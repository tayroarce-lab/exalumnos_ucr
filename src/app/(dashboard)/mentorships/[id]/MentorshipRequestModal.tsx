'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { Textarea } from '@/components/ui/input'
import { CheckCircle2, Clock } from 'lucide-react'

interface MentorshipRequestModalProps {
  slots: string[]
}

export default function MentorshipRequestModal({ slots }: MentorshipRequestModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [objective, setObjective] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleRequestSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setIsModalOpen(false)
    }, 1500)
  }

  return (
    <>
      <div className="border-t border-slate-100 pt-6 space-y-3">
        {isSubmitted ? (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>¡Solicitud enviada!</span>
          </div>
        ) : (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full h-12 text-sm uppercase tracking-wider font-bold"
          >
            Agendar Sesión
          </Button>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Mentoría"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleRequestSubmit}
              isLoading={isSubmitting}
              disabled={!selectedSlot || !objective}
            >
              Enviar Solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Seleccionar Horario Disponible
            </label>
            <div className="grid grid-cols-1 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`h-11 px-4 rounded-xl text-xs font-bold uppercase border transition-colors flex items-center justify-between ${
                    selectedSlot === slot
                      ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{slot}</span>
                  <Clock className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Objetivo de la mentoría"
            placeholder="Describe brevemente tus dudas, qué deseas lograr en la sesión o los temas que te gustaría tratar con el mentor..."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>
      </Modal>
    </>
  )
}
