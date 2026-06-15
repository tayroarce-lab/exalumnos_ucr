export interface StudentProfile {
  carrera: string
  habilidades: string[]
  sede: string
  areas_de_interes: string[]
}

export interface Position {
  habilidades_requeridas: string[]
  sector: string[]
  lugar: string | null
}

export function calculateCompatibilityScore(
  student: StudentProfile,
  position: Position
): number {
  let score = 0

  // 1. Match de Habilidades (Hasta 50 puntos)
  if (position.habilidades_requeridas && position.habilidades_requeridas.length > 0) {
    const studentSkillsLower = student.habilidades?.map(s => s.toLowerCase().trim()) || []
    const matchedSkills = position.habilidades_requeridas.filter(skill =>
      studentSkillsLower.includes(skill.toLowerCase().trim())
    ).length
    score += Math.round((matchedSkills / position.habilidades_requeridas.length) * 50)
  } else {
    score += 25 // Si no hay habilidades requeridas, damos un score base
  }

  // 2. Match de Sector / Áreas de Interés (Hasta 30 puntos)
  if (position.sector && position.sector.length > 0) {
    const studentInterestsLower = student.areas_de_interes?.map(i => i.toLowerCase().trim()) || []
    const matchedSectors = position.sector.filter(s =>
      studentInterestsLower.includes(s.toLowerCase().trim())
    ).length
    if (matchedSectors > 0) {
      score += Math.round((matchedSectors / position.sector.length) * 30)
    } else {
      score += 10 // Al menos aplicó
    }
  } else {
    score += 15
  }

  // 3. Match de Ubicación / Sede (Hasta 20 puntos)
  if (position.lugar && position.lugar.toLowerCase() !== 'remoto') {
    if (position.lugar.toLowerCase().includes(student.sede.toLowerCase())) {
      score += 20
    } else {
      score += 10
    }
  } else if (position.lugar && position.lugar.toLowerCase() === 'remoto') {
    score += 20 // Si es remoto, le sirve a cualquiera
  } else {
    score += 10
  }

  return Math.min(score, 100)
}
