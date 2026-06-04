'use client';

import { useState } from 'react';
import { DonationAdminView } from '@/types/donations';

interface DonationActionDialogProps {
  donation: DonationAdminView | null;
  isOpen: boolean;
  onClose: () => void;
  onProcess: (id: string, action: 'confirm' | 'reject', reason?: string) => Promise<void>;
}

export function DonationActionDialog({ donation, isOpen, onClose, onProcess }: DonationActionDialogProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Si no está abierto o no hay donación, no renderizar nada
  if (!isOpen || !donation) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onProcess(donation.id, 'confirm');
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Debes proporcionar un motivo para rechazar la donación.');
      return;
    }
    setIsProcessing(true);
    await onProcess(donation.id, 'reject', rejectionReason);
    setIsProcessing(false);
    onClose();
  };

  const resetAndClose = () => {
    setIsRejecting(false);
    setRejectionReason('');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '500px', maxWidth: '800px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Procesar Donación</h3>
        
        <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p><strong>Donante:</strong> {donation.donor_name}</p>
            <p><strong>Estudiante:</strong> {donation.student_name}</p>
            <p><strong>Monto:</strong> {donation.moneda} {donation.monto}</p>
            <p><strong>Método:</strong> {donation.metodo_pago}</p>
            <p><strong>Referencia:</strong> {donation.numero_referencia}</p>
          </div>
          <div>
            <p style={{ fontWeight: 'bold' }}>Comprobante:</p>
            {/* Visor de comprobante básico. Dependiendo de si es PDF o imagen se puede ajustar, aquí asumimos un iframe o img */}
            {donation.comprobante_url.endsWith('.pdf') ? (
              <iframe src={donation.comprobante_url} width="100%" height="200px" title="Comprobante PDF" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={donation.comprobante_url} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
            )}
            <a href={donation.comprobante_url} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '0.5rem', color: 'blue', textDecoration: 'underline' }}>
              Abrir comprobante completo
            </a>
          </div>
        </div>

        {isRejecting ? (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'red' }}>Motivo de Rechazo (Obligatorio)</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc' }}
              placeholder="Ej: El comprobante está borroso o el número de referencia no coincide con nuestros registros."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setIsRejecting(false)} disabled={isProcessing} style={{ padding: '0.5rem 1rem' }}>Atrás</button>
              <button onClick={handleReject} disabled={isProcessing} style={{ padding: '0.5rem 1rem', backgroundColor: 'red', color: 'white' }}>
                {isProcessing ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={resetAndClose} disabled={isProcessing} style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
            <button onClick={() => setIsRejecting(true)} disabled={isProcessing} style={{ padding: '0.5rem 1rem', backgroundColor: '#fca5a5', color: '#991b1b', border: 'none', borderRadius: '4px' }}>
              Rechazar
            </button>
            <button onClick={handleConfirm} disabled={isProcessing} style={{ padding: '0.5rem 1rem', backgroundColor: '#86efac', color: '#166534', border: 'none', borderRadius: '4px' }}>
              {isProcessing ? 'Procesando...' : 'Confirmar Donación'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
