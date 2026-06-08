import { Metadata } from 'next';
import { Users, GraduationCap, UserCheck } from 'lucide-react';
import { listarUsuarios } from '@/actions/users';
import { UsersTable } from './_components/users-table';
import '@/styles/admin-dashboard.css';
import '@/styles/admin-usuarios.css';

export const metadata: Metadata = {
  title: 'Gestión de Usuarios | Admin | Fundación Exalumnos UCR',
  description: 'Listado de exalumnos y estudiantes registrados en la plataforma.',
};

export default async function AdminUsuariosPage() {
  // Obtener todos los usuarios desde el servidor (Server Component)
  let users: any[] = [];
  let errorMsg: string | null = null;

  try {
    const data = await listarUsuarios();
    users = data ?? [];
  } catch (err: any) {
    errorMsg = err.message;
  }

  // Estadísticas rápidas para las tarjetas superiores
  const totalExalumnos = users.filter(u => u.tipo === 'exalumno').length;
  const totalEstudiantes = users.filter(u => u.tipo === 'estudiante').length;
  const totalActivos = users.filter(u => u.activo).length;

  return (
    <div className="admin-page-container">
      {/* Encabezado de la página */}
      <div className="users-header">
        <div className="users-header-titles">
          <h1>Gestión de Usuarios</h1>
          <p>Administra los perfiles de exalumnos y estudiantes registrados en la plataforma.</p>
        </div>
      </div>

      {/* Tarjetas de resumen rápido */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px', color: '#3b82f6' }}>
            <Users size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exalumnos</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A2540' }}>{totalExalumnos}</p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px', color: '#16a34a' }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estudiantes</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A2540' }}>{totalEstudiantes}</p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ecfdf5', borderRadius: '10px', padding: '12px', color: '#059669' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Perfiles Activos</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A2540' }}>{totalActivos}</p>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios con filtros interactivos del lado del cliente */}
      <main>
        {errorMsg ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '20px', color: '#dc2626' }}>
            Error al cargar usuarios: {errorMsg}
          </div>
        ) : (
          <UsersTable
            initialUsers={users}
            onRefresh={() => {}}
          />
        )}
      </main>
    </div>
  );
}
