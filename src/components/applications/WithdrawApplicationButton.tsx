'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { withdrawApplication } from '@/actions/applications'

interface WithdrawApplicationButtonProps {
  applicationId: string
  onWithdrawn: () => void
}

export default function WithdrawApplicationButton({ applicationId, onWithdrawn }: WithdrawApplicationButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleWithdraw = () => {
    setError(null)
    startTransition(async () => {
      const result = await withdrawApplication(applicationId)
      if (result.success) {
        onWithdrawn()
      } else {
        setError(result.error || 'Error al retirar la aplicación')
        setShowConfirm(false)
      }
    })
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="text-sm text-gray-700 font-medium">¿Seguro que deseas retirarte?</div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleWithdraw}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50 flex items-center gap-1"
          >
            {isPending ? 'Retirando...' : 'Sí, retirar'}
          </button>
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition border border-transparent hover:border-red-200"
      >
        <Trash2 size={16} />
        Retirar Aplicación
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
