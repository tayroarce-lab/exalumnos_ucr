'use client';

import { useState, useCallback } from 'react';
import { Loader2, Search, UserCheck, UserX, Users, GraduationCap, ShieldCheck, LayoutGrid } from 'lucide-react';
import { suspenderUsuario, reactivarUsuario } from '@/actions/users';
import '../../../../../styles/admin-table.css';
import '../../../../../styles/admin-usuarios.css';

interface UserRecord {
  id: string;
  nombre: string;
  email: string;
  rol: 'exalumno' | 'estudiante' | 'admin';
  activo: boolean;
  sede?: string | null;
  carrera?: string | null;
  created_at: string;
}

interface UsersTableProps {
  initialUsers: UserRecord[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'exalumno' | 'estudiante' | 'admin'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Estadísticas rápidas para las tarjetas
  const totalUsers = users.length;
  const totalExalumnos = users.filter(u => u.rol === 'exalumno').length;
  const totalEstudiantes = users.filter(u => u.rol === 'estudiante').length;
  const totalAdmins = users.filter(u => u.rol === 'admin').length;

  // Filtrado local por nombre/email, estado y rol
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.activo) ||
      (filterStatus === 'inactive' && !u.activo);
    const matchesRole =
      filterRole === 'all' || u.rol === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleSuspend = async (userId: string) => {
    setLoadingId(userId);
    try {
      await suspenderUsuario(userId);
      // Actualizar el estado local de forma optimista
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, activo: false } : u));
    } catch (err: any) {
      alert(`Error al suspender usuario: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleActivate = async (userId: string) => {
    setLoadingId(userId);
    try {
      await reactivarUsuario(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, activo: true } : u));
    } catch (err: any) {
      alert(`Error al reactivar usuario: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  // Determinar la clase de la píldora de rol de usuario
  const getTypeBadgeClass = (rol: string) => {
    const map: Record<string, string> = {
      exalumno: 'exalumno',
      estudiante: 'estudiante',
      admin: 'admin',
    };
    return `users-type-badge ${map[rol] || ''}`;
  };

  const getTypeLabel = (rol: string) => {
    const map: Record<string, string> = {
      exalumno: 'Exalumno',
      estudiante: 'Estudiante',
      admin: 'Admin',
    };
    return map[rol] || rol;
  };

  return (
    <div>
      {/* Tarjetas de resumen rápido y filtrado interactivo */}
      <div className="admin-stats-grid">
        {/* Tarjeta: Todos */}
        <div 
          className={`admin-stat-card cursor-pointer transition-all ${filterRole === 'all' ? 'active todos' : ''}`}
          onClick={() => setFilterRole('all')}
        >
          <div className="admin-stat-icon todos">
            <LayoutGrid size={22} />
          </div>
          <div>
            <p className="admin-stat-label">Todos</p>
            <p className="admin-stat-value">{totalUsers}</p>
          </div>
        </div>

        {/* Tarjeta: Exalumnos */}
        <div 
          className={`admin-stat-card cursor-pointer transition-all ${filterRole === 'exalumno' ? 'active exalumnos' : ''}`}
          onClick={() => setFilterRole('exalumno')}
        >
          <div className="admin-stat-icon exalumnos">
            <Users size={22} />
          </div>
          <div>
            <p className="admin-stat-label">Exalumnos</p>
            <p className="admin-stat-value">{totalExalumnos}</p>
          </div>
        </div>

        {/* Tarjeta: Estudiantes */}
        <div 
          className={`admin-stat-card cursor-pointer transition-all ${filterRole === 'estudiante' ? 'active estudiantes' : ''}`}
          onClick={() => setFilterRole('estudiante')}
        >
          <div className="admin-stat-icon estudiantes">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="admin-stat-label">Estudiantes</p>
            <p className="admin-stat-value">{totalEstudiantes}</p>
          </div>
        </div>

        {/* Tarjeta: Administradores */}
        <div 
          className={`admin-stat-card cursor-pointer transition-all ${filterRole === 'admin' ? 'active admins' : ''}`}
          onClick={() => setFilterRole('admin')}
        >
          <div className="admin-stat-icon admins">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="admin-stat-label">Administradores</p>
            <p className="admin-stat-value">{totalAdmins}</p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros secundarios */}
      <div className="users-filters-bar">
        <div className="users-search-wrapper">
          <Search className="users-search-icon" size={16} />
          <input
            type="text"
            className="users-search-input"
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="users-filter-group">
          <label htmlFor="filterStatus" className="users-filter-label">Estado</label>
          <select
            id="filterStatus"
            title="Estado"
            className="users-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Suspendidos</option>
          </select>
        </div>
      </div>

      <p className="users-record-count">{filteredUsers.length} usuario(s) encontrado(s)</p>

      {filteredUsers.length === 0 ? (
        <div className="users-empty-state">
          No se encontraron usuarios con los filtros aplicados.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Carrera / Sede</th>
                <th>Estado</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-table-user">
                      <div
                        className={`admin-table-avatar ${user.rol === 'exalumno' ? 'exalumno' : 'estudiante'}`}
                      >
                        {(user.nombre || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="users-info-cell">
                        <span className="users-info-name">{user.nombre || 'Sin nombre'}</span>
                        <span className="users-info-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={getTypeBadgeClass(user.rol)}>
                      {getTypeLabel(user.rol)}
                    </span>
                  </td>
                  <td className="users-table-cell-sub">
                    {user.carrera && <div>{user.carrera}</div>}
                    {user.sede && <div className="users-table-cell-sub-light">{user.sede}</div>}
                    {!user.carrera && !user.sede && <span className="users-table-cell-empty">—</span>}
                  </td>
                  <td>
                    <span className={user.activo ? 'users-status-active' : 'users-status-inactive'}>
                      {user.activo ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="users-table-cell-sub">
                    {new Date(user.created_at).toLocaleDateString('es-CR')}
                  </td>
                  <td>
                    {loadingId === user.id ? (
                      <Loader2 size={18} className="animate-spin" style={{ color: '#94a3b8' }} />
                    ) : user.activo ? (
                      <button
                        className="users-btn-suspend"
                        onClick={() => handleSuspend(user.id)}
                        title="Suspender usuario"
                      >
                        <UserX size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Suspender
                      </button>
                    ) : (
                      <button
                        className="users-btn-activate"
                        onClick={() => handleActivate(user.id)}
                        title="Reactivar usuario"
                      >
                        <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
