"use server";
import { listarEstudiantes, obtenerEstudiantePorId } from "@/actions/students";
import { EstudianteDirectorio, FiltrosDirectorio } from "@/types/estudiantes";
import { tipoProyectoToLabel, tipoProyectoToDb } from "@/constants/mapeos";

/**
 * Aplana la estructura devuelta por Supabase (ej. el join `users`)
 * para que coincida exactamente con la interfaz `EstudianteDirectorio`.
 */
function aplanarEstudiante(registroBD: any): EstudianteDirectorio {
  const { users, ...datos } = registroBD;
  
  return {
    ...datos,
    nombre: users?.nombre || "Usuario Desconocido",
    foto_url: users?.foto_url || null,
    proyecto_tipo: tipoProyectoToLabel(datos.proyecto_tipo),
  } as EstudianteDirectorio;
}

/**
 * Obtiene todos los estudiantes aplicando los filtros desde la UI.
 * Transforma los filtros para que sean compatibles con la BD.
 */
export async function getEstudiantes(
  filtrosUI?: FiltrosDirectorio,
  opciones?: { busqueda?: string; page?: number; limit?: number }
): Promise<{ estudiantes: EstudianteDirectorio[]; total: number }> {
  let filtrosDB: any = undefined;

  if (filtrosUI) {
    filtrosDB = { ...filtrosUI };

    // 1. Incompatibilidad ortográfica en `tipos_apoyo` (agregar tildes para la BD)
    if (filtrosDB.tipos_apoyo && filtrosDB.tipos_apoyo.length > 0) {
      filtrosDB.tipos_apoyo = filtrosDB.tipos_apoyo.map((tipo: string) => {
        if (tipo === "mentoria") return "mentoría";
        if (tipo === "pasantia") return "pasantía";
        return tipo;
      });
    }

    // 2. Incompatibilidad de valor en `proyecto_tipo` (Label -> Enum DB)
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
    // Si la acción arroja error (ej. RLS o no encontrado), retornamos null
    // para que la página renderice notFound()
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

  // Reutilizamos listarEstudiantes con el filtro de área
  const resultado = await listarEstudiantes({
    proyecto_area_tematica: [areaTematica]
  });

  // Excluimos el actual, ordenamos por avance y limitamos
  const relacionadosAplanados = (resultado.data || [])
    .filter((e: any) => e.user_id !== estudianteId)
    .slice(0, limite)
    .map(aplanarEstudiante);

  return relacionadosAplanados;
}
