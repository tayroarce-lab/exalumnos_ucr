import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import '../../../styles/admin-table.css';

interface PendingDonation {
  id: string;
  donorName: string;
  donorInitials: string;
  amount: string;
  date: string;
  status: string;
  receiptUrl: string;
}

export const PendingDonationsTable: React.FC = () => {
  const [donations, setDonations] = useState<PendingDonation[]>([]);

  useEffect(() => {
    async function fetchDonations() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('donaciones')
        .select(`
          id,
          monto,
          moneda,
          fecha_transferencia,
          estado,
          comprobante_url,
          users!exalumno_id (nombre, apellidos)
        `)
        .eq('estado', 'pendiente');
      
      if (data) {
        const mapped = data.map((d: any) => {
          const user = Array.isArray(d.users) ? d.users[0] : d.users;
          const fullName = user ? `${user.nombre} ${user.apellidos || ''}`.trim() : 'Donante';
          const initials = user ? (user.nombre.charAt(0) + (user.apellidos?.charAt(0) || '')).toUpperCase() : 'D';
          const currencySymbol = d.moneda === 'USD' ? '$' : '₡';
          return {
            id: d.id,
            donorName: fullName,
            donorInitials: initials,
            amount: `${currencySymbol} ${d.monto}`,
            date: new Date(d.fecha_transferencia).toLocaleDateString(),
            status: d.estado,
            receiptUrl: d.comprobante_url || '#'
          };
        });
        setDonations(mapped);
      }
    }
    fetchDonations();
  }, []);

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
          {donations.map((donation) => (
            <tr key={donation.id}>
              <td>
                <div className="admin-table-user">
                  <div className="admin-table-avatar">
                    {donation.donorInitials}
                  </div>
                  <span style={{ fontWeight: 500 }}>{donation.donorName}</span>
                </div>
              </td>
              <td><span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>{donation.amount}</span></td>
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
                  style={{ color: 'var(--admin-accent-celeste)', textDecoration: 'none', fontWeight: 500 }}
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
          {donations.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                No hay donaciones pendientes por verificar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
