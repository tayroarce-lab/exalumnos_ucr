import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Cuenta Suspendida — Fundación Exalumnos UCR',
  description: 'Tu cuenta ha sido suspendida temporalmente.',
}

export default async function CuentaSuspendidaPage() {
  // Intentar obtener el motivo de suspensión si el usuario tiene sesión
  let motivo: string | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('users')
        .select('suspension_reason')
        .eq('id', user.id)
        .single()

      motivo = data?.suspension_reason ?? null
    }
  } catch {
    // Silencioso — mostrar página genérica si falla
  }

  return (
    <div className="cuenta-suspendida-page">
      <div className="cuenta-suspendida-card">

        {/* Ícono */}
        <div className="cuenta-suspendida-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 className="cuenta-suspendida-titulo">Cuenta suspendida</h1>

        <p className="cuenta-suspendida-descripcion">
          Tu cuenta en la plataforma ha sido suspendida temporalmente y no puedes
          acceder al contenido en este momento.
        </p>

        {/* Motivo personalizado si existe */}
        {motivo && (
          <div className="cuenta-suspendida-motivo">
            <strong>Motivo:</strong> {motivo}
          </div>
        )}

        <p className="cuenta-suspendida-ayuda">
          Si crees que esto es un error, por favor contacta al equipo de soporte
          de la Fundación Exalumnos UCR.
        </p>

        <div className="cuenta-suspendida-acciones">
          <a
            href="mailto:soporte@exalumnos.ucr.ac.cr"
            className="cuenta-suspendida-btn-primario"
          >
            Contactar soporte
          </a>
          <Link href="/" className="cuenta-suspendida-btn-secundario">
            Volver al inicio
          </Link>
        </div>

      </div>

      <style>{`
        .cuenta-suspendida-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          padding: 2rem;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .cuenta-suspendida-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.5rem;
          padding: 3rem 2.5rem;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }

        .cuenta-suspendida-icon {
          width: 5rem;
          height: 5rem;
          margin: 0 auto 1.5rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .cuenta-suspendida-icon svg {
          width: 100%;
          height: 100%;
        }

        .cuenta-suspendida-titulo {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }

        .cuenta-suspendida-descripcion {
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 1.25rem;
          font-size: 0.95rem;
        }

        .cuenta-suspendida-motivo {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 0.75rem;
          padding: 0.875rem 1.25rem;
          color: #fbbf24;
          font-size: 0.875rem;
          margin: 0 0 1.25rem;
          text-align: left;
        }

        .cuenta-suspendida-ayuda {
          color: #64748b;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 0 0 2rem;
        }

        .cuenta-suspendida-acciones {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cuenta-suspendida-btn-primario {
          display: block;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
        }

        .cuenta-suspendida-btn-primario:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .cuenta-suspendida-btn-secundario {
          display: block;
          background: transparent;
          color: #64748b;
          font-size: 0.875rem;
          padding: 0.75rem;
          border-radius: 0.75rem;
          text-decoration: none;
          border: 1px solid rgba(100, 116, 139, 0.2);
          transition: color 0.2s, border-color 0.2s;
        }

        .cuenta-suspendida-btn-secundario:hover {
          color: #94a3b8;
          border-color: rgba(100, 116, 139, 0.4);
        }
      `}</style>
    </div>
  )
}
