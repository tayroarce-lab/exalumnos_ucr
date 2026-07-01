export interface EstudianteDirectorio {
  /** Corresponde a users.id */
  user_id: string;
  nombre: string;
  foto_url: string | null;
  banner_url?: string | null;
  // Carrera y sede vienen de users_carreras → carrera_campus → carreras/campus
  carrera: string;
  sede: string;
  escuela_facultad?: string;
  anio_ingreso?: number | null;
  carnet_ucr?: string | null;
  nivel_academico?: string | null;
  promedio_ponderado?: number | null;
  beca_socioeconomica?: string | null;
  // Proyecto: en la BD actual solo existe proyecto_graduacion_resumen en curriculums
  proyecto_titulo?: string | null;
  proyecto_descripcion?: string | null;
  proyecto_area_tematica?: string | null;
  proyecto_tipo?: string | null;
  proyecto_porcentaje_avance?: number | null;
  proyecto_valor_monto?: number | null;
  proyecto_valor_moneda?: string | null;
  proyecto_video_url?: string | null;
  proyecto_documento_url?: string | null;
  proyecto_foto_url?: string | null;
  proyecto_activo?: boolean | null;
  proyecto_necesidades?: string[] | null;
  proyecto_beneficios?: string | null;
  proyecto_beneficios_fotos?: string[] | null;
  // Currículum
  sobre_mi?: string | null;
  sobre_mi_personal?: string | null;
  url_linkedin?: string | null;
  url_portfolio?: string | null;
  habilidades?: string[] | null;
  habilidades_tecnicas?: string[];
  habilidades_blandas?: string[];
  // Apoyo: busca_mentoria y busca_empleo existen en users
  busca_mentoria: boolean;
  busca_empleo: boolean;
  // No existen en la BD actual pero mantenemos para compatibilidad
  busca_financiamiento: boolean;
  busca_pasantia: boolean;
  areas_de_interes: string[];
  activo?: boolean;
  match_score?: number; // Porcentaje de compatibilidad con el usuario actual
  // Intereses humanos / vida fuera del aula
  deportes?: string[] | null;
  musica?: string[] | null;
  hobbies?: string[] | null;
  idiomas?: string[] | null;
  actividades_extracurriculares?: string[] | null;
}


export interface FiltrosDirectorio {
  carrera: string[];
  proyecto_area_tematica: string[];
  areas_de_interes: string[];
  tipos_apoyo: string[];
  proyecto_tipo: string;
  sede: string;
}
