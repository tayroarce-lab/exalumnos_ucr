'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import mascotImg from '@/images/mascota_ucr_3d.png'

export default function StudentAIButton() {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    toast.info('¡Próximamente! Asistente de IA para Estudiantes', {
      description: 'Pronto podrás chatear con nuestro asistente inteligente para optimizar tu CV, prepararte para entrevistas y más.',
      position: 'bottom-right',
      style: {
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
      }
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Speech Bubble / Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mb-3 mr-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 pointer-events-auto whitespace-nowrap relative flex items-center gap-2"
          >
            {/* Sparkle/AI indicator */}
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>¿En qué puedo ayudarte hoy?</span>
            {/* Speech bubble arrow */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-white dark:border-t-slate-800" />
            <div className="absolute top-full right-[23px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-slate-100 dark:border-t-transparent -z-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button Wrapper for float animation */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-auto"
      >
        <motion.button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 via-sky-400 to-indigo-500 shadow-[0_8px_32px_rgba(56,189,248,0.4)] dark:shadow-[0_8px_32px_rgba(56,189,248,0.2)] flex items-center justify-center border-[3px] border-white dark:border-slate-800 transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(56,189,248,0.6)] cursor-pointer"
          aria-label="Asistente de Inteligencia Artificial"
        >
          {/* Neon Ring Glow on hover */}
          <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 opacity-0 hover:opacity-40 blur-md transition-opacity duration-300 -z-10" />

          {/* AI active status indicator (small green dot) */}
          <span className="absolute top-0.5 right-0.5 block h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-800 bg-emerald-400 z-20 shadow-sm" />
          <span className="absolute top-0.5 right-0.5 block h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-800 bg-emerald-400 z-20 animate-ping opacity-75" />

          {/* Avatar Image container */}
          <div className="relative w-[85%] h-[85%] overflow-hidden rounded-full bg-sky-50 flex items-center justify-center shadow-inner">
            <Image
              src={mascotImg}
              alt="Mascota IA UCR"
              fill
              className="object-contain object-bottom scale-110 translate-y-0.5 select-none pointer-events-none transition-transform duration-300"
              priority
            />
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}
