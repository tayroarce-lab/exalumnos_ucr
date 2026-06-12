'use client';

import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useCVLive } from './CVLiveContext';
import { VistaPreviaCV } from './VistaPreviaCV';
import dynamic from 'next/dynamic';
const DownloadPDFButton = dynamic(
  () => import('./DownloadPDFButton'),
  { ssr: false, loading: () => <button className="bg-slate-200 text-slate-500 px-6 py-2 rounded-xl font-bold animate-pulse">Preparando PDF...</button> }
);

interface Props {
  onClose: () => void;
}

export function ModalGenerarCV({ onClose }: Props) {
  const { liveData } = useCVLive();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-sm p-4 md:p-8">
      
      {/* HEADER MODAL */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl mb-6 max-w-5xl mx-auto w-full border border-slate-200/50 dark:border-white/10">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display uppercase tracking-wide">Tu CV está listo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Revisa que todo esté correcto antes de descargar.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DownloadPDFButton liveData={liveData} />

          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full rounded-3xl shadow-2xl pb-20">
        <VistaPreviaCV />
      </div>

    </div>
  );
}
