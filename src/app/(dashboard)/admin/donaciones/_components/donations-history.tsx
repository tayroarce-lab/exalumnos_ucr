'use client';

import { DonationAdminView, DonationsHistoryFilters } from '@/types/donations';
import { useState, useMemo } from 'react';

interface DonationsHistoryProps {
  donations: DonationAdminView[];
  onFilterChange: (filters: DonationsHistoryFilters) => void;
}

export function DonationsHistory({ donations, onFilterChange }: DonationsHistoryProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApplyFilters = () => {
    onFilterChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  // Calcula totales por moneda
  const totals = useMemo(() => {
    let crc = 0;
    let usd = 0;
    donations.forEach(d => {
      if (d.estado === 'confirmada') {
        if (d.moneda === 'CRC') crc += Number(d.monto);
        if (d.moneda === 'USD') usd += Number(d.monto);
      }
    });
    return { crc, usd };
  }, [donations]);

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Historial de Donaciones</h3>
      
      {/* Filtros de Fecha */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem' }}>Fecha Inicio</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem' }}>Fecha Fin</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleApplyFilters} style={{ padding: '0.25rem 1rem' }}>Filtrar</button>
        </div>
      </div>

      {/* Totales Confirmados */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.875rem', color: '#166534' }}>Total Confirmado (CRC)</span>
          <strong style={{ fontSize: '1.25rem', color: '#15803d' }}>₡ {totals.crc.toLocaleString()}</strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.875rem', color: '#166534' }}>Total Confirmado (USD)</span>
          <strong style={{ fontSize: '1.25rem', color: '#15803d' }}>$ {totals.usd.toLocaleString()}</strong>
        </div>
      </div>

      {/* Tabla de Historial (Auditoría) */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '0.5rem' }}>Fecha Modificación</th>
            <th style={{ padding: '0.5rem' }}>Donante</th>
            <th style={{ padding: '0.5rem' }}>Monto</th>
            <th style={{ padding: '0.5rem' }}>Estado</th>
            <th style={{ padding: '0.5rem' }}>Admin / Auditoría</th>
            <th style={{ padding: '0.5rem' }}>Comprobante</th>
          </tr>
        </thead>
        <tbody>
          {donations.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>No hay registros en el historial para este período.</td>
            </tr>
          ) : (
            donations.map(donation => (
              <tr key={donation.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{new Date(donation.updated_at).toLocaleString()}</td>
                <td style={{ padding: '0.5rem' }}>{donation.donor_name}</td>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{donation.moneda} {donation.monto}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{ color: donation.estado === 'confirmada' ? 'green' : 'red' }}>
                    {donation.estado.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>Por: {donation.admin_name || 'Desconocido'}</span>
                  {donation.estado === 'rechazada' && (
                    <div style={{ fontSize: '0.75rem', color: 'gray', marginTop: '0.25rem' }}>
                      Motivo: {donation.motivo_rechazo}
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <a href={donation.comprobante_url} target="_blank" rel="noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                    Ver comprobante
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
