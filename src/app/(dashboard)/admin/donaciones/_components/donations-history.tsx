'use client';

import { DonationAdminView, DonationsHistoryFilters } from '@/types/donations';
import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import '@/styles/admin-table.css';
import '@/styles/admin-donaciones.css';

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

  // Calcular totales acumulados por moneda de donaciones confirmadas
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

  // Retornar el className de la píldora de estado según el valor
  const getStatusClass = (estado: string) => {
    if (estado === 'confirmada') return 'donations-status-confirmed';
    if (estado === 'rechazada') return 'donations-status-rejected';
    return 'donations-status-pending';
  };

  const getStatusLabel = (estado: string) => {
    if (estado === 'confirmada') return 'Confirmada';
    if (estado === 'rechazada') return 'Rechazada';
    return 'Pendiente';
  };

  return (
    <div>
      <h3 className="donations-section-title">Historial de Donaciones</h3>

      {/* Filtros de Fecha */}
      <div className="donations-filters-bar">
        <Filter size={18} style={{ color: '#94a3b8', marginBottom: '2px' }} />
        <div className="donations-filter-group">
          <label className="donations-filter-label">Fecha Inicio</label>
          <input
            type="date"
            className="donations-filter-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="donations-filter-group">
          <label className="donations-filter-label">Fecha Fin</label>
          <input
            type="date"
            className="donations-filter-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="donations-filter-btn" onClick={handleApplyFilters}>
          Aplicar Filtros
        </button>
      </div>

      {/* Totales confirmados */}
      <div className="donations-totals">
        <div className="donations-total-card">
          <span className="donations-total-label">Total Confirmado (CRC)</span>
          <span className="donations-total-value">₡ {totals.crc.toLocaleString('es-CR')}</span>
        </div>
        <div className="donations-total-card">
          <span className="donations-total-label">Total Confirmado (USD)</span>
          <span className="donations-total-value">$ {totals.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Tabla de historial/auditoría */}
      <p className="donations-record-count">{donations.length} registro(s) encontrado(s)</p>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha Modificación</th>
              <th>Donante</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Admin / Auditoría</th>
              <th>Comprobante</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No hay registros en el historial para este período.
                </td>
              </tr>
            ) : (
              donations.map(donation => (
                <tr key={donation.id}>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {new Date(donation.updated_at).toLocaleString('es-CR')}
                  </td>
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
                  <td>
                    <span className={getStatusClass(donation.estado)}>
                      {getStatusLabel(donation.estado)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#475569' }}>
                      {donation.admin_name || 'Desconocido'}
                    </span>
                    {donation.estado === 'rechazada' && (
                      <div className="donations-rejection-reason">
                        Motivo: {donation.motivo_rechazo}
                      </div>
                    )}
                  </td>
                  <td>
                    <a
                      href={donation.comprobante_url}
                      target="_blank"
                      rel="noreferrer"
                      className="donations-comprobante-link"
                    >
                      Ver comprobante
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
