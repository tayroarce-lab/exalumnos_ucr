"use server";
import { listarEstudiantes, obtenerEstudiantePorId } from "@/actions/students";
import { EstudianteDirectorio, FiltrosDirectorio } from "@/types/estudiantes";
import { tipoProyectoToLabel, tipoProyectoToDb } from "@/constants/mapeos";

/**
 * Aplana/mapea un registro de `users` (con rol='estudiante')
 * para que coincida con la interfaz `EstudianteDirectorio`.
 */
function aplanarEstudiante(registroBD: any): EstudianteDirectorio {
  return {
    user_id:                    registroBD.id,
    nombre:                     registroBD.nombre        || "Usuario Desconocido",
    foto_url:                   registroBD.foto_url      || null,
    carrera:                    registroBD.carrera       || "",
    sede:                       registroBD.sede          || "",
    escuela_facultad:           registroBD.escuela_facultad || "",
    proyecto_titulo:            registroBD.proyecto_titulo || null,
    proyecto_descripcion:       registroBD.proyecto_descripcion || null,
    proyecto_area_tematica:     registroBD.proyecto_area_tematica || null,
    proyecto_tipo:              tipoProyectoToLabel(registroBD.proyecto_tipo),
    proyecto_porcentaje_avance: registroBD.proyecto_porcentaje_avance ?? null,
    areas_de_interes:           registroBD.areas_de_interes || [],
    busca_financiamiento:       registroBD.busca_financiamiento ?? false,
    busca_mentoria:             registroBD.busca_mentoria ?? false,
    busca_empleo:               registroBD.busca_empleo ?? false,
    busca_pasantia:             registroBD.busca_pasantia ?? false,
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

    // Normalizar tildes para la BD
    if (filtrosDB.tipos_apoyo && filtrosDB.tipos_apoyo.length > 0) {
      filtrosDB.tipos_apoyo = filtrosDB.tipos_apoyo.map((tipo: string) => {
        if (tipo === "mentoria") return "mentoría";
        if (tipo === "pasantia") return "pasantía";
        return tipo;
      });
    }

    // Convertir etiqueta UI → valor enum BD
    if (filtrosDB.proyecto_tipo) {
      filtrosDB.proyecto_tipo = tipoProyectoToDb(filtrosDB.proyecto_tipo);
    }
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
    return aplanarEstudiante(estudianteCrudo);
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene estudiantes relacionados basados en el área temática.
 * Excluye al estudiante actual.
 */
export async function getEstudiantesRelacionados(
  estudianteId: string,
  areaTematica: string | null,
  limite: number = 3
): Promise<EstudianteDirectorio[]> {
  if (!areaTematica) return [];

  const resultado = await listarEstudiantes({
    proyecto_area_tematica: [areaTematica]
  } as any);

  const relacionadosAplanados = (resultado.data || [])
    .filter((e: any) => e.id !== estudianteId)
    .slice(0, limite)
    .map(aplanarEstudiante);

  return relacionadosAplanados;
}
