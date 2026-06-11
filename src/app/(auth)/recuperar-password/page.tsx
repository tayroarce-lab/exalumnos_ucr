'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, ShieldCheck, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import logoUCR from '@/images/Logo_UCR.png';
import '@/styles/loginStyles.css';

export default function RecuperarPasswordPage() {
  const router = useRouter();
  
  const [fase, setFase] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<'estudiante' | 'exalumno' | 'admin' | null>(null);

  const solicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Por favor, ingresa tu correo electrónico.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/solicitar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al solicitar el código');
      }

      setMessage({ text: 'Se ha enviado un código a tu correo. Tienes 5 minutos para usarlo.', type: 'success' });
      setTipoUsuario(data.tipo);
      setFase(2);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const restablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !password) {
      setMessage({ text: 'Por favor, completa todos los campos.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nuevaPassword: password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña');
      }

      setMessage({ text: '¡Contraseña actualizada con éxito! Redirigiendo al login...', type: 'success' });
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        {/* Panel Izquierdo — Decorativo */}
        <div className="login-left" style={{ 
          background: fase === 2 && tipoUsuario === 'exalumno' ? 'linear-gradient(160deg, #F34B26 0%, #a82a0f 100%)' 
            : fase === 2 && tipoUsuario === 'estudiante' ? 'linear-gradient(160deg, #54BCEB 0%, #0284C7 100%)'
            : 'linear-gradient(135deg, #0284C7 50%, #F34B26 50%)' 
        }}>
          <div className="login-logo-container">
            <Link href="/">
              <Image
                src={logoUCR}
                alt="Logo Alumni UCR"
                width={320}
                height={105}
                className="login-brand-logo"
                style={{ objectFit: 'contain', cursor: 'pointer' }}
                priority
              />
            </Link>
          </div>
          <div className="login-hero-text" style={{ marginTop: '1.5rem' }}>
            <h2>Recuperación Segura</h2>
            <p>
              Te enviaremos un código temporal de 6 dígitos para verificar tu identidad y proteger tu cuenta.
            </p>
          </div>
          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon"><ShieldCheck size={18} /></div>
              <span>Validación estricta de identidad</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon"><KeyRound size={18} /></div>
              <span>Código aleatorio de único uso</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho — Formulario */}
        <div className="login-right">
          <div className="login-form-header">
            <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4 inline-flex">
              <ArrowLeft size={16} /> Volver al login
            </Link>
            <h1>Recuperar Contraseña</h1>
            <p className="login-subtitle">
              {fase === 1 
                ? 'Ingresa tu correo para recibir el código de verificación.' 
                : 'Ingresa el código que enviamos a tu correo.'}
            </p>
          </div>

          <div className="login-form">
            {message && (
              <div className={`login-message ${message.type}`} style={{ marginBottom: '1.5rem' }}>
                {message.text}
              </div>
            )}

            {fase === 1 ? (
              <form onSubmit={solicitarCodigo}>
                <div className="login-form-group">
                  <label>Correo Electrónico</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon"><Mail size={18} /></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-submit-btn" style={{ marginTop: '1rem' }}>
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} /> Enviando...</>
                  ) : (
                    'Enviar Código'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={restablecerPassword}>
                <div className="login-form-group">
                  <label>Código de Seguridad (6 dígitos)</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon"><ShieldCheck size={18} /></span>
                    <input
                      type="text"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      required
                      style={{ letterSpacing: '0.2em', fontWeight: 'bold' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>El código expirará en 5 minutos.</p>
                </div>

                <div className="login-form-group" style={{ marginTop: '1rem' }}>
                  <label>Nueva Contraseña</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon"><Lock size={18} /></span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-submit-btn" style={{ 
                  marginTop: '1rem',
                  background: tipoUsuario === 'exalumno' ? 'linear-gradient(135deg, #F34B26 0%, #b83318 100%)' : undefined
                }}>
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} /> Procesando...</>
                  ) : (
                    'Restablecer Contraseña'
                  )}
                </button>
                
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setFase(1)} style={{ background: 'none', border: 'none', color: '#00b0f0', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}>
                    Solicitar un nuevo código
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
