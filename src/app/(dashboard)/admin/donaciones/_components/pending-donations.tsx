'use client';

import { DonationAdminView } from '@/types/donations';
import { DonationActionDialog } from './donation-action-dialog';
import { useState } from 'react';
import '@/styles/admin-table.css';
import '@/styles/admin-donaciones.css';

interface PendingDonationsProps {
  donations: DonationAdminView[];
  onRefresh: () => void;
  onProcess: (id: string, action: 'confirm' | 'reject', reason?: string) => Promise<void>;
}

export function PendingDonations({ donations, onRefresh, onProcess }: PendingDonationsProps) {
  const [selectedDonation, setSelectedDonation] = useState<DonationAdminView | null>(null);

  // Verifica si una donación lleva más de 24 horas en estado pendiente
  const isPendingOver24h = (createdAt: string) => {
    const donationDate = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return (now - donationDate) > 24 * 60 * 60 * 1000;
  };

  return (
    <div>
      <h3 className="donations-section-title">Cola de Donaciones Pendientes</h3>

      {donations.length === 0 ? (
        <div className="donations-empty-state">
          No hay donaciones pendientes por revisar.
        </div>
      ) : (
        <>
          <p className="donations-record-count">{donations.length} donación(es) en espera de revisión</p>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Donante</th>
                  <th>Monto</th>
                  <th>Referencia</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(donation => {
                  const overdue = isPendingOver24h(donation.created_at);
                  return (
                    <tr key={donation.id}>
                      <td>
                        <div className="admin-table-user">
                          <div className="admin-table-avatar">
                            {donation.donor_name.charAt(0).toUpperCase()}
                          </div>
                          <span>{donation.donor_name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0A2540' }}>
                          {donation.moneda} {Number(donation.monto).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748b' }}>
                        {donation.numero_referencia}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {new Date(donation.created_at).toLocaleString('es-CR')}
                      </td>
                      <td>
                        {overdue ? (
                          <span className="donations-status-overdue">⚠ +24h Pendiente</span>
                        ) : (
                          <span className="donations-status-pending">Pendiente</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="donations-review-btn"
                          onClick={() => setSelectedDonation(donation)}
                        >
                          Revisar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <DonationActionDialog
        isOpen={!!selectedDonation}
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
        onProcess={onProcess}
      />
    </div>
  );
}
