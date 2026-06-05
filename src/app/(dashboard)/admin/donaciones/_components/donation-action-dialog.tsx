'use client';

import { useState } from 'react';
import { DonationAdminView } from '@/types/donations';
import '@/styles/admin-matches.css';

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

  // Si el modal no está abierto o no hay donación seleccionada, no renderizar
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
    <div className="admin-dialog-overlay" onClick={resetAndClose}>
      {/* Evitar que clicks dentro del modal cierren el overlay */}
      <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Procesar Donación</h3>

        {/* Información de la donación en dos columnas */}
        <div className="admin-dialog-info-grid">
          <div className="admin-dialog-info-item">
            <p><strong>Donante:</strong> {donation.donor_name}</p>
            <p><strong>Estudiante:</strong> {donation.student_name}</p>
            <p><strong>Monto:</strong> {donation.moneda} {Number(donation.monto).toLocaleString()}</p>
            <p><strong>Método:</strong> {donation.metodo_pago}</p>
            <p><strong>Referencia:</strong> <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{donation.numero_referencia}</span></p>
          </div>
          <div className="admin-dialog-info-item">
            <p><strong>Comprobante:</strong></p>
            {/* Visor de comprobante: iframe para PDF, img para imágenes */}
            {donation.comprobante_url.endsWith('.pdf') ? (
              <iframe src={donation.comprobante_url} width="100%" height="180px" title="Comprobante PDF" style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={donation.comprobante_url} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
            )}
            <a href={donation.comprobante_url} target="_blank" rel="noreferrer" className="admin-dialog-comprobante-link">
              Abrir comprobante completo ↗
            </a>
          </div>
        </div>

        {/* Sección de rechazo: mostrar textarea de motivo */}
        {isRejecting ? (
          <div className="admin-dialog-field">
            <label className="admin-dialog-rejection-label">Motivo de Rechazo (Obligatorio)</label>
            <textarea
              className="admin-dialog-textarea"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Ej: El comprobante está borroso o el número de referencia no coincide."
            />
            <div className="admin-dialog-actions">
              <button className="admin-dialog-btn-cancel" onClick={() => setIsRejecting(false)} disabled={isProcessing}>
                Atrás
              </button>
              <button className="admin-dialog-btn-danger" onClick={handleReject} disabled={isProcessing}>
                {isProcessing ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-dialog-actions">
            <button className="admin-dialog-btn-cancel" onClick={resetAndClose} disabled={isProcessing}>
              Cancelar
            </button>
            <button className="admin-dialog-btn-danger" onClick={() => setIsRejecting(true)} disabled={isProcessing}>
              Rechazar
            </button>
            <button className="admin-dialog-btn-confirm" onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? 'Procesando...' : 'Confirmar Donación'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
