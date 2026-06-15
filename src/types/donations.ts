export interface DonationRecord {
  id: string;
  alumni_id: string;
  proyecto_destino: string;
  monto: number;
  moneda: 'CRC' | 'USD';
  metodo_pago: 'SINPE' | 'Transferencia';
  fecha_transferencia: string;
  numero_referencia: string;
  comprobante_url: string;
  mensaje_estudiante: string | null;
  estado: 'pendiente' | 'confirmada' | 'rechazada';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationAdminView extends DonationRecord {
  donor_name: string;
  student_name: string;
  admin_name?: string | null;
}

export interface DonationsHistoryFilters {
  startDate?: string;
  endDate?: string;
}
