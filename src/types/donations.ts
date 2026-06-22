// Tipos que reflejan la tabla real "donations" en Supabase (aún no renombrada a "donaciones")
export interface DonationRecord {
  id: string;
  user_id: string;       // columna real en BD
  alumni_id?: string;    // alias normalizado en el cliente
  proyecto_id: string | null;
  fondo_general: boolean;
  fondo_destino: string | null;
  proyecto_destino?: string; // nombre legible, enriquecido en el cliente
  monto: number;
  moneda: 'CRC' | 'USD';
  metodo_pago: 'SINPE' | 'Transferencia';
  fecha_transferencia: string;
  numero_referencia: string | null;
  comprobante_url: string;
  mensaje_estudiante: string | null;
  estado: 'pendiente' | 'confirmada' | 'rechazada';
  admin_notes?: string | null;
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
