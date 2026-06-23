'use client';

import { useState } from 'react';
import { requestDirectConnection, cancelDirectConnection, removeDirectConnection } from '@/actions/matches';
import { UserPlus, Clock, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConnectButton({ targetUserId, initialStatus }: { targetUserId: string, initialStatus: 'none' | 'contactado' | 'activo' }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setLoading(true);
    const result = await requestDirectConnection(targetUserId);
    if (result.success) {
      setStatus('contactado');
      router.refresh();
    } else {
      alert(result.error || 'Error al conectar');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    const result = await cancelDirectConnection(targetUserId);
    if (result.success) {
      setStatus('none');
      router.refresh();
    } else {
      alert(result.error || 'Error al cancelar la solicitud');
    }
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!confirm('¿Seguro que deseas eliminar esta conexión?')) return;
    setLoading(true);
    const result = await removeDirectConnection(targetUserId);
    if (result.success) {
      setStatus('none');
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar la conexión');
    }
    setLoading(false);
  };

  if (status === 'activo') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
          <Check className="w-4 h-4" />
          Conectado
        </div>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
          title="Eliminar Conexión"
        >
          <X className="w-4 h-4" />
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    );
  }

  if (status === 'contactado') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
          <Clock className="w-4 h-4" />
          Solicitud Pendiente
        </div>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          {loading ? 'Cancelando...' : 'Cancelar'}
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-md shadow-blue-900/20 disabled:opacity-50"
    >
      <UserPlus className="w-4 h-4" />
      {loading ? 'Procesando...' : 'Conectar'}
    </button>
  );
}
