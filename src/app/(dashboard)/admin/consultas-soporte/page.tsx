'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { type SupportQuery } from '@/lib/supabase/support'
import { useSupportQueriesRealtime } from '@/hooks/useSupportQueriesRealtime'
import { SupportTable } from '@/components/admin/consultas-soporte/SupportTable'
import { SupportModal } from '@/components/admin/consultas-soporte/SupportModal'
import { HelpCircle, Clock, AlertCircle, CheckCircle, MessageSquare, Loader2 } from 'lucide-react'
import '@/styles/admin-dashboard.css'

export default function AdminSupportQueriesPage() {
  const [queries, setQueries] = useState<SupportQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Modal state
  const [selectedQuery, setSelectedQuery] = useState<SupportQuery | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch initial data via API route (usa admin client server-side)
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/support-queries')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar consultas.')
      setQueries(json.data)
      setErrorMsg(null)
    } catch (err: any) {
      console.error('Error al cargar consultas:', err)
      setErrorMsg(err.message || 'Error al obtener las consultas de soporte.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime hook callback
  const handleRealtimeQuery = useCallback((updatedQuery: SupportQuery) => {
    setQueries((prev) => {
      const exists = prev.some((q) => q.id === updatedQuery.id)
      if (exists) {
        // Update query in list
        const updatedList = prev.map((q) => (q.id === updatedQuery.id ? updatedQuery : q))
        // If modal is open for this query, update selectedQuery state too
        setSelectedQuery((current) => {
          if (current?.id === updatedQuery.id) {
            return updatedQuery
          }
          return current
        })
        return updatedList
      } else {
        // Append new query to the top
        return [updatedQuery, ...prev]
      }
    })
  }, [])

  // Hook setup
  useSupportQueriesRealtime({ onQueryChange: handleRealtimeQuery })

  // Open modal handler
  const handleOpenQuery = (query: SupportQuery) => {
    setSelectedQuery(query)
    setIsModalOpen(true)
  }

  // Save support query changes via API route (usa admin client server-side)
  const handleSaveQuery = async (id: string, status: SupportQuery['status'], response: string) => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/support-queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, response })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al actualizar consulta.')
      const updated: SupportQuery = json.data

      // Update local state (in case realtime is slow or fails to dispatch)
      setQueries((prev) => prev.map((q) => (q.id === id ? updated : q)))
      setIsModalOpen(false)
      setSelectedQuery(null)
    } catch (err: any) {
      console.error('Error al actualizar consulta:', err)
      alert('Error al guardar los cambios: ' + (err.message || 'Error desconocido'))
    } finally {
      setIsSaving(false)
    }
  }

  // Quick statistics
  const total = queries.length
  const pending = queries.filter((q) => q.status === 'Pendiente').length
  const inProgress = queries.filter((q) => q.status === 'En proceso').length
  const answered = queries.filter((q) => q.status === 'Respondida').length

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-brand-blue" />
            Consultas y Soporte
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervisa, responde y gestiona los reportes o dudas enviados por los usuarios en tiempo real.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
            <span className="text-xl font-bold text-slate-800">{total}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes</span>
            <span className="text-xl font-bold text-slate-800">{pending}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">En Proceso</span>
            <span className="text-xl font-bold text-slate-800">{inProgress}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Respondidas</span>
            <span className="text-xl font-bold text-slate-800">{answered}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            <p className="text-sm font-semibold">Cargando consultas...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        ) : (
          <SupportTable queries={queries} onOpenQuery={handleOpenQuery} />
        )}
      </main>

      {/* Query Detail & Reply Modal */}
      <SupportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedQuery(null)
        }}
        query={selectedQuery}
        onSave={handleSaveQuery}
        isSaving={isSaving}
      />
    </div>
  )
}
