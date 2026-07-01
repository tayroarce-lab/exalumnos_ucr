'use client'

import React from 'react'
import type { SupportQuery } from '@/lib/supabase/support'
import '@/styles/admin-table.css'

interface SupportTableProps {
  queries: SupportQuery[]
  onOpenQuery: (query: SupportQuery) => void
}

export function SupportTable({ queries, onOpenQuery }: SupportTableProps) {
  const getStatusBadgeClass = (status: SupportQuery['status']) => {
    switch (status) {
      case 'Pendiente':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800'
      case 'En proceso':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
      case 'Respondida':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800'
      default:
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="admin-table-container">
      {queries.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-2xl border border-slate-100 shadow-sm">
          No se encontraron consultas de soporte.
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Asunto / Tipo</th>
              <th>Mensaje</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((q) => (
              <tr key={q.id}>
                <td>
                  <div className="admin-table-user">
                    <div className="admin-table-avatar bg-brand-blue/10 text-brand-blue font-bold">
                      {q.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{q.full_name}</span>
                      <span className="text-xs text-slate-500">{q.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{q.subject}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-max mt-0.5">
                      {q.query_type}
                    </span>
                  </div>
                </td>
                <td className="max-w-xs truncate text-slate-600 text-sm">
                  {q.message}
                </td>
                <td className="text-slate-500 text-xs">
                  {new Date(q.created_at).toLocaleString('es-CR')}
                </td>
                <td>
                  <span className={getStatusBadgeClass(q.status)}>
                    {q.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => onOpenQuery(q)}
                    className="px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue/90 transition-colors shadow-sm"
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
