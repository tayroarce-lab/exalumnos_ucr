import React from 'react';
import { Check, X } from 'lucide-react';
import '../../../styles/admin-table.css';

interface PendingDonation {
  id: string;
  donorName: string;
  donorInitials: string;
  amount: string;
  date: string;
  status: 'pendiente' | 'procesando';
  receiptUrl: string;
}

const mockPendingDonations: PendingDonation[] = [
  {
    id: '1',
    donorName: 'María Rojas',
    donorInitials: 'MR',
    amount: '₡ 50,000',
    date: '10 May 2026',
    status: 'pendiente',
    receiptUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: '2',
    donorName: 'Carlos Méndez',
    donorInitials: 'CM',
    amount: '$ 120.00',
    date: '11 May 2026',
    status: 'procesando',
    receiptUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: '3',
    donorName: 'Laura Vargas',
    donorInitials: 'LV',
    amount: '₡ 25,000',
    date: '12 May 2026',
    status: 'pendiente',
    receiptUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  }
];

export const PendingDonationsTable: React.FC = () => {
  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h3>Donaciones por Verificar</h3>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Donante</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Comprobante</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {mockPendingDonations.map((donation) => (
            <tr key={donation.id}>
              <td>
                <div className="admin-table-user">
                  <div className="admin-table-avatar">
                    {donation.donorInitials}
                  </div>
                  <span style={{ fontWeight: 500 }}>{donation.donorName}</span>
                </div>
              </td>
              <td><span style={{ fontWeight: 600, color: '#0A2540' }}>{donation.amount}</span></td>
              <td>{donation.date}</td>
              <td>
                <span className={`admin-table-pill ${donation.status === 'pendiente' ? 'orange' : 'teal'}`}>
                  {donation.status === 'pendiente' ? 'Pendiente' : 'Procesando'}
                </span>
              </td>
              <td>
                <a 
                  href={donation.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
                >
                  Ver PDF
                </a>
              </td>
              <td>
                <div className="admin-table-actions">
                  <button className="admin-btn-icon check" title="Aprobar">
                    <Check size={18} />
                  </button>
                  <button className="admin-btn-icon close" title="Rechazar">
                    <X size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
