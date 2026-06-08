"use client";

import React, { useState } from 'react';
import '../styles/registerStyles.css';
import { User, Mail, Lock, AlertCircle, ArrowRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error && e.target.name === 'correo') {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.correo.endsWith('@ucr.ac.cr')) {
      setError('Debes utilizar tu correo de dominio @ucr.ac.cr');
      return;
    }
    setError('');
    
    // Aquí es donde se conectaría con el backend, por ahora es simulación
    console.log('Registro exitoso', formData);
    alert('¡Registro simulado con éxito!\nRevisa la consola para ver los datos.');
  };

  return (
    <div className="register-container">
       <div className="register-left">
           <div className="register-brand">
             <GraduationCap size={28} />
             <span>Alumni UCR Foundation</span>
           </div>
           <div className="register-hero-text">
             <h2>Comienza tu camino de regreso.</h2>
             <p>Únete a la red de egresados más grande. Conecta con mentores, descubre oportunidades y mantén vivo el espíritu universitario.</p>
           </div>
       </div>
       <div className="register-right">
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
                <p>Para proteger tu cuenta, te enviaremos un enlace único a tu correo institucional. Haz clic en él para verificar tu identidad y acceder al instante. No necesitas recordar contraseñas.</p>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label>Nombre Completo</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" name="nombre" placeholder="Ej: María José Rodríguez" value={formData.nombre} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Institucional</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" name="correo" placeholder="usuario@ucr.ac.cr" value={formData.correo} onChange={handleChange} required />
                  {error && <AlertCircle className="error-icon" size={18} />}
                </div>
                {error ? (
                    <span className="error-text">{error}</span>
                ) : (
                    <span className="help-text">Debes utilizar tu correo de dominio @ucr.ac.cr</span>
                )}
              </div>

              <div className="form-group">
                <label>Crear Contraseña (Opcional)</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                </div>
                <span className="help-text">Si prefieres no usar el enlace mágico, puedes establecer una contraseña de respaldo.</span>
              </div>

              <div className="form-actions">
                 <button type="submit" className="submit-btn">
                   Enviar enlace mágico <ArrowRight size={18} />
                 </button>
                 <Link href="/login" className="login-link">
                   ¿Ya tienes cuenta? Inicia sesión
                 </Link>
              </div>
           </form>
       </div>
    </div>
  );
}
