'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DonationAdminView, DonationsHistoryFilters } from '@/types/donations';
import { getPendingDonations, getDonationsHistory, processDonation } from '@/actions/donations';
import { PendingDonations } from './_components/pending-donations';
import { DonationsHistory } from './_components/donations-history';
import '@/styles/admin-dashboard.css';
import '@/styles/admin-donaciones.css';

export default function AdminDonationsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingDonations, setPendingDonations] = useState<DonationAdminView[]>([]);
  const [historyDonations, setHistoryDonations] = useState<DonationAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyFilters, setHistoryFilters] = useState<DonationsHistoryFilters>({});

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await getPendingDonations();
    if (!error && data) setPendingDonations(data);
    setLoading(false);
  };

  const fetchHistory = async (filters: DonationsHistoryFilters) => {
    setLoading(true);
    const { data, error } = await getDonationsHistory(filters);
    if (!error && data) setHistoryDonations(data);
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
      fetchPending();
    } else {
      alert(`Error al procesar la donación: ${res.error}`);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Encabezado principal de la página */}
      <div className="donations-header">
        <h1>Gestión de Donaciones</h1>
        <p>Confirma donaciones pendientes y revisa el historial de ingresos.</p>
      </div>

      {/* Pestañas de navegación */}
      <div className="donations-tabs">
        <button
          className={`donations-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pendientes
          <span className="donations-tab-badge">{pendingDonations.length}</span>
        </button>
        <button
          className={`donations-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial / Auditoría
        </button>
      </div>

      {/* Contenido principal */}
      <main>
        {loading ? (
          <div className="donations-loading">
            <Loader2 size={28} className="animate-spin" />
            <p>Cargando datos...</p>
          </div>
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
