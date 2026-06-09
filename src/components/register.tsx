"use client";

import React, { useState, useEffect } from 'react';
import '../styles/registerStyles.css';
import { User, Mail, Lock, AlertCircle, ArrowRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logoUCR from '@/images/Logo_UCR.png';
import { registrarEstudiante, registrarExalumno } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';

export default function Register() {
  const [tipoRegistro, setTipoRegistro] = useState<'estudiante' | 'exalumno'>('estudiante');
  const [carrerasOpts, setCarrerasOpts] = useState<{id_carreras: number, nombre: string, id_facultades: number | null}[]>([]);
  const [facultadesOpts, setFacultadesOpts] = useState<{id_facultades: number, nombre: string}[]>([]);
  
  // Estudiante State
  const [estudianteData, setEstudianteData] = useState({ nombre: '', correo: '', password: '' });
  const [estError, setEstError] = useState('');
  
  // Exalumno State
  const [exalumnoData, setExalumnoData] = useState({
    nombre: '',
    correo: '',
    password: '',
    facultadId: '',
    carreras: [] as number[],
    anioGraduacion: ''
  });
  const [exError, setExError] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const supabase = createClient();
        
        // Cargar Facultades
        const { data: fData } = await supabase.from('facultades').select('id_facultades, nombre').order('nombre');
        if (fData && fData.length > 0) {
          setFacultadesOpts(fData);
        }

        // Cargar Carreras
        const { data: cData } = await supabase.from('carreras').select('id_carreras, nombre, id_facultades').order('nombre');
        if (cData && cData.length > 0) {
          setCarrerasOpts(cData);
        }
      } catch (err) {
        console.error("Error fetching datos:", err);
      }
    };
    fetchDatos();
  }, []);

  const handleEstudianteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstError('');
    setIsSubmitting(true);
    
    if (estudianteData.correo.toLowerCase().endsWith('@gmail.com')) {
      setEstError('Los correos de Gmail no están permitidos para estudiantes.');
      setIsSubmitting(false);
      return;
    }
    if (!estudianteData.correo.endsWith('@ucr.ac.cr')) {
      setEstError('Debes utilizar tu correo de dominio @ucr.ac.cr');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await registrarEstudiante({
        nombre: estudianteData.nombre,
        email: estudianteData.correo,
        password: estudianteData.password
      });
      setSuccessMsg('¡Registro exitoso! Revisa tu correo institucional para verificar tu identidad.');
    } catch (err: any) {
      setEstError(err.message || 'Error en el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      // Ya no enviamos "escuela_facultad", la relación se da a través de las carreras
      await registrarExalumno({
        nombre: exalumnoData.nombre,
        email: exalumnoData.correo,
        password: exalumnoData.password,
        carreras: exalumnoData.carreras,
        anio_graduacion: anio
      });
      setSuccessMsg('¡Registro exitoso! Tu perfil quedará en estado "pendiente" hasta que confirmes tu correo electrónico.');
    } catch (err: any) {
      setExError(err.message || 'Error en el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCarrera = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    if (!selectedId) return;
    
    if (!exalumnoData.carreras.includes(selectedId)) {
      setExalumnoData({ ...exalumnoData, carreras: [...exalumnoData.carreras, selectedId] });
    }
    e.target.value = "";
  };

  const removeCarrera = (idToRemove: number) => {
    setExalumnoData({
      ...exalumnoData,
      carreras: exalumnoData.carreras.filter(id => id !== idToRemove)
    });
  };

  const getCarreraName = (id: number) => {
    const option = carrerasOpts.find(c => c.id_carreras === id);
    return option ? option.nombre : `Carrera ${id}`;
  };

  // Filtrar las opciones de carrera dependiendo de la facultad seleccionada.
  // Si no hay facultad elegida, se muestran todas.
  // Si hay facultad, se muestran las que pertenecen a esa facultad O las que aún no tienen facultad asignada.
  const filteredCarreras = exalumnoData.facultadId
    ? carrerasOpts.filter(c =>
        c.id_facultades === parseInt(exalumnoData.facultadId) || c.id_facultades === null
      )
    : carrerasOpts;

  if (successMsg) {
    return (
      <div className="register-container">
        <div className="register-success text-center p-8 bg-white rounded-xl shadow-sm border max-w-md mx-auto mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registro Completado</h2>
          <p className="text-gray-600 mb-6">{successMsg}</p>
          <Link href="/login" className="submit-btn inline-block">Ir a Iniciar Sesión</Link>
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
                 className="register-brand-logo"
                 style={{ objectFit: 'contain', cursor: 'pointer' }}
                 priority
               />
             </Link>
           </div>
           <div className="register-hero-text" style={{ marginTop: '1.5rem' }}>
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
          {tipoRegistro === 'estudiante' ? (
             <>
               <div className="register-header">
                 <h1>Registro de Estudiante</h1>
                 <div className="register-step">
                    <span className="step-number">1</span>
                    <span className="step-text">Verificación de Identidad</span>
                 </div>
               </div>
               
               <div className="register-info-box">
                  <Mail className="info-icon" size={20} />
                  <div>
                    <strong>Acceso sin contraseñas mediante Enlace Mágico</strong>
                    <p>Para proteger tu cuenta, te enviaremos un enlace único a tu correo institucional. Haz clic en él para verificar tu identidad y acceder al instante.</p>
                  </div>
               </div>

               <form onSubmit={handleEstudianteSubmit} className="register-form">
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={18} />
                      <input type="text" name="nombre" placeholder="Ej: María José Rodríguez" value={estudianteData.nombre} onChange={e => setEstudianteData({...estudianteData, nombre: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Correo Institucional</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input type="email" name="correo" placeholder="usuario@ucr.ac.cr" value={estudianteData.correo} onChange={e => {
                        setEstudianteData({...estudianteData, correo: e.target.value});
                        setEstError('');
                      }} required />
                      {estError && <AlertCircle className="error-icon" size={18} />}
                    </div>
                    {estError ? (
                        <span className="error-text">{estError}</span>
                    ) : (
                        <span className="help-text">Debes utilizar tu correo de dominio @ucr.ac.cr</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Crear Contraseña (Opcional)</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input type="password" name="password" placeholder="••••••••" value={estudianteData.password} onChange={e => setEstudianteData({...estudianteData, password: e.target.value})} />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <input type="checkbox" id="terminos-estudiante" checked={terminosAceptados} onChange={e => setTerminosAceptados(e.target.checked)} />
                    <label htmlFor="terminos-estudiante">
                      Declaro bajo fe de juramento que la información proporcionada es verdadera y acepto los <Link href="#">Términos de Servicio</Link> y la <Link href="#">Política de Privacidad</Link> de Alumni UCR Foundation.
                    </label>
                  </div>

                  <div className="form-actions center mt-6">
                     <button type="submit" className="submit-btn full-width" disabled={isSubmitting}>
                       {isSubmitting ? 'Procesando...' : 'Completar Registro'}
                     </button>
                     <Link href="/login" className="login-link">
                       ¿Ya tienes cuenta? Inicia sesión aquí
                     </Link>
                  </div>
               </form>
             </>
          ) : (
             <>
               <div className="register-header">
                 <h1>Registro de Exalumno</h1>
                 <p className="subtitle">Autodeclaración. Welcome back to the UCR community.</p>
               </div>

               <form onSubmit={handleExalumnoSubmit} className="register-form exalumno-form">
                  
                  <div className="section-title">INFORMACIÓN PERSONAL</div>
                  
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <div className="input-wrapper no-icon">
                      <input type="text" placeholder="Ej. María Pérez" value={exalumnoData.nombre} onChange={e => setExalumnoData({...exalumnoData, nombre: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <div className="input-wrapper no-icon">
                      <input type="email" placeholder="maria@ejemplo.com" value={exalumnoData.correo} onChange={e => setExalumnoData({...exalumnoData, correo: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Contraseña</label>
                    <div className="input-wrapper no-icon">
                      <input type="password" placeholder="••••••••" value={exalumnoData.password} onChange={e => setExalumnoData({...exalumnoData, password: e.target.value})} required />
                    </div>
                    <span className="help-text">Mínimo 8 caracteres, al menos un número y un símbolo.</span>
                  </div>

                  <div className="section-title mt-6">INFORMACIÓN ACADÉMICA</div>

                  <div className="form-group">
                    <label>Facultad / Escuela</label>
                    <select className="select-input" value={exalumnoData.facultadId} onChange={e => setExalumnoData({...exalumnoData, facultadId: e.target.value})}>
                      <option value="">Todas las facultades (Mostrar todo)</option>
                      {facultadesOpts.length > 0 ? (
                        facultadesOpts.map(f => (
                          <option key={f.id_facultades} value={f.id_facultades}>{f.nombre}</option>
                        ))
                      ) : (
                        <>
                          <option value="1">Ingeniería (Demo)</option>
                          <option value="2">Ciencias Sociales (Demo)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Carrera(s)</label>
                    <select className="select-input" onChange={handleAddCarrera} defaultValue="">
                      <option value="" disabled>Seleccione una carrera para agregar...</option>
                      {filteredCarreras.map(c => (
                        <option key={c.id_carreras} value={c.id_carreras}>{c.nombre}</option>
                      ))}
                    </select>
                    
                    <div className="selected-carreras-container mt-2">
                      {exalumnoData.carreras.map(cId => (
                        <span key={cId} className="carrera-pill">
                          {getCarreraName(cId)}
                          <button type="button" onClick={() => removeCarrera(cId)} className="pill-remove-btn">&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Año de Graduación</label>
                    <div className="input-wrapper no-icon">
                      <input 
                        type="number" 
                        min="1944" 
                        max={new Date().getFullYear()} 
                        placeholder="Ej. 2018" 
                        value={exalumnoData.anioGraduacion} 
                        onChange={e => setExalumnoData({...exalumnoData, anioGraduacion: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <input type="checkbox" id="terminos" checked={terminosAceptados} onChange={e => setTerminosAceptados(e.target.checked)} />
                    <label htmlFor="terminos">
                      Declaro bajo fe de juramento que la información proporcionada es verdadera y acepto los <Link href="#">Términos de Servicio</Link> y la <Link href="#">Política de Privacidad</Link> de Alumni UCR Foundation.
                    </label>
                  </div>
                  
                  {exError && <div className="error-text mt-2">{exError}</div>}

                  <div className="form-actions center mt-6">
                     <button type="submit" className="submit-btn full-width" disabled={isSubmitting}>
                       {isSubmitting ? 'Procesando...' : 'Completar Registro'}
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
