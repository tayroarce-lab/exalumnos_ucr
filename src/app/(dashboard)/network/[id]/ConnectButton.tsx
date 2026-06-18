'use client';

import { useState } from 'react';
import { requestDirectConnection } from '@/actions/matches';
import { UserPlus, Clock, Check } from 'lucide-react';
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

  if (status === 'activo') {
    return (
      <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
        <Check className="w-4 h-4" />
        Conectado
      </div>
    );
  }

  if (status === 'contactado') {
    return (
      <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
        <Clock className="w-4 h-4" />
        Solicitud Pendiente
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
