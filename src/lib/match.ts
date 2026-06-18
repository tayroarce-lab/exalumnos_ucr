import { EstudianteDirectorio } from "@/types/estudiantes";

/**
 * Calcula un porcentaje de compatibilidad (Match) del 0 al 100
 * entre un perfil (usualmente el exalumno que visita la página)
 * y un estudiante del directorio.
 */
export function calcularMatch(estudiante: EstudianteDirectorio, perfilActual: any): number {
  if (!perfilActual) return 0; // Si no hay usuario logueado o perfil

  let score = 0;

  // 1. Carrera igual (+40%)
  if (perfilActual.carrera && estudiante.carrera) {
    if (perfilActual.carrera.toLowerCase() === estudiante.carrera.toLowerCase()) {
      score += 40;
    }
  }

  // 2. Áreas de Interés en común (+15% cada una, máx 30%)
  const areasEstudiante = estudiante.areas_de_interes || [];
  const areasPerfil = perfilActual.areas_de_interes || [];
  let areasComunes = 0;
  
  if (Array.isArray(areasEstudiante) && Array.isArray(areasPerfil)) {
    areasComunes = areasPerfil.filter((area: string) => areasEstudiante.includes(area)).length;
  }
  score += Math.min(30, areasComunes * 15);

  // 3. Misma Sede (+15%)
  if (perfilActual.sede && estudiante.sede) {
    if (perfilActual.sede.toLowerCase() === estudiante.sede.toLowerCase()) {
      score += 15;
    }
  }

  // 4. Búsqueda de Apoyos vs Ofrecimiento (+10%)
  // Si el exalumno ofrece apoyo que el estudiante busca
  let apoyosMatch = 0;
  if (perfilActual.ofrece_mentoria && estudiante.busca_mentoria) apoyosMatch += 5;
  if (perfilActual.ofrece_empleo && estudiante.busca_empleo) apoyosMatch += 5;
  if (perfilActual.ofrece_pasantia && estudiante.busca_pasantia) apoyosMatch += 5;
  if (perfilActual.ofrece_financiamiento && estudiante.busca_financiamiento) apoyosMatch += 5;
  score += Math.min(10, apoyosMatch); // Máximo 10% por apoyos

  // 5. Análisis de "Sobre Mí" y "Gustos/Habilidades" (+5%)
  // Toma en cuenta lo que escribe acerca de sí mismo
  const sobreMiEstudiante = (estudiante.sobre_mi || "").toLowerCase();
  const sobreMiPerfil = (perfilActual.sobre_mi || perfilActual.bio || "").toLowerCase();
  
  // Extraer palabras clave de más de 4 letras del perfil actual para cruzar
  const palabrasPerfil = sobreMiPerfil.split(/\W+/).filter((w: string) => w.length > 4);
  
  let coincidenciasTexto = 0;
  for (const palabra of palabrasPerfil) {
    if (sobreMiEstudiante.includes(palabra)) {
      coincidenciasTexto++;
    }
  }
  
  // Sumar 1% por cada coincidencia de texto importante (máximo 5%)
  score += Math.min(5, coincidenciasTexto * 1);

  // Asegurar que el score no pase de 100
  return Math.min(100, Math.round(score));
}
