'use client';

import { useState, useEffect } from 'react';
import { DonationAdminView } from '@/types/donations';
import { getSignedUrlAction } from '@/actions/storage';
import '../../../../../styles/admin-matches.css';

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
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);

  // Genera signed URL cuando se abre el modal con una donación
  useEffect(() => {
    if (!isOpen || !donation?.comprobante_url) {
      setComprobanteUrl(null);
      return;
    }

    // Si ya es una URL completa (http/https), usarla directamente
    if (donation.comprobante_url.startsWith('http')) {
      setComprobanteUrl(donation.comprobante_url);
      return;
    }

    // Si es un path de storage privado, generar signed URL temporal (1 hora)
    getSignedUrlAction('comprobantes', donation.comprobante_url, 3600)
      .then(res => setComprobanteUrl(res.signedUrl))
      .catch(() => setComprobanteUrl(null));
  }, [isOpen, donation?.comprobante_url]);

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

  const isPdf = donation.comprobante_url.endsWith('.pdf');

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
            {/* Visor de comprobante: muestra spinner mientras carga la signed URL */}
            {comprobanteUrl ? (
              isPdf ? (
                <iframe src={comprobanteUrl} width="100%" height="180px" title="Comprobante PDF" style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={comprobanteUrl} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              )
            ) : (
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px', border: '1px dashed #E2E8F0', borderRadius: '8px' }}>
                Cargando comprobante...
              </div>
            )}
            {comprobanteUrl && (
              <a href={comprobanteUrl} target="_blank" rel="noreferrer" className="admin-dialog-comprobante-link">
                Abrir comprobante completo ↗
              </a>
            )}
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
