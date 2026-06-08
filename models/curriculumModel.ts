// =============================================================================
// ARCHIVO: modelos/curriculumModelo.ts
// Descripción: Definición estricta de las interfaces de TypeScript que mapean
//              la persistencia de la base de datos para el CV ATS-Friendly.
// =============================================================================

// [VERDE - FUNCION: EducacionCV]
// Modelo para la formación académica. Promueve omitir secundaria.
export interface EducacionCV {
  id: string;
  estudiante_id: string;
  institucion: string;
  grado_obtenido: string;
  fecha_inicio: string; // ISO Date String
  fecha_fin?: string;
  es_actual: boolean;
}

// [VERDE - FUNCION: ExperienciaCV]
// Modelo para el historial laboral. Obliga al uso de viñetas estructuradas.
export interface ExperienciaCV {
  id: string;
  estudiante_id: string;
  titulo_puesto: string;
  empresa: string;
  fecha_inicio: string;
  fecha_fin?: string;
  es_actual: boolean;
  // Arreglo de strings siguiendo la metodología STAR (Situación, Tarea, Acción, Resultado)
  vinetas_star: string[]; 
}

// [VERDE - FUNCION: ProyectoAcademicoCV]
// Modelo para destacar proyectos prácticos (Placeholder: Proyecto Aguacate).
export interface ProyectoAcademicoCV {
  id: string;
  estudiante_id: string;
  nombre_proyecto: string; 
  descripcion: string;
  tecnologias_usadas: string[];
  url_repositorio?: string;
}

// [VERDE - FUNCION: HabilidadesCV]
// Modelo de separación clara de competencias para parseo óptimo del ATS.
export interface HabilidadesCV {
  id: string;
  estudiante_id: string;
  habilidades_tecnicas: string[];
  habilidades_blandas: string[];
}
