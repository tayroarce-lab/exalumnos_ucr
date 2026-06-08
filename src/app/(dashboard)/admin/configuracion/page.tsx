import { Metadata } from 'next';
import { Settings, Save, Bell, Shield, Mail } from 'lucide-react';
import '../../../../styles/admin-dashboard.css';

export const metadata: Metadata = {
  title: 'Configuración | Admin | Fundación Exalumnos UCR',
  description: 'Ajustes globales de la plataforma administrativa.',
};

export default function AdminConfiguracionPage() {
  return (
    <div className="admin-page-container">
      <div className="admin-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="admin-title">Configuración del Sistema</h1>
          <p className="admin-subtitle">Gestiona las preferencias globales y notificaciones de la plataforma.</p>
        </div>
        <button className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={16} />
          Guardar Cambios
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Notificaciones */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', color: '#0A2540' }}>
              <Bell size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0A2540' }}>Notificaciones</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <span style={{ display: 'block', fontWeight: 500, fontSize: '14px', color: '#334155' }}>Alertas de Donaciones</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Recibir email si hay donaciones pendientes por +24h</span>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <span style={{ display: 'block', fontWeight: 500, fontSize: '14px', color: '#334155' }}>Reportes de Usuarios</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Notificar a todos los admins cuando un perfil es suspendido</span>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <span style={{ display: 'block', fontWeight: 500, fontSize: '14px', color: '#334155' }}>Resumen Semanal</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Envío del reporte de impacto cada lunes a las 8am</span>
              </div>
              <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            </label>
          </div>
        </div>

        {/* Políticas y Seguridad */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '10px', color: '#dc2626' }}>
              <Shield size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0A2540' }}>Políticas de Moderación</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', color: '#334155', marginBottom: '8px' }}>
                Límite de reportes para suspensión
              </label>
              <input 
                type="number" 
                defaultValue={3} 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} 
              />
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                Cantidad de denuncias activas que causan la suspensión automática de la cuenta.
              </p>
            </div>
          </div>
        </div>

        {/* Plantillas de Correo */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', color: '#2563eb' }}>
              <Mail size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0A2540' }}>Plantillas de Correo</h2>
          </div>
          
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            Las notificaciones a exalumnos y estudiantes (donaciones confirmadas, rechazos, matches, etc.) son gestionadas a través del servicio de Resend usando <code>src/services/email-service.ts</code>. Para modificar el HTML de la plantilla Premium, contacte al equipo de desarrollo.
          </p>
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              API Key Resend activa: <code>re_***k_key</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
