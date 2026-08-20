"use client";

import React, { useState, useEffect } from 'react';
import '@/styles/registerStyles.css';
import '@/styles/loadingSpinner.css';
import '@/styles/cycleWisdom.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import CycleWisdomOption3 from '@/components/CycleWisdomOption3';
import { User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, GraduationCap, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/contexts/ProfileContext';
import logoUCR from '@/images/Logo_UCR.png';
import { registrarEstudiante, registrarExalumno } from '@/actions/auth';
import { CARRERAS_UCR, CARRERA_TO_ESCUELA } from '@/constants/catalogs';

export default function Register() {
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const [tipoRegistro, setTipoRegistro] = useState<'estudiante' | 'exalumno'>('estudiante');

  //  Estado Estudiante (flujo email+password) 
  const [estudianteData, setEstudianteData] = useState({ nombre: '', apellidos: '', correo: '', password: '' });
  const [estError, setEstError] = useState('');
  const [showEstPassword, setShowEstPassword] = useState(false);

  //  Estado Exalumno (flujo email+password) 
  const [exalumnoData, setExalumnoData] = useState({
    nombre: '',
    correo: '',
    password: '',
    carreras: [] as string[],
    anioGraduacion: ''
  });
  const [exError, setExError] = useState('');
  const [showExPassword, setShowExPassword] = useState(false);
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  //  General 
  const [isSubmitting, setIsSubmitting] = useState(false);

  //  Submit Estudiante (email+password) 
  const handleEstudianteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstError('');
    setIsSubmitting(true);

    if (!estudianteData.nombre.trim()) {
      setEstError('Por favor, ingresa tu nombre.');
      setIsSubmitting(false);
      return;
    }
    if (!estudianteData.correo.trim()) {
      setEstError('Por favor, ingresa tu correo electrónico.');
      setIsSubmitting(false);
      return;
    }
    // [DEMO] Restricción de dominio UCR deshabilitada para la demo de financiación.
    // Descomentar para producción con verificación institucional:
    // if (!estudianteData.correo.toLowerCase().endsWith('@ucr.ac.cr')) {
    //   setEstError('Solo puedes registrarte con un correo institucional UCR (@ucr.ac.cr)');
    //   setIsSubmitting(false);
    //   return;
    // }
    if (estudianteData.password.length < 6) {
      setEstError('La contraseña debe tener al menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }
    if (!terminosAceptados) {
      setEstError('Debes aceptar la declaración jurada y los términos.');
      setIsSubmitting(false);
      return;
    }

    try {
      const nombreCompleto = estudianteData.apellidos
        ? `${estudianteData.nombre} ${estudianteData.apellidos}`
        : estudianteData.nombre;

      const result = await registrarEstudiante({
        nombre: nombreCompleto,
        email: estudianteData.correo,
        password: estudianteData.password,
      });

      if (result && result.success && result.rutaDestino) {
        await refreshProfile();
        router.push(result.rutaDestino);
        router.refresh();
      }
    } catch (err: any) {
      setEstError(err.message || 'Error en el registro.');
      setIsSubmitting(false);
    }
  };

  //  Submit Exalumno (email+password) 
  const handleExalumnoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExError('');
    setIsSubmitting(true);

    if (!terminosAceptados) {
      setExError('Debes aceptar la declaración jurada.');
      setIsSubmitting(false);
      return;
    }
    if (exalumnoData.password.length < 6) {
      setExError('La contraseña debe tener al menos 6 caracteres.');
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
      const result = await registrarExalumno({
        nombre: exalumnoData.nombre,
        email: exalumnoData.correo,
        password: exalumnoData.password,
        carreras: exalumnoData.carreras,
        anio_graduacion: anio
      });

      if (result && result.success && result.rutaDestino) {
        await refreshProfile();
        router.push(result.rutaDestino);
        router.refresh();
      }
    } catch (err: any) {
      setExError(err.message || 'Error en el registro');
      setIsSubmitting(false);
    }
  };

  //  Helpers de carreras 
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

  // 
  // FORMULARIO PRINCIPAL
  // 
  return (
    <div className={`register-container ${tipoRegistro}`}>
      <div className="register-left relative">
        {/* Botón Volver al Inicio */}
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold z-20 bg-black/10 hover:bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <div className="register-logo-container mt-8">
          <Link href="/">
            <Image src={logoUCR} alt="Logo Alumni UCR" width={320} height={105} className="register-brand-logo object-contain cursor-pointer" priority />
          </Link>
        </div>
        <div className="register-hero-text mt-6">
          {tipoRegistro === 'estudiante' ? (
            <div key="hero-estudiante">
              <h2>Comienza tu camino de regreso.</h2>
              <p>Únete a la red de egresados más grande. Conecta con mentores, descubre oportunidades y mantén vivo el espíritu universitario.</p>
            </div>
          ) : (
            <div key="hero-exalumno">
              <h2>El camino de regreso.</h2>
              <p>Reconecta con tus raíces, expande tu red profesional y apoya a la próxima generación de graduados de la UCR.</p>
            </div>
          )}
        </div>
        <div className="toggle-register-type">
          <p>{tipoRegistro === 'estudiante' ? '¿Ya te graduaste?' : '¿Aún estás estudiando?'}</p>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => { setTipoRegistro(tipoRegistro === 'estudiante' ? 'exalumno' : 'estudiante'); setTerminosAceptados(false); }}
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
          <p className="subtitle">{tipoRegistro === 'estudiante' ? 'Crea tu cuenta con correo electrónico y contraseña' : 'Autodeclaración — Bienvenido de vuelta a la comunidad UCR'}</p>
          <div className="block md:hidden mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">{tipoRegistro === 'estudiante' ? '¿Ya te graduaste?' : '¿Aún estás estudiando?'}</p>
            <button
              type="button"
              className={`w-full py-2 px-4 rounded font-semibold text-sm transition-colors border ${tipoRegistro === 'estudiante' ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : 'border-blue-500 text-blue-600 hover:bg-blue-50'}`}
              onClick={() => { setTipoRegistro(tipoRegistro === 'estudiante' ? 'exalumno' : 'estudiante'); setTerminosAceptados(false); }}
            >
              {tipoRegistro === 'estudiante' ? 'Registrarse como Exalumno' : 'Registrarse como Estudiante'}
            </button>
          </div>
        </div>

        {tipoRegistro === 'estudiante' ? (
          <>
            {/*  FORMULARIO ESTUDIANTE (email+password)  */}
            <div className="register-info-box">
              <Mail className="info-icon" size={20} />
              <div>
                <strong>Crea tu cuenta</strong>
                <p>Regístrate con cualquier correo electrónico válido y una contraseña segura para acceder a la plataforma.</p>
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
                <label>Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" placeholder="correo@ejemplo.com" value={estudianteData.correo} onChange={e => { setEstudianteData({ ...estudianteData, correo: e.target.value }); setEstError(''); }} required />
                  {estError && <AlertCircle className="error-icon" size={18} />}
                </div>
                <span className="help-text">Puedes usar cualquier correo electrónico válido</span>
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showEstPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={estudianteData.password}
                    onChange={e => setEstudianteData({ ...estudianteData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEstPassword(!showEstPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                    tabIndex={-1}
                  >
                    {showEstPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span className="help-text">Mínimo 6 caracteres</span>
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
                  {isSubmitting ? 'Procesando...' : 'Crear Cuenta'}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
                <Link href="/login" className="login-link">¿Ya tienes cuenta? Inicia sesión aquí</Link>
              </div>
            </form>
          </>
        ) : (
          <>
            {/*  FORMULARIO EXALUMNO (email+password)  */}
            <div className="register-info-box">
              <GraduationCap className="info-icon" size={20} />
              <div>
                <strong>Registro con cualquier correo</strong>
                <p>Puedes registrarte con cualquier correo electrónico (Gmail, Outlook, etc.). Tu cuenta quedará activa de inmediato.</p>
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
                  <input type="email" placeholder="correo@ejemplo.com" value={exalumnoData.correo} onChange={e => { setExalumnoData({ ...exalumnoData, correo: e.target.value }); setExError(''); }} required />
                  {exError && <AlertCircle className="error-icon" size={18} />}
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showExPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={exalumnoData.password}
                    onChange={e => setExalumnoData({ ...exalumnoData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowExPassword(!showExPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                    tabIndex={-1}
                  >
                    {showExPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span className="help-text">Mínimo 6 caracteres</span>
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
