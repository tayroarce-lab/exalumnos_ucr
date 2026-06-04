'use client';

import { DonationAdminView } from '@/types/donations';
import { DonationActionDialog } from './donation-action-dialog';
import { useState } from 'react';

interface PendingDonationsProps {
  donations: DonationAdminView[];
  onRefresh: () => void;
  onProcess: (id: string, action: 'confirm' | 'reject', reason?: string) => Promise<void>;
}

export function PendingDonations({ donations, onRefresh, onProcess }: PendingDonationsProps) {
  const [selectedDonation, setSelectedDonation] = useState<DonationAdminView | null>(null);

  // Calcula si la donación tiene más de 24h pendiente
  const isPendingOver24h = (createdAt: string) => {
    const donationDate = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - donationDate) > hours24;
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Cola de Donaciones Pendientes</h3>
      {donations.length === 0 ? (
        <p>No hay donaciones pendientes por revisar.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '0.5rem' }}>Fecha</th>
              <th style={{ padding: '0.5rem' }}>Donante</th>
              <th style={{ padding: '0.5rem' }}>Monto</th>
              <th style={{ padding: '0.5rem' }}>Referencia</th>
              <th style={{ padding: '0.5rem' }}>Estado</th>
              <th style={{ padding: '0.5rem' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(donation => {
              const overdue = isPendingOver24h(donation.created_at);
              return (
                <tr key={donation.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{new Date(donation.created_at).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem' }}>{donation.donor_name}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{donation.moneda} {donation.monto}</td>
                  <td style={{ padding: '0.5rem' }}>{donation.numero_referencia}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {overdue ? (
                      <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ +24h Pendiente</span>
                    ) : (
                      <span style={{ color: 'orange' }}>Pendiente</span>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <button 
                      onClick={() => setSelectedDonation(donation)}
                      style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
