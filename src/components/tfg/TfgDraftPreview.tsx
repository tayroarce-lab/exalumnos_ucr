'use client'

import React from 'react'
import { CheckCircle2, Circle, Download, FileText } from 'lucide-react'

export interface TfgDraft {
  id: string
  titulo: string | null
  descripcion: string | null
  project_type_id: number | null
  thematic_area_id: string | null
  introduccion: string | null
  objetivos: string | null
  marco_teorico: string | null
  metodologia: string | null
  referencias: string | null
  cronograma: string | null
  porcentaje_avance: number
  is_completed: boolean
}

interface Props {
  draft: TfgDraft | null
}

const SECTIONS = [
  { key: 'introduccion', label: 'Introducción' },
  { key: 'objetivos', label: 'Objetivos' },
  { key: 'marco_teorico', label: 'Marco Teórico' },
  { key: 'metodologia', label: 'Metodología' },
  { key: 'referencias', label: 'Referencias' },
  { key: 'cronograma', label: 'Cronograma' },
]

export default function TfgDraftPreview({ draft }: Props) {
  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No tienes ningún borrador de TFG activo.</p>
        <p className="text-sm">Pídele a la IA ayuda para empezar a formular uno.</p>
      </div>
    )
  }

  const exportMarkdown = () => {
    if (!draft.is_completed) {
      alert("Debes completar todas las secciones antes de exportar.")
      return
    }

    const content = `# ${draft.titulo || 'Borrador de TFG'}

## Descripción
${draft.descripcion || ''}

## 1. Introducción
${draft.introduccion || ''}

## 2. Objetivos
${draft.objetivos || ''}

## 3. Marco Teórico / Referencial
${draft.marco_teorico || ''}

## 4. Metodología
${draft.metodologia || ''}

## 5. Referencias Bibliográficas
${draft.referencias || ''}

## 6. Cronograma
${draft.cronograma || ''}
`

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Propuesta_TFG.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Tu Propuesta TFG
          </h2>
          <p className="text-sm text-slate-500 line-clamp-1">{draft.titulo || 'Sin título definido'}</p>
        </div>
        
        <button
          onClick={exportMarkdown}
          disabled={!draft.is_completed}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            draft.is_completed 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
          }`}
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-slate-600 dark:text-slate-400">Progreso general</span>
          <span className="text-blue-600 dark:text-blue-400">{draft.porcentaje_avance}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${draft.porcentaje_avance}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Estado de Secciones</h3>
          
          <div className="grid gap-2">
            {SECTIONS.map((sec) => {
              const hasContent = !!draft[sec.key as keyof TfgDraft];
              return (
                <div key={sec.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-3">
                    {hasContent ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                    )}
                    <span className={`font-medium ${hasContent ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'}`}>
                      {sec.label}
                    </span>
                  </div>
                  {hasContent ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full font-medium">Completado</span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-full font-medium">Pendiente</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {draft.descripcion && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Descripción del Proyecto</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{draft.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  )
}
