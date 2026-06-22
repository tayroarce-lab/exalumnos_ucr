import { Metadata } from 'next';
import { Users, GraduationCap, UserCheck } from 'lucide-react';
import { listarUsuarios } from '@/actions/users';
import { UsersTable } from './_components/users-table';
import '../../../../styles/admin-dashboard.css';
import '../../../../styles/admin-usuarios.css';

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
  const totalExalumnos = users.filter(u => u.rol === 'exalumno').length;
  const totalEstudiantes = users.filter(u => u.rol === 'estudiante').length;
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

      {/* La tabla de usuarios ahora renderizará las tarjetas interactivas */}
      <main>
        {errorMsg ? (
          <div className="admin-error-msg">
            Error al cargar usuarios: {errorMsg}
          </div>
        ) : (
          <UsersTable
            initialUsers={users}
          />
        )}
      </main>
    </div>
  );
}
