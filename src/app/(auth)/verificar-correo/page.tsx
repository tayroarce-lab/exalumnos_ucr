import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import logoUCR from '@/images/Logo_UCR.png';

export default function VerificarCorreoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <Link href="/" className="inline-block mb-4">
          <Image
            src={logoUCR}
            alt="Logo Alumni UCR"
            width={200}
            height={65}
            className="object-contain"
            priority
          />
        </Link>
        
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
          Verifica tu correo
        </h1>
        
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          Necesitás verificar tu correo UCR para acceder al directorio. Revisá tu bandeja de entrada y haz clic en el enlace mágico que te enviamos.
        </p>
        
        <div className="pt-4">
          <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider transition-colors shadow-sm">
            Ir a Iniciar Sesión
          </Link>
          
          <Link href="/" className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition-colors">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
