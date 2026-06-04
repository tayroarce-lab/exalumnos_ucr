'use client';

import { useState, useEffect } from 'react';
import { DonationAdminView, DonationsHistoryFilters } from '@/types/donations';
import { getPendingDonations, getDonationsHistory, processDonation } from '@/actions/donations';
import { PendingDonations } from './_components/pending-donations';
import { DonationsHistory } from './_components/donations-history';

export default function AdminDonationsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingDonations, setPendingDonations] = useState<DonationAdminView[]>([]);
  const [historyDonations, setHistoryDonations] = useState<DonationAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyFilters, setHistoryFilters] = useState<DonationsHistoryFilters>({});

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await getPendingDonations();
    if (!error && data) {
      setPendingDonations(data);
    }
    setLoading(false);
  };

  const fetchHistory = async (filters: DonationsHistoryFilters) => {
    setLoading(true);
    const { data, error } = await getDonationsHistory(filters);
    if (!error && data) {
      setHistoryDonations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPending();
    } else {
      fetchHistory(historyFilters);
    }
  }, [activeTab, historyFilters]);

  const handleProcessDonation = async (id: string, action: 'confirm' | 'reject', reason?: string) => {
    const res = await processDonation(id, action, reason);
    if (res.success) {
      alert(`Donación ${action === 'confirm' ? 'confirmada' : 'rechazada'} exitosamente.`);
      // Refrescar lista de pendientes
      fetchPending();
    } else {
      alert(`Error al procesar la donación: ${res.error}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Gestión de Donaciones</h1>
        <p style={{ color: '#666' }}>Confirma donaciones pendientes y revisa el historial de ingresos.</p>
      </header>

      {/* Tabs / Pestañas */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ padding: '0.5rem 1rem', fontWeight: activeTab === 'pending' ? 'bold' : 'normal', borderBottom: activeTab === 'pending' ? '2px solid black' : 'none' }}
        >
          Pendientes ({pendingDonations.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ padding: '0.5rem 1rem', fontWeight: activeTab === 'history' ? 'bold' : 'normal', borderBottom: activeTab === 'history' ? '2px solid black' : 'none' }}
        >
          Historial / Auditoría
        </button>
      </div>

      <main>
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <>
            {activeTab === 'pending' && (
              <PendingDonations 
                donations={pendingDonations} 
                onRefresh={fetchPending}
                onProcess={handleProcessDonation} 
              />
            )}
            
            {activeTab === 'history' && (
              <DonationsHistory 
                donations={historyDonations}
                onFilterChange={setHistoryFilters}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
