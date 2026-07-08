'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function RegisterOpportunityButton() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const handleRegister = () => {
    setIsRegistering(true)
    setTimeout(() => {
      setIsRegistering(false)
      setIsRegistered(true)
    }, 1500)
  }

  if (isRegistered) {
    return (
      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-100">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <span>¡Ya estás registrado en el proyecto!</span>
      </div>
    )
  }

  return (
    <Button
      onClick={handleRegister}
      isLoading={isRegistering}
      className="w-full h-12 text-sm uppercase tracking-wider font-bold"
    >
      Quiero Participar
    </Button>
  )
}
