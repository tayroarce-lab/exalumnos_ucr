import { EstudianteDirectorio } from "@/types/estudiantes";

/**
 * Calcula un porcentaje de compatibilidad (Match) del 0 al 100
 * entre un perfil (usualmente el exalumno que visita la página)
 * y un estudiante del directorio.
 */
export function calcularMatch(estudiante: EstudianteDirectorio, perfilActual: any): number {
  if (!perfilActual) return 0; // Si no hay usuario logueado o perfil

  let score = 0;

  // 1. Carrera igual o similar (+40%)
  const c1 = (perfilActual.carrera || perfilActual.carrera_principal || "").toLowerCase();
  const c2 = (estudiante.carrera || "").toLowerCase();
  
  if (c1 && c2) {
    if (c1 === c2 || c1.includes(c2) || c2.includes(c1)) {
      score += 40;
    } else {
      // Coincidencia por palabras clave de carrera (ej: Computación <-> Sistemas <-> Software)
      const isTech1 = c1.includes('computación') || c1.includes('informática') || c1.includes('sistemas') || c1.includes('software');
      const isTech2 = c2.includes('computación') || c2.includes('informática') || c2.includes('sistemas') || c2.includes('software');
      if (isTech1 && isTech2) score += 40;
    }
  }

  // 2. Áreas de Interés en común (+15% cada una, máx 30%)
  const areasEstudiante = estudiante.areas_de_interes || [];
  const areasPerfil = perfilActual.areas_de_interes || [];
  let areasComunes = 0;
  
  if (Array.isArray(areasEstudiante) && Array.isArray(areasPerfil)) {
    for (const a1 of areasPerfil) {
      const s1 = a1.toLowerCase();
      const match = areasEstudiante.some((a2: string) => {
        const s2 = a2.toLowerCase();
        return s1 === s2 || s1.includes(s2) || s2.includes(s1);
      });
      if (match) areasComunes++;
    }
  }
  score += Math.min(30, areasComunes * 15);

  // 3. Misma Sede (+10%)
  if (perfilActual.sede && estudiante.sede) {
    if (perfilActual.sede.toLowerCase() === estudiante.sede.toLowerCase()) {
      score += 10;
    }
  }

  // 4. Búsqueda de Apoyos vs Ofrecimiento (+10%)
  let apoyosMatch = 0;
  if (perfilActual.ofrece_mentoria && estudiante.busca_mentoria) apoyosMatch += 5;
  if (perfilActual.ofrece_empleo && estudiante.busca_empleo) apoyosMatch += 5;
  if (perfilActual.ofrece_pasantia && estudiante.busca_pasantia) apoyosMatch += 5;
  if (perfilActual.ofrece_financiamiento && estudiante.busca_financiamiento) apoyosMatch += 5;
  if (perfilActual.ofrece_proyecto && (estudiante.proyecto_activo || estudiante.proyecto_necesidades)) apoyosMatch += 5;
  score += Math.min(10, apoyosMatch);

  // 5. Análisis de "Sobre Mí", Habilidades y Proyecto (+10%)
  const sobreMiEstudiante = (estudiante.sobre_mi || "").toLowerCase();
  const habilidadesEstudiante = Array.isArray(estudiante.habilidades) ? estudiante.habilidades.join(" ").toLowerCase() : "";
  const proyectoTitulo = (estudiante.proyecto_titulo || "").toLowerCase();
  const proyectoDesc = (estudiante.proyecto_descripcion || "").toLowerCase();
  
  const textoCompletoEstudiante = `${sobreMiEstudiante} ${habilidadesEstudiante} ${proyectoTitulo} ${proyectoDesc}`.toLowerCase();
  
  const sobreMiPerfil = (perfilActual.sobre_mi || perfilActual.bio || "").toLowerCase();
  const habilidadesTech = typeof perfilActual.habilidades_tecnicas === 'object' ? JSON.stringify(perfilActual.habilidades_tecnicas) : "";
  const habilidadesBlandas = Array.isArray(perfilActual.habilidades_blandas) ? perfilActual.habilidades_blandas.join(" ") : "";
  
  const textoCompletoPerfil = `${sobreMiPerfil} ${habilidadesTech} ${habilidadesBlandas}`.toLowerCase();
  
  // Extraer palabras clave de más de 4 letras del perfil actual para cruzar
  const palabrasPerfil = textoCompletoPerfil.split(/\W+/).filter((w: string) => w.length > 4);
  
  let coincidenciasTexto = 0;
  for (const palabra of palabrasPerfil) {
    if (textoCompletoEstudiante.includes(palabra)) {
      coincidenciasTexto++;
    }
  }
  
  // Sumar 1% por cada coincidencia de texto importante (máximo 10%)
  score += Math.min(10, coincidenciasTexto * 1);

  return Math.min(100, Math.round(score));
}

/**
 * Calcula un porcentaje de compatibilidad (Match) del 0 al 100
 * entre un perfil (usualmente el estudiante que visita la página)
 * y un exalumno del directorio.
 */
export function calcularMatchExalumno(exalumno: any, perfilActual: any): number {
  if (!perfilActual) return 0;

  let score = 0;

  // 1. Carrera igual o similar (+40%)
  const c1 = (perfilActual.carrera || perfilActual.carrera_principal || "").toLowerCase();
  const c2 = (exalumno.carrera_principal || exalumno.carrera_ucr || "").toLowerCase();
  
  if (c1 && c2) {
    if (c1 === c2 || c1.includes(c2) || c2.includes(c1)) {
      score += 40;
    } else {
      // Coincidencia por palabras clave de carrera (ej: Computación <-> Sistemas <-> Software)
      const isTech1 = c1.includes('computación') || c1.includes('informática') || c1.includes('sistemas') || c1.includes('software');
      const isTech2 = c2.includes('computación') || c2.includes('informática') || c2.includes('sistemas') || c2.includes('software');
      if (isTech1 && isTech2) score += 40;
    }
  }

  // 2. Áreas de Interés en común (+15% cada una, máx 30%)
  const areasExalumno = exalumno.areas_de_interes || [];
  const areasPerfil = perfilActual.areas_de_interes || [];
  let areasComunes = 0;
  
  if (Array.isArray(areasExalumno) && Array.isArray(areasPerfil)) {
    for (const a1 of areasPerfil) {
      const s1 = a1.toLowerCase();
      const match = areasExalumno.some((a2: string) => {
        const s2 = a2.toLowerCase();
        return s1 === s2 || s1.includes(s2) || s2.includes(s1);
      });
      if (match) areasComunes++;
    }
  }
  score += Math.min(30, areasComunes * 15);

  // 3. Búsqueda de Apoyos vs Ofrecimiento (+20%)
  let apoyosMatch = 0;
  if (exalumno.ofrece_mentoria && perfilActual.busca_mentoria) apoyosMatch += 10;
  if (exalumno.ofrece_empleo && perfilActual.busca_empleo) apoyosMatch += 10;
  if (exalumno.ofrece_pasantia && perfilActual.busca_pasantia) apoyosMatch += 10;
  if (exalumno.ofrece_donacion_dinero && perfilActual.busca_financiamiento) apoyosMatch += 10;
  if (exalumno.ofrece_proyecto && perfilActual.busca_proyecto) apoyosMatch += 10;
  score += Math.min(20, apoyosMatch);

  // 4. Sector / Industria o Análisis de texto extendido (+10%)
  const sobreMiPerfil = (perfilActual.sobre_mi || perfilActual.bio || "").toLowerCase();
  const habilidadesTech = typeof perfilActual.habilidades_tecnicas === 'object' ? JSON.stringify(perfilActual.habilidades_tecnicas) : "";
  const habilidadesBlandas = Array.isArray(perfilActual.habilidades_blandas) ? perfilActual.habilidades_blandas.join(" ") : "";
  
  const textoCompletoPerfil = `${sobreMiPerfil} ${habilidadesTech} ${habilidadesBlandas}`.toLowerCase();
  
  const cargo = (exalumno.cargo_actual || "").toLowerCase();
  const empresa = (exalumno.empresa_actual || "").toLowerCase();
  const sector = (Array.isArray(exalumno.sector_industria) ? exalumno.sector_industria.join(" ") : (exalumno.sector_industria || "")).toLowerCase();
  
  let matchTexto = 0;
  if (cargo && textoCompletoPerfil.includes(cargo)) matchTexto += 5;
  if (empresa && textoCompletoPerfil.includes(empresa)) matchTexto += 5;
  if (sector && textoCompletoPerfil.includes(sector)) matchTexto += 5;
  
  // Extra bonus si las áreas de interés cruzadas de la empresa coinciden con algo
  if (cargo.includes('software') || cargo.includes('cto') || cargo.includes('sistemas') || cargo.includes('tecnología')) {
     if (textoCompletoPerfil.includes('python') || textoCompletoPerfil.includes('docker') || textoCompletoPerfil.includes('tecnolog')) matchTexto += 10;
  }
  
  score += Math.min(10, matchTexto);

  return Math.min(100, Math.round(score));
}
