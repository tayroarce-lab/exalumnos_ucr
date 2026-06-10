'use client'

import React from 'react'
import Navbar from '@/components/layout/navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Navbar Superior */}
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Contenido Principal */}
        <main className="flex-1 w-full min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
