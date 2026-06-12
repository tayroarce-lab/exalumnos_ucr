"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn, GraduationCap, Users, ShieldCheck } from "lucide-react";
import { iniciarSesion } from "@/actions/auth";
import { obtenerMiPerfil } from "@/actions/users";
import logoUCR from "@/images/Logo_UCR.png";
import AuthBackground from '@/components/ui/AuthBackground';
import "@/styles/loginStyles.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const manejarInicioSesion = async () => {
    setMessage(null);

    if (!email.trim()) {
      setMessage({ text: "Por favor, ingresa tu correo electrónico.", type: "error" });
      return;
    }

    if (!password.trim()) {
      setMessage({ text: "Por favor, ingresa tu contraseña.", type: "error" });
      return;
    }

    try {
      const result = await iniciarSesion({ email, password });
      
      if (result && result.success) {
        setMessage({ text: "Inicio de sesión exitoso. Redirigiendo...", type: "success" });
        try {
          const perfil = await obtenerMiPerfil();
          setLoading(false);
          if (perfil?.tipo === "admin") {
            router.push("/admin");
          } else {
            router.push(redirectTo);
          }
          router.refresh();
        } catch (err) {
          setLoading(false);
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch (error: any) {
      setLoading(false);
      setMessage({ text: error.message || "Credenciales incorrectas", type: "error" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      manejarInicioSesion();
    }
  };

  return (
    <div className="login-page-wrapper">
      <AuthBackground />
      <div className="login-container">
        {/* Panel Izquierdo — Decorativo */}
        <div className="login-left">
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
            <h2>Bienvenido de vuelta</h2>
            <p>
              Accede a tu cuenta para conectar con la comunidad UCR,
              gestionar tus proyectos y seguir transformando el futuro
              de la educación costarricense.
            </p>
          </div>

          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <GraduationCap size={18} />
              </div>
              <span>Mentoría y apoyo académico</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Users size={18} />
              </div>
              <span>Red de profesionales UCR</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <ShieldCheck size={18} />
              </div>
              <span>Acceso seguro y verificado</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho — Formulario */}
        <div className="login-right">
          <div className="login-form-header">
            <h1>Iniciar Sesión</h1>
            <p className="login-subtitle">
              Ingresa tus credenciales para acceder a la plataforma
            </p>
          </div>

          <div className="login-form" onKeyDown={handleKeyDown}>
            {/* Campo: Correo Electrónico */}
            <div className="login-form-group">
              <label htmlFor="login-email">Correo Electrónico</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="login-form-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <Link href="/recuperar-password" className="forgot-password-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Mensaje de error o éxito */}
            {message && (
              <div className={`login-message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Botón de Iniciar Sesión */}
            <button
              onClick={manejarInicioSesion}
              disabled={loading}
              className="login-submit-btn"
              id="login-submit-button"
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </div>

          <div className="login-divider">o</div>

          <div className="login-footer-links">
            ¿No tienes una cuenta?{" "}
            <Link href="/register">Regístrate aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
