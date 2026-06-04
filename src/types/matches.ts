export interface MatchAdminView {
  id: string;
  exalumno_id: string;
  estudiante_id: string;
  exalumno_nombre: string;
  estudiante_nombre: string;
  tipo_apoyo: string;
  score_match: number;
  estado: 'sugerido' | 'contactado' | 'activo' | 'cerrado';
  resultado: 'exitoso' | 'cancelado' | 'en_progreso' | null;
  notas_admin: string | null;
  created_at: string;
  updated_at: string;
  estudiante_carrera: string;
}

export interface MatchFilters {
  carrera?: string;
  tipo_apoyo?: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}
