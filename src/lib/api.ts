"use server";
import { listarEstudiantes, obtenerEstudiantePorId } from "@/actions/students";
import { obtenerMiPerfil } from "@/actions/users";
import { EstudianteDirectorio, FiltrosDirectorio } from "@/types/estudiantes";
import { calcularMatch } from "./match";

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
    nombre:                     `${registroBD.nombre || ''} ${registroBD.apellidos || ''}`.trim() || 'Sin Nombre',
    foto_url:                   registroBD.foto_url || null,
    banner_url:                 registroBD.banner_url || null,
    carrera:                    est?.carrera || '',
    sede:                       est?.sede || '',
    escuela_facultad:           est?.escuela_facultad || '',
    anio_ingreso:               est?.anio_ingreso || null,
    proyecto_titulo:            est?.proyecto_titulo || null,
    proyecto_descripcion:       est?.proyecto_descripcion || curr?.proyecto_graduacion_resumen || null,
    proyecto_area_tematica:     est?.proyecto_area_tematica || null,
    proyecto_tipo:              est?.proyecto_tipo || null,
    proyecto_porcentaje_avance: est?.proyecto_porcentaje_avance || null,
    proyecto_valor_monto:       est?.proyecto_valor_monto || null,
    proyecto_valor_moneda:      est?.proyecto_valor_moneda || null,
    proyecto_video_url:         est?.proyecto_video_url || null,
    proyecto_documento_url:     est?.proyecto_documento_url || null,
    proyecto_activo:            est?.proyecto_activo || null,
    proyecto_necesidades:       est?.proyecto_necesidades || [],
    // Currículum
    sobre_mi:                   curr?.sobre_mi || null,
    url_linkedin:               curr?.url_linkedin || null,
    url_portfolio:              curr?.url_portfolio || null,
    habilidades:                extraerHabilidades(curr),
    habilidades_tecnicas:       extraerHabilidades(curr),
    habilidades_blandas:        Array.isArray(curr?.habilidades_blandas) ? curr.habilidades_blandas : [],
    // Datos adicionales del estudiante
    carnet_ucr:                 est?.carnet_ucr || null,
    nivel_academico:            est?.nivel_academico || null,
    promedio_ponderado:         est?.promedio_ponderado || null,
    beca_socioeconomica:        est?.beca_socioeconomica || null,
    sobre_mi_personal:          registroBD.sobre_mi_personal || null,
    // Búsquedas de apoyo (vienen directo de users)
    busca_mentoria:             registroBD.busca_mentoria ?? false,
    busca_empleo:               registroBD.busca_empleo ?? false,
    busca_financiamiento:       est?.busca_financiamiento ?? false,
    busca_pasantia:             registroBD.busca_pasantia ?? false,
    // Otros flags
    areas_de_interes:           registroBD.areas_de_interes || [],
    activo:                     registroBD.activo ?? true,
    // Intereses humanos
    deportes:                   registroBD.deportes || [],
    musica:                     registroBD.musica || [],
    idiomas:                    registroBD.idiomas || [],
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

  // Traer todos los resultados que cumplen los filtros para poder ordenarlos por Match
  const opcionesSinPaginacion = { busqueda: opciones?.busqueda };
  const resultado = await listarEstudiantes(filtrosDB, opcionesSinPaginacion);
  let estudiantes = (resultado.data || []).map(aplanarEstudiante);

  // Obtener perfil actual para calcular match
  const perfilActual = await obtenerMiPerfil().catch(() => null);

  if (perfilActual) {
    estudiantes.forEach(e => {
      e.match_score = calcularMatch(e, perfilActual);
    });
    // Ordenar de mayor a menor compatibilidad
    estudiantes.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  } else {
    // Si no hay perfil, dejar match score en 0
    estudiantes.forEach(e => {
      e.match_score = 0;
    });
  }

  const total = resultado.count || estudiantes.length;

  // Aplicar paginación en memoria
  if (opciones?.page && opciones?.limit) {
    const from = (opciones.page - 1) * opciones.limit;
    const to = from + opciones.limit;
    estudiantes = estudiantes.slice(from, to);
  } else if (opciones?.limit) {
    estudiantes = estudiantes.slice(0, opciones.limit);
  }

  return {
    estudiantes,
    total
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
