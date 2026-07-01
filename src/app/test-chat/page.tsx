import React from 'react'
import MockChatDrawer from '@/components/chat/MockChatDrawer'
import DirectoryBackground from '@/components/ui/DirectoryBackground'

export default function TestChatPage() {
  return (
    <div className="min-h-screen relative bg-[#FAF9E6] py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 overflow-hidden">
      <DirectoryBackground />
      <div className="max-w-xl mx-auto relative z-10 bg-white p-6 rounded-lg shadow-md mt-10">
        <h1 className="text-2xl font-bold mb-4 text-[#1F8BB6]">Prueba UI de Chat</h1>
        <p className="text-sm text-slate-600 mb-6">Esta es una página de prueba para visualizar y probar interacciones básicas con la interfaz del chat en tiempo real sin requerir datos reales en Supabase.</p>
        
        <div className="space-y-4">
          <p><strong>Instrucciones:</strong></p>
          <ul className="list-disc pl-5 text-sm text-slate-700">
            <li>Usa el drawer en la esquina inferior derecha.</li>
            <li>Escribe un mensaje y presiona Enter o enviar.</li>
            <li>Prueba abrir el panel de configuración (⚙️) y establecer un fondo.</li>
            <li>Prueba seleccionar el modo de edición (☑️), elige tu mensaje y elimínalo (🗑️) o edítalo (✏️).</li>
          </ul>
        </div>
      </div>
      
      <MockChatDrawer />
    </div>
  )
}
