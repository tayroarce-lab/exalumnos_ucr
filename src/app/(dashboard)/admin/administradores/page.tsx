'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Shield, Search } from 'lucide-react';
import CreateAdminModal from '@/components/admin/administradores/CreateAdminModal';

export default function AdministradoresPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/administradores');
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.data || []);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(admin => 
    admin.nombre?.toLowerCase().includes(search.toLowerCase()) || 
    admin.apellidos?.toLowerCase().includes(search.toLowerCase()) || 
    admin.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-[#00b0f0]" />
            Administradores
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona los usuarios con acceso total al panel de administración.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00b0f0] text-white rounded-lg hover:bg-[#0090c0] transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Nuevo Administrador</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar administrador..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00b0f0]/20 focus:border-[#00b0f0] transition-all text-sm text-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total: {filteredAdmins.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-sm text-gray-600">
                <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                <th className="px-6 py-4 font-semibold">Fecha de Creación</th>
                <th className="px-6 py-4 font-semibold text-right">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-black">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00b0f0] border-t-transparent rounded-full animate-spin"></div>
                      <p>Cargando administradores...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron administradores.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {admin.nombre?.charAt(0) || ''}{admin.apellidos?.charAt(0) || ''}
                        </div>
                        <div className="font-medium text-gray-800">
                          {admin.nombre} {admin.apellidos}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(admin.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        Administrador
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateAdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAdmins} 
      />
    </div>
  );
}
