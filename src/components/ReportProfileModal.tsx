'use client';

import { useState } from 'react';
import { submitProfileReport, SubmitReportInput } from '@/actions/reports';

interface ReportProfileModalProps {
  reportedUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportProfileModal({ reportedUserId, isOpen, onClose }: ReportProfileModalProps) {
  const [reason, setReason] = useState<SubmitReportInput['reason']>('Otro');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await submitProfileReport({
      reported_user_id: reportedUserId,
      reason,
      description
    });

    setLoading(false);

    if (result.success) {
      setMessage('Reporte enviado correctamente.');
      setTimeout(() => {
        onClose();
        setMessage('');
        setDescription('');
      }, 2000);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Reportar Perfil</h2>
        
        {message && (
          <div className={`p-3 mb-4 rounded-md text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del reporte</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="Spam">Spam</option>
              <option value="Perfil Falso">Perfil Falso</option>
              <option value="Comportamiento Inapropiado">Comportamiento Inapropiado</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Detalla el motivo del reporte..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
