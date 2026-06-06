import { useState, useEffect, useCallback } from 'react';

interface DashboardData {
  totalDonadoCRC: number;
  totalDonadoUSD: number;
  proyectosApoyados: number;
  matchesActivos: number;
  matchesCerradosExitosamente: number;
  estudiantesActivos: number;
  exalumnosActivos: number;
  graficosCarrera: { name: string; value: number }[];
  graficosSede: { name: string; value: number }[];
  donantesNuevos: number;
  donantesRecurrentes: number;
}

interface UseDashboardMetricsResult {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardMetrics(
  startDate?: string,
  endDate?: string,
  pollingIntervalMs: number = 180000 // Default: 3 minutes
): UseDashboardMetricsResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/dashboard?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar métricas del dashboard');
      }

      const json = await response.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();

    // Configurar polling cada X milisegundos
    const intervalId = setInterval(fetchData, pollingIntervalMs);

    return () => clearInterval(intervalId);
  }, [fetchData, pollingIntervalMs]);

  return { data, isLoading, error, refetch: fetchData };
}
