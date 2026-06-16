"use client";

import React, { useState, useEffect } from 'react';
import '@/styles/registerStyles.css';
import '@/styles/loadingSpinner.css';
import '@/styles/cycleWisdom.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import CycleWisdomOption3 from '@/components/CycleWisdomOption3';
import { User, Mail, AlertCircle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logoUCR from '@/images/Logo_UCR.png';
import { createClient } from '@/lib/supabase/client';

export default function Register() {
  const [tipoRegistro, setTipoRegistro] = useState<'estudiante' | 'exalumno'>('estudiante');
  
  const [formData, setFormData] = useState({ nombre: '', apellidos: '', correo: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    // 1. Validar correo UCR
    if (!formData.correo.toLowerCase().endsWith('@ucr.ac.cr')) {
      setErrorMsg('Solo puedes registrarte con un correo institucional UCR (@ucr.ac.cr)');
      setIsSubmitting(false);
      return;
    }

    if (!terminosAceptados) {
      setErrorMsg('Debes aceptar la declaración jurada y los términos.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.correo,
        options: {
          emailRedirectTo: `${window.location.origin}/completar-perfil`,
          data: {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
          }
        }
      });

      if (error) throw error;

      setSuccessMode(true);
      setResendTimer(60); // Iniciar cooldown de 60 segundos
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar el enlace mágico.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.correo,
        options: {
          emailRedirectTo: `${window.location.origin}/completar-perfil`,
          data: {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
          }
        }
      });

      if (error) throw error;

      setResendTimer(60); // Reiniciar cooldown
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al reenviar el enlace mágico.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMode) {
    return (
      <div className="register-container">
        <div className="register-success text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto mt-20 space-y-5">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Revisa tu correo</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Te enviamos un enlace a tu correo UCR (<strong>{formData.correo}</strong>). 
            Revisá tu bandeja y hacé clic en el enlace para activar tu cuenta.
          </p>
          
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-3">¿No recibiste el correo?</p>
            <button 
              onClick={handleResend}
              disabled={resendTimer > 0 || isSubmitting}
              className={`submit-btn w-full flex items-center justify-center gap-2 ${resendTimer > 0 ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'bg-blue-700 hover:bg-blue-800'}`}
            >
              {resendTimer > 0 ? (
                <><Clock size={16} /> Reenviar enlace en {resendTimer}s</>
              ) : (
                isSubmitting ? 'Enviando...' : 'Reenviar enlace'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`register-container ${tipoRegistro}`}>
      <div className="register-left">
           <div className="register-logo-container">
             <Link href="/">
               <Image
                 src={logoUCR}
                 alt="Logo Alumni UCR"
                 width={320}
                 height={105}
                 className="register-brand-logo object-contain cursor-pointer"
                 priority
               />
             </Link>
           </div>

           <div className="register-hero-text mt-6">
             {tipoRegistro === 'estudiante' ? (
               <>
                 <h2>Comienza tu camino de regreso.</h2>
                 <p>Únete a la red de egresados más grande. Conecta con mentores, descubre oportunidades y mantén vivo el espíritu universitario.</p>
               </>
             ) : (
               <>
                 <h2>El camino de regreso.</h2>
                 <p>Reconecta con tus raíces, expande tu red profesional y apoya a la próxima generación de graduados de la UCR.</p>
               </>
             )}
           </div>
           
           <div className="toggle-register-type">
             <p>{tipoRegistro === 'estudiante' ? '¿Ya te graduaste?' : '¿Aún estás estudiando?'}</p>
             <button 
               type="button" 
               className="toggle-btn"
               onClick={() => setTipoRegistro(tipoRegistro === 'estudiante' ? 'exalumno' : 'estudiante')}
             >
               {tipoRegistro === 'estudiante' ? 'Registrarse como Exalumno' : 'Registrarse como Estudiante'}
             </button>
           </div>
       </div>

       <div className="register-right">
          <div className="register-header">
            {/* Mobile Logo (visible only on mobile via CSS or inline styles) */}
            <div className="md:hidden flex justify-center mb-6">
              <Link href="/" style={{ display: 'block' }}>
                <Image
                  src={logoUCR}
                  alt="Logo Alumni UCR"
                  width={220}
                  height={72}
                  className="object-contain cursor-pointer"
                  priority
                />
              </Link>
            </div>
            <h1>{tipoRegistro === 'estudiante' ? 'Registro de Estudiante' : 'Registro de Exalumno'}</h1>
            <p className="subtitle">{tipoRegistro === 'estudiante' ? 'Acceso sin contraseñas mediante Enlace Mágico' : 'Autodeclaración. Welcome back to the UCR community.'}</p>
            
            {/* Toggle móvil (solo visible cuando register-left está oculto) */}
            <div className="block md:hidden mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">
                {tipoRegistro === 'estudiante' ? '¿Ya te graduaste?' : '¿Aún estás estudiando?'}
              </p>
              <button 
                type="button" 
                className={`w-full py-2 px-4 rounded font-semibold text-sm transition-colors border ${tipoRegistro === 'estudiante' ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : 'border-blue-500 text-blue-600 hover:bg-blue-50'}`}
                onClick={() => setTipoRegistro(tipoRegistro === 'estudiante' ? 'exalumno' : 'estudiante')}
              >
                {tipoRegistro === 'estudiante' ? 'Registrarse como Exalumno' : 'Registrarse como Estudiante'}
              </button>
            </div>
          </div>
          
          <div className="register-info-box">
             <Mail className="info-icon" size={20} />
             <div>
               <strong>Solo con correo UCR</strong>
               <p>Para proteger nuestra comunidad, debes utilizar tu correo de dominio @ucr.ac.cr. Te enviaremos un enlace mágico para acceder sin contraseña.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Nombre</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" placeholder="Ej: María José" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              </div>
            </div>

            <div className="form-group">
              <label>Apellidos</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" placeholder="Ej: Rodríguez" value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} required />
              </div>
            </div>

            <div className="form-group">
              <label>Correo Institucional UCR</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" placeholder="usuario@ucr.ac.cr" value={formData.correo} onChange={e => {
                  setFormData({...formData, correo: e.target.value});
                  setErrorMsg('');
                }} required />
                {errorMsg && <AlertCircle className="error-icon" size={18} />}
              </div>
              <span className="help-text">Solo puedes registrarte con un correo que termine en @ucr.ac.cr</span>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="terminos" checked={terminosAceptados} onChange={e => setTerminosAceptados(e.target.checked)} />
              <label htmlFor="terminos">
                Declaro bajo fe de juramento que la información proporcionada es verdadera y acepto los <Link href="/aviso-legal">Términos y Condiciones</Link> de Alumni UCR Foundation.
              </label>
            </div>

            {errorMsg && (
              <div className="error-text flex items-center gap-1.5 mt-3">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <div className="form-actions center mt-6">
                <button type="submit" className="submit-btn full-width flex justify-center items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Registrar y enviar enlace'}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
                <Link href="/login" className="login-link">
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </Link>
            </div>
          </form>
       </div>
    </div>
  );
}
