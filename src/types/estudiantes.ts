export interface EstudianteDirectorio {
  user_id: string;
  nombre: string;
  foto_url: string | null;
  carrera: string;
  sede: string;
  proyecto_titulo: string | null;
  proyecto_area_tematica: string | null;
  proyecto_tipo: string | null;
  proyecto_porcentaje_avance: number | null;
  areas_de_interes: string[];
  busca_financiamiento: boolean;
  busca_mentoria: boolean;
  busca_empleo: boolean;
  busca_pasantia: boolean;
  proyecto_descripcion?: string;
  escuela_facultad?: string;
}

export interface FiltrosDirectorio {
  carrera: string[];
  proyecto_area_tematica: string[];
  areas_de_interes: string[];
  tipos_apoyo: string[];
  proyecto_tipo: string;
  sede: string;
}
