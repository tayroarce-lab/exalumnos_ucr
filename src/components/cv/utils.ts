import { DatosCV } from './CVLiveContext';

export function validarDatosCompletos(datos: DatosCV): boolean {
  if (!datos) return false;

  // 1. Información Académica
  const hasAcademic = Boolean(
    datos.academic &&
    datos.academic.career &&
    datos.academic.academic_level &&
    datos.academic.entry_year
  );

  // 2. Experiencia (al menos 1 bloque con bullets)
  const hasExperience = Array.isArray(datos.experiences) && datos.experiences.some(exp => 
    exp.title && exp.organization && exp.start_month && exp.start_year && Array.isArray(exp.bullets) && exp.bullets.length > 0 && exp.bullets[0].trim() !== ''
  );

  // 3. Habilidades/Idiomas (al menos 1 técnica o de idioma)
  const hasSkills = Array.isArray(datos.skills) && datos.skills.some(skill => 
    skill.skill_type === 'technical' || skill.skill_type === 'language'
  );

  return hasAcademic && hasExperience && hasSkills;
}
