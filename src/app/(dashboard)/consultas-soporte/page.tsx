'use client'

import React, { useState, useEffect } from 'react'
import Card from '@/components/ui/card'
import { Input, Textarea, Select } from '@/components/ui/input'
import Button from '@/components/ui/button'
import { useProfile } from '@/contexts/ProfileContext'
import { HelpCircle, Send, Sparkles, Clock, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react'

interface SupportQuery {
  id: string
  full_name: string
  email: string
  subject: string
  query_type: string
  message: string
  status: 'Pendiente' | 'En proceso' | 'Respondida'
  response: string | null
  created_at: string
}

export default function ConsultasSoportePage() {
  const { user, profile } = useProfile()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    queryType: 'Consulta general',
    message: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [queries, setQueries] = useState<SupportQuery[]>([])
  const [isLoadingQueries, setIsLoadingQueries] = useState(true)

  const fetchUserQueries = async () => {
    try {
      const res = await fetch('/api/support-queries')
      const data = await res.json()
      if (data.success) {
        setQueries(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching user queries:', err)
    } finally {
      setIsLoadingQueries(false)
    }
  }

  // Pre-populate user info when context is loaded
  useEffect(() => {
    if (user) {
      const name = profile?.full_name || user?.user_metadata?.nombre || user?.user_metadata?.full_name || ''
      const email = user?.email || ''
      setFormData((prev) => ({
        ...prev,
        fullName: name,
        email: email
      }))
      fetchUserQueries()
    }
  }, [user, profile])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'El nombre completo es obligatorio.'
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato de correo no es válido.'
    }
    if (!formData.subject.trim()) newErrors.subject = 'El asunto es obligatorio.'
    if (!formData.message.trim()) newErrors.message = 'El mensaje es obligatorio.'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitSuccess(false)
    setSubmitError(null)

    try {
      const res = await fetch('/api/support-queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          subject: formData.subject,
          query_type: formData.queryType,
          message: formData.message
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error inesperado al enviar la consulta.')
      }

      setSubmitSuccess(true)
      // Reset subject and message fields
      setFormData((prev) => ({
        ...prev,
        subject: '',
        message: ''
      }))
      fetchUserQueries()
    } catch (err: any) {
      setSubmitError(err.message || 'Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const queryTypeOptions = [
    { value: 'Consulta general', label: 'Consulta general' },
    { value: 'Problema técnico', label: 'Problema técnico' },
    { value: 'Sugerencia', label: 'Sugerencia' },
    { value: 'Reporte de error', label: 'Reporte de error' },
    { value: 'Otro', label: 'Otro' }
  ]

  const getStatusBadge = (status: SupportQuery['status']) => {
    switch (status) {
      case 'Respondida':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Respondida
          </span>
        )
      case 'En proceso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            En proceso
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pendiente
          </span>
        )
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue mb-2">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ¿Tienes alguna consulta?
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Si tienes alguna duda, inconveniente o necesitas más información, completa el siguiente formulario. Tu consulta será enviada al administrador, quien la revisará y te responderá a la mayor brevedad posible.
        </p>
      </div>

      <Card hoverEffect={false} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-blue" />
          Nueva consulta
        </h2>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>¡Tu consulta ha sido enviada con éxito! La revisaremos pronto.</span>
          </div>
        )}

        {submitError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nombre completo"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Ingresa tu nombre completo"
            required
          />

          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="ejemplo@correo.com"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Asunto"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={errors.subject}
              placeholder="Asunto de la consulta"
              required
            />

            <Select
              label="Tipo de consulta"
              name="queryType"
              value={formData.queryType}
              onChange={handleChange}
              options={queryTypeOptions}
            />
          </div>

          <Textarea
            label="Mensaje"
            name="message"
            value={formData.message}
            onChange={handleChange}
            error={errors.message}
            placeholder="Escribe tu mensaje detallado aquí..."
            required
          />

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#F34B26] hover:bg-[#F34B26]/90 focus:ring-[#F34B26]/40 text-white font-medium py-2.5 rounded-xl transition-all"
          >
            <Send className="w-4 h-4" />
            Enviar consulta
          </Button>
        </form>
      </Card>

      {/* Historial de Consultas */}
      <div className="space-y-6">
        <div className="border-t border-slate-100 pt-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Historial de Consultas
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Aquí puedes ver el estado y las respuestas de tus consultas anteriores.
          </p>
        </div>

        {isLoadingQueries ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#F34B26] rounded-full animate-spin" />
          </div>
        ) : queries.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">No tienes consultas anteriores</h3>
            <p className="text-xs text-slate-500 mt-1">
              Las consultas que envíes aparecerán listadas aquí con sus respectivas respuestas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map((q) => (
              <Card key={q.id} hoverEffect={false} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {q.query_type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {q.subject}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {new Date(q.created_at).toLocaleDateString('es-CR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    {getStatusBadge(q.status)}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                  <span className="block text-xs font-semibold text-slate-400 mb-1">Tu mensaje:</span>
                  {q.message}
                </div>

                {q.response ? (
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60 text-sm text-slate-800 space-y-1">
                    <span className="block text-xs font-bold text-emerald-800">
                      Respuesta del administrador:
                    </span>
                    <p className="whitespace-pre-wrap">{q.response}</p>
                  </div>
                ) : q.status === 'En proceso' ? (
                  <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100/60 text-xs text-sky-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Un administrador está revisando tu consulta y te responderá pronto.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/60 text-xs text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Esperando asignación y revisión de un administrador.</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
