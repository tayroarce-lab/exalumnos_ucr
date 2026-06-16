"use server";
import { listarEstudiantes, obtenerEstudiantePorId } from "@/actions/students";
import { EstudianteDirectorio, FiltrosDirectorio } from "@/types/estudiantes";

/**
 * Extrae las habilidades técnicas como array de strings desde el jsonb del currículum
 * Formato en BD: { "Python": "Avanzado", "Java": "Intermedio" }
 */
function extraerHabilidades(curriculums: any): string[] {
  if (!curriculums?.habilidades_tecnicas) return [];
  const habs = curriculums.habilidades_tecnicas;
  if (Array.isArray(habs)) return habs;
  if (typeof habs === 'object') return Object.keys(habs);
  return [];
}

/**
 * Aplana/mapea un registro de `users` (con joins de estudiantes y curriculums)
 * para que coincida con la interfaz `EstudianteDirectorio`.
 */
function aplanarEstudiante(registroBD: any): EstudianteDirectorio {
  const est = registroBD.estudiantes;
  const curr = registroBD.curriculums;

  return {
    user_id:                    registroBD.id,
    nombre:                     `${registroBD.nombre || ''} ${registroBD.apellidos || ''}`.trim() || 'Usuario Desconocido',
    foto_url:                   registroBD.foto_url || null,
    carrera:                    est?.carrera || '',
    sede:                       est?.sede || '',
    escuela_facultad:           est?.escuela_facultad || '',
    anio_ingreso:               est?.anio_ingreso || null,
    proyecto_titulo:            est?.proyecto_titulo || null,
    proyecto_descripcion:       est?.proyecto_descripcion || curr?.proyecto_graduacion_resumen || null,
    proyecto_area_tematica:     est?.proyecto_area_tematica || null,
    proyecto_tipo:              est?.proyecto_tipo || null,
    proyecto_porcentaje_avance: est?.proyecto_porcentaje_avance || null,
    // Currículum
    sobre_mi:                   curr?.sobre_mi || null,
    url_linkedin:               curr?.url_linkedin || null,
    url_portfolio:              curr?.url_portfolio || null,
    habilidades_tecnicas:       extraerHabilidades(curr),
    habilidades_blandas:        Array.isArray(curr?.habilidades_blandas) ? curr.habilidades_blandas : [],
    // Búsquedas de apoyo (vienen directo de users)
    busca_mentoria:             registroBD.busca_mentoria ?? false,
    busca_empleo:               registroBD.busca_empleo ?? false,
    busca_financiamiento:       est?.busca_financiamiento ?? false,
    busca_pasantia:             registroBD.busca_pasantia ?? false,
    // Otros flags
    areas_de_interes:           registroBD.areas_de_interes || [],
    activo:                     registroBD.activo ?? true,
  } as EstudianteDirectorio;
}

/**
 * Obtiene todos los estudiantes aplicando los filtros desde la UI.
 */
export async function getEstudiantes(
  filtrosUI?: FiltrosDirectorio,
  opciones?: { busqueda?: string; page?: number; limit?: number }
): Promise<{ estudiantes: EstudianteDirectorio[]; total: number }> {
  let filtrosDB: any = undefined;

  if (filtrosUI) {
    filtrosDB = { ...filtrosUI };
  }

  const resultado = await listarEstudiantes(filtrosDB, opciones);
  return {
    estudiantes: (resultado.data || []).map(aplanarEstudiante),
    total: resultado.count
  };
}

/**
 * Obtiene un estudiante por su ID de usuario.
 */
export async function getEstudianteById(id: string): Promise<EstudianteDirectorio | null> {
  try {
    const estudianteCrudo = await obtenerEstudiantePorId(id);
    if (!estudianteCrudo) {
      console.error('getEstudianteById: estudianteCrudo is null for id:', id);
      return null;
    }
    return aplanarEstudiante(estudianteCrudo);
  } catch (error) {
    console.error('getEstudianteById: Error fetching student with id', id, ':', error);
    return null;
  }
}

/**
 * Obtiene estudiantes relacionados basados en la carrera del estudiante.
 * Excluye al estudiante actual.
 */
export async function getEstudiantesRelacionados(
  estudianteId: string,
  carrera: string | null,
  limite: number = 3
): Promise<EstudianteDirectorio[]> {
  if (!carrera) return [];

  const resultado = await listarEstudiantes({
    carrera: [carrera]
  } as any);

  return (resultado.data || [])
    .filter((e: any) => e.id !== estudianteId)
    .slice(0, limite)
    .map(aplanarEstudiante);
}
