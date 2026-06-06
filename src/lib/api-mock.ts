import { MOCK_ESTUDIANTES } from "@/constants/mock-data";
import { EstudianteDirectorio } from "@/types/estudiantes";

/**
 * Obtiene un estudiante por su ID de usuario.
 * Simula una llamada a la base de datos.
 */
export async function getEstudianteById(id: string): Promise<EstudianteDirectorio | null> {
  // Simular un pequeño delay de red
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const estudiante = MOCK_ESTUDIANTES.find(e => e.user_id === id);
  return estudiante || null;
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
  await new Promise(resolve => setTimeout(resolve, 100));

  if (!areaTematica) return [];

  const relacionados = MOCK_ESTUDIANTES.filter(
    e => e.user_id !== estudianteId && e.proyecto_area_tematica === areaTematica
  );

  // Ordenar por porcentaje de avance (opcional, para mostrar los mejores)
  relacionados.sort((a, b) => (b.proyecto_porcentaje_avance || 0) - (a.proyecto_porcentaje_avance || 0));

  return relacionados.slice(0, limite);
}
