"use client";

import React, { useState, useEffect } from 'react';
import '@/styles/registerStyles.css';
import '@/styles/loadingSpinner.css';
import '@/styles/cycleWisdom.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import CycleWisdomOption3 from '@/components/CycleWisdomOption3';
import { User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, Clock, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logoUCR from '@/images/Logo_UCR.png';
import { createClient } from '@/lib/supabase/client';
import { registrarExalumno } from '@/actions/auth';
import { CARRERAS_UCR, CARRERA_TO_ESCUELA } from '@/constants/catalogs';

export default function Register() {
  const [tipoRegistro, setTipoRegistro] = useState<'estudiante' | 'exalumno'>('estudiante');

  // ── Estado Estudiante (flujo OTP) ──
  const [estudianteData, setEstudianteData] = useState({ nombre: '', apellidos: '', correo: '' });
  const [estError, setEstError] = useState('');

  // ── Estado Exalumno (flujo email+password) ──
  const [exalumnoData, setExalumnoData] = useState({
    nombre: '',
    correo: '',
    password: '',
    carreras: [] as string[],
    anioGraduacion: ''
  });
  const [exError, setExError] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  // ── Diálogo UCR ──
  const [showUcrDialog, setShowUcrDialog] = useState(false);

  // ── General ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);


  // ── Detección correo @ucr.ac.cr para exalumno ──
  const handleExalumnoCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const correo = e.target.value;
    setExalumnoData({ ...exalumnoData, correo });
    setExError('');
    if (correo.toLowerCase().endsWith('@ucr.ac.cr') && correo.length > 11) {
      setShowUcrDialog(true);
    } else {
      setShowUcrDialog(false);
    }
  };

  // ── Submit Estudiante (OTP) ──
  const handleEstudianteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstError('');
    setIsSubmitting(true);

    if (!estudianteData.correo.toLowerCase().endsWith('@ucr.ac.cr')) {
      setEstError('Solo puedes registrarte con un correo institucional UCR (@ucr.ac.cr)');
      setIsSubmitting(false);
      return;
    }
    if (!terminosAceptados) {
      setEstError('Debes aceptar la declaración jurada y los términos.');
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: estudianteData.correo,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/completar-perfil`,
          data: { nombre: estudianteData.nombre, apellidos: estudianteData.apellidos, rol: 'estudiante', tipo: 'estudiante' }
        }
      });
      if (error) throw error;
      setSuccessMode(true);
      setSuccessMsg('estudiante');
      setResendTimer(60);
    } catch (err: any) {
      setEstError(err.message || 'Error al enviar el enlace mágico.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submit Exalumno (email+password) ──
  const handleExalumnoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExError('');
    setIsSubmitting(true);

    if (!terminosAceptados) {
      setExError('Debes aceptar la declaración jurada.');
      setIsSubmitting(false);
      return;
    }
    if (exalumnoData.password.length < 8) {
      setExError('La contraseña debe tener mínimo 8 caracteres.');
      setIsSubmitting(false);
      return;
    }
    if (exalumnoData.carreras.length === 0) {
      setExError('Debes seleccionar al menos una carrera.');
      setIsSubmitting(false);
      return;
    }
    const anio = parseInt(exalumnoData.anioGraduacion);
    const currentYear = new Date().getFullYear();
    if (isNaN(anio) || anio < 1944 || anio > currentYear) {
      setExError(`El año de graduación debe ser entre 1944 y ${currentYear}.`);
      setIsSubmitting(false);
      return;
    }

    try {
      await registrarExalumno({
        nombre: exalumnoData.nombre,
        email: exalumnoData.correo,
        password: exalumnoData.password,
        carreras: exalumnoData.carreras,
        anio_graduacion: anio
      });
      setSuccessMode(true);
      setSuccessMsg('exalumno');
    } catch (err: any) {
      setExError(err.message || 'Error en el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers de carreras ──
  const handleAddCarrera = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (!selected) return;
    if (!exalumnoData.carreras.includes(selected)) {
      setExalumnoData({ ...exalumnoData, carreras: [...exalumnoData.carreras, selected] });
    }
    e.target.value = "";
  };

  const removeCarrera = (cToRemove: string) => {
    setExalumnoData({
      ...exalumnoData,
      carreras: exalumnoData.carreras.filter(c => c !== cToRemove)
    });
  };

  // Extraer las facultades únicas basadas en las carreras seleccionadas
  const derivedFaculties = Array.from(new Set(exalumnoData.carreras.map(c => CARRERA_TO_ESCUELA[c]).filter(Boolean)));

  // ── Reenviar enlace (solo estudiante) ──
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setEstError('');
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: estudianteData.correo,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/completar-perfil`,
          data: { nombre: estudianteData.nombre, apellidos: estudianteData.apellidos, rol: 'estudiante', tipo: 'estudiante' }
        }
      });
      if (error) throw error;
      setResendTimer(60);
    } catch (err: any) {
      setEstError(err.message || 'Error al reenviar el enlace mágico.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════
  // PANTALLA DE ÉXITO
  // ═══════════════════════════════════════════
  if (successMode) {
    if (successMsg === 'estudiante') {
      return (
        <div className="register-container">
          <div className="register-success text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto mt-20 space-y-5">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Revisa tu correo</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Te enviamos un enlace a tu correo UCR (<strong>{estudianteData.correo}</strong>).
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
      <div className="register-container">
        <div className="register-success text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto mt-20 space-y-5">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Registro Completado</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            ¡Bienvenido de vuelta a la comunidad UCR! Tu perfil quedará en estado <strong>&quot;pendiente&quot;</strong> hasta que confirmes tu correo electrónico. Revisa tu bandeja de entrada.
          </p>
          <Link href="/login" className="submit-btn inline-flex items-center justify-center gap-2 w-full" style={{ background: 'linear-gradient(135deg, #F34B26 0%, #b83318 100%)' }}>
            Ir a Iniciar Sesión <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // FORMULARIO PRINCIPAL
  // ═══════════════════════════════════════════
  return (
    <div className={`register-container ${tipoRegistro}`}>
      <div className="register-left">
        <div className="register-logo-container">
          <Link href="/">
            <Image src={logoUCR} alt="Logo Alumni UCR" width={320} height={105} className="register-brand-logo object-contain cursor-pointer" priority />
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
            onClick={() => { setTipoRegistro(tipoRegistro === 'estudiante' ? 'exalumno' : 'estudiante'); setTerminosAceptados(false); setShowUcrDialog(false); }}
          >
            {tipoRegistro === 'estudiante' ? 'Registrarse como Exalumno' : 'Registrarse como Estudiante'}
          </button>
        </div>
      </div>

      <div className="register-right">
        <div className="register-header">
          <div className="md:hidden flex justify-center mb-6">
            <Link href="/" style={{ display: 'block' }}>
              <Image src={logoUCR} alt="Logo Alumni UCR" width={220} height={72} className="object-contain cursor-pointer" priority />
            </Link>
          </div>
          <h1>{tipoRegistro === 'estudiante' ? 'Registro de Estudiante' : 'Registro de Exalumno'}</h1>
          <p className="subtitle">{tipoRegistro === 'estudiante' ? 'Acceso sin contraseñas mediante Enlace Mágico' : 'Autodeclaración — Bienvenido de vuelta a la comunidad UCR'}</p>
          <div className="block md:hidden mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">{tipoRegistro === 'estudiante' ? '¿Ya te graduaste?' : '¿Aún estás estudiando?'}</p>
            <button
              type="button"
              className={`w-full py-2 px-4 rounded font-semibold text-sm transition-colors border ${tipoRegistro === 'estudiante' ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : 'border-blue-500 text-blue-600 hover:bg-blue-50'}`}
              onClick={() => { setTipoRegistro(tipoRegistro === 'estudiante' ? 'exalumno' : 'estudiante'); setTerminosAceptados(false); setShowUcrDialog(false); }}
            >
              {tipoRegistro === 'estudiante' ? 'Registrarse como Exalumno' : 'Registrarse como Estudiante'}
            </button>
          </div>
        </div>

        {tipoRegistro === 'estudiante' ? (
          <>
            {/* ═══ FORMULARIO ESTUDIANTE (OTP) ═══ */}
            <div className="register-info-box">
              <Mail className="info-icon" size={20} />
              <div>
                <strong>Solo con correo UCR</strong>
                <p>Para proteger nuestra comunidad, debes utilizar tu correo de dominio @ucr.ac.cr. Te enviaremos un enlace mágico para acceder sin contraseña.</p>
              </div>
            </div>

            <form onSubmit={handleEstudianteSubmit} className="register-form">
              <div className="form-group">
                <label>Nombre</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" placeholder="Ej: María José" value={estudianteData.nombre} onChange={e => setEstudianteData({ ...estudianteData, nombre: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" placeholder="Ej: Rodríguez" value={estudianteData.apellidos} onChange={e => setEstudianteData({ ...estudianteData, apellidos: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Correo Institucional UCR</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" placeholder="usuario@ucr.ac.cr" value={estudianteData.correo} onChange={e => { setEstudianteData({ ...estudianteData, correo: e.target.value }); setEstError(''); }} required />
                  {estError && <AlertCircle className="error-icon" size={18} />}
                </div>
                <span className="help-text">Solo puedes registrarte con un correo que termine en @ucr.ac.cr</span>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="terminos-est" checked={terminosAceptados} onChange={e => setTerminosAceptados(e.target.checked)} />
                <label htmlFor="terminos-est">
                  Declaro bajo fe de juramento que la información proporcionada es verdadera y acepto los <Link href="/aviso-legal">Términos y Condiciones</Link> de Alumni UCR Foundation.
                </label>
              </div>
              {estError && (
                <div className="error-text flex items-center gap-1.5 mt-3">
                  <AlertCircle size={16} /> {estError}
                </div>
              )}
              <div className="form-actions center mt-6">
                <button type="submit" className="submit-btn full-width flex justify-center items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Registrar y enviar enlace'}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
                <Link href="/login" className="login-link">¿Ya tienes cuenta? Inicia sesión aquí</Link>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* ═══ FORMULARIO EXALUMNO (email+password) ═══ */}
            <div className="register-info-box">
              <GraduationCap className="info-icon" size={20} />
              <div>
                <strong>Registro con cualquier correo</strong>
                <p>Puedes registrarte con cualquier correo electrónico (Gmail, Outlook, etc.). Tu perfil quedará en estado &quot;pendiente&quot; hasta que confirmes tu correo.</p>
              </div>
            </div>

            <form onSubmit={handleExalumnoSubmit} className="register-form exalumno-form">
              <div className="section-title">INFORMACIÓN PERSONAL</div>

              <div className="form-group">
                <label>Nombre Completo</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" placeholder="Ej. María Pérez Rodríguez" value={exalumnoData.nombre} onChange={e => setExalumnoData({ ...exalumnoData, nombre: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" placeholder="maria@ejemplo.com" value={exalumnoData.correo} onChange={handleExalumnoCorreoChange} required />
                  {exError && <AlertCircle className="error-icon" size={18} />}
                </div>
                {showUcrDialog && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <p className="font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                      <AlertCircle size={16} /> Tu correo es institucional UCR. ¿Ya te graduaste?
                    </p>
                    <div className="flex gap-2">
                      <button type="button" className="px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors" onClick={() => setShowUcrDialog(false)}>
                        Sí, ya me gradué
                      </button>
                      <button type="button" className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 rounded text-xs font-semibold hover:bg-amber-100 transition-colors" onClick={() => { setTipoRegistro('estudiante'); setEstudianteData({ ...estudianteData, correo: exalumnoData.correo }); setShowUcrDialog(false); }}>
                        No, aún soy estudiante
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input type="password" placeholder="••••••••" value={exalumnoData.password} onChange={e => setExalumnoData({ ...exalumnoData, password: e.target.value })} required />
                </div>
                <span className="help-text">Mínimo 8 caracteres.</span>
              </div>

              <div className="section-title mt-6">INFORMACIÓN ACADÉMICA</div>

              <div className="form-group">
                <label>Carrera(s)</label>
                <select className="select-input" onChange={handleAddCarrera} defaultValue="">
                  <option value="" disabled>Seleccione una carrera para agregar...</option>
                  {CARRERAS_UCR.filter(c => !exalumnoData.carreras.includes(c)).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="selected-carreras-container mt-2">
                  {exalumnoData.carreras.map(c => (
                    <span key={c} className="carrera-pill">
                      {c}
                      <button type="button" onClick={() => removeCarrera(c)} className="pill-remove-btn">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Facultad / Escuela (Asignado automáticamente)</label>
                <div className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-100 min-h-[44px] flex flex-wrap gap-1 items-center">
                  {derivedFaculties.length > 0 ? (
                    derivedFaculties.map((f, i) => (
                      <span key={i} className="text-sm text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">{f}</span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Seleccione una carrera primero</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Año de Graduación</label>
                <div className="input-wrapper">
                  <GraduationCap className="input-icon" size={18} />
                  <input type="number" min="1944" max={new Date().getFullYear()} placeholder="Ej. 2018" value={exalumnoData.anioGraduacion} onChange={e => setExalumnoData({ ...exalumnoData, anioGraduacion: e.target.value })} required />
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="terminos-ex" checked={terminosAceptados} onChange={e => setTerminosAceptados(e.target.checked)} />
                <label htmlFor="terminos-ex">
                  Declaro bajo fe de juramento que la información proporcionada es verdadera y acepto los <Link href="/aviso-legal">Términos y Condiciones</Link> y la <Link href="/aviso-legal">Política de Privacidad</Link> de Alumni UCR Foundation.
                </label>
              </div>

              {exError && (
                <div className="error-text flex items-center gap-1.5 mt-3">
                  <AlertCircle size={16} /> {exError}
                </div>
              )}

              <div className="form-actions center mt-6">
                <button type="submit" className="submit-btn full-width flex justify-center items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Completar Registro'}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
                <Link href="/login" className="login-link">¿Ya tienes cuenta? Inicia sesión aquí</Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
