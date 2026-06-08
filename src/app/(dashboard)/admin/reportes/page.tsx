'use client';

import React, { useState } from 'react';
import { Download, Calendar, Loader2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { DashboardMetrics } from '@/components/admin/reportes/DashboardMetrics';
import { DashboardCharts } from '@/components/admin/reportes/DashboardCharts';
import { PendingDonationsTable } from '@/components/admin/reportes/PendingDonationsTable';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { exportToPDF } from '@/lib/pdfExport';
import '../../../../styles/admin-dashboard.css';

export default function AdminReportesPage() {
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | 'thisYear'>('30days');
  
  const getDates = () => {
    const today = new Date();
    switch (dateRange) {
      case '7days':
        return { startDate: format(subDays(today, 7), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
      case '30days':
        return { startDate: format(subDays(today, 30), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
      case 'thisYear':
        return { startDate: `${today.getFullYear()}-01-01`, endDate: format(today, 'yyyy-MM-dd') };
      case 'all':
      default:
        return { startDate: undefined, endDate: undefined };
    }
  };

  const { startDate, endDate } = getDates();
  
  const { data, isLoading, error } = useDashboardMetrics(startDate, endDate, 180000);

  const handleExportPDF = async () => {
    const btn = document.getElementById('btn-export');
    if (btn) btn.innerHTML = '<span style="display:flex; align-items:center; gap:8px;"><svg class="lucide lucide-loader-2 animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Exportando...</span>';
    
    await exportToPDF('dashboard-content', `Impact_Dashboard_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    if (btn) btn.innerHTML = '<span style="display:flex; align-items:center; gap:8px;"><svg class="lucide lucide-download" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Exportar PDF</span>';
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <div>
          <h1>Dashboard de Impacto</h1>
          <p>Métricas detalladas y seguimiento de donaciones y conexiones</p>
        </div>
        
        <div className="admin-header-actions">
          <div className="admin-date-picker-wrapper">
            <Calendar size={16} className="admin-date-picker-icon" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="admin-date-select"
            >
              <option value="7days">Últimos 7 días</option>
              <option value="30days">Últimos 30 días</option>
              <option value="thisYear">Este año</option>
              <option value="all">Todo el tiempo</option>
            </select>
          </div>
          
          <button
            id="btn-export"
            onClick={handleExportPDF}
            className="admin-export-btn"
            disabled={isLoading || !data}
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      {error ? (
        <div className="admin-error-state">
          <span>Ocurrió un error al cargar los datos: {error}</span>
        </div>
      ) : isLoading && !data ? (
        <div className="admin-loading-state">
          <Loader2 className="animate-spin" size={32} />
          <p>Cargando métricas en tiempo real...</p>
        </div>
      ) : (
        <div id="dashboard-content" className="admin-dashboard-content">
          <DashboardMetrics data={data} />
          
          {data && (
            <DashboardCharts 
              graficosCarrera={data.graficosCarrera} 
              graficosSede={data.graficosSede} 
            />
          )}

          <PendingDonationsTable />
          
          <div className="admin-last-updated">
            Última actualización automática. Optimizado por polling cada 3 minutos.
          </div>
        </div>
      )}
    </div>
  );
}
