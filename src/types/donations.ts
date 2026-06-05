// Interfaz base que refleja la tabla 'donaciones' en Supabase
export interface DonationRecord {
  id: string;
  exalumno_id: string;
  proyecto_estudiante_id: string;
  monto: number;
  moneda: 'CRC' | 'USD';
  metodo_pago: 'sinpe' | 'transferencia_bancaria';
  fecha_transferencia: string;
  numero_referencia: string;
  comprobante_url: string;
  mensaje_estudiante: string | null;
  estado: 'pendiente' | 'confirmada' | 'rechazada';
  confirmado_por: string | null;
  motivo_rechazo: string | null;
  created_at: string;
  updated_at: string;
}

// Vista extendida para el panel de administración
export interface DonationAdminView extends DonationRecord {
  donor_name: string; // Nombre del exalumno
  student_name: string; // Nombre del estudiante
  admin_name?: string | null; // Nombre del admin que confirmó/rechazó
}

// Filtros para el historial de donaciones
export interface DonationsHistoryFilters {
  startDate?: string;
  endDate?: string;
}
