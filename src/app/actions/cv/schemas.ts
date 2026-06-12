import { z } from 'zod';

// ============================================================================
// SCHEMAS DE CV - Validaciones compartidas (Frontend & Backend)
// ============================================================================

export const academicInfoSchema = z.object({
  university: z.string().min(1, 'La universidad es requerida'),
  career: z.string().min(1, 'La carrera es requerida'),
  academic_level: z.enum(['Bachillerato', 'Licenciatura', 'Maestría', 'Doctorado'], {
    errorMap: () => ({ message: 'Nivel académico inválido' })
  }),
  gpa: z.coerce.number().min(0).max(10).optional(),
  entry_year: z.number().min(1950, 'Año inválido').max(new Date().getFullYear() + 1, 'Año inválido'),
  relevant_courses: z.array(z.string()).optional(),
  graduation_project_title: z.string().optional(),
  graduation_project_description: z.string().optional()
});

export const experienceSchema = z.object({
  id: z.string().uuid().optional(),
  experience_type: z.enum(['Empleo', 'Voluntariado', 'Proyecto universitario', 'Asistencia', 'Investigación'], {
    errorMap: () => ({ message: 'Tipo de experiencia inválido' })
  }),
  title: z.string().min(1, 'El título es requerido'),
  organization: z.string().min(1, 'La organización es requerida'),
  start_month: z.number().min(1).max(12),
  start_year: z.number().min(1950).max(new Date().getFullYear() + 1),
  end_month: z.number().min(1).max(12).optional().nullable(),
  end_year: z.number().min(1950).max(new Date().getFullYear() + 5).optional().nullable(),
  bullets: z.array(z.string().max(120, 'Cada viñeta debe tener máximo 120 caracteres')).max(5, 'Máximo 5 viñetas')
}).refine(data => {
  if (data.end_year && data.start_year) {
    if (data.end_year < data.start_year) return false;
    if (data.end_year === data.start_year && data.end_month && data.start_month) {
      if (data.end_month < data.start_month) return false;
    }
  }
  return true;
}, {
  message: "La fecha de fin no puede ser anterior a la de inicio",
  path: ["end_year"]
});

export const skillSchema = z.object({
  id: z.string().uuid().optional(),
  skill_type: z.enum(['technical', 'soft', 'language']),
  name: z.string().min(1, 'El nombre es requerido'),
  level: z.enum(['Básico', 'Intermedio', 'Avanzado', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional().nullable()
}).refine(data => {
  if (data.skill_type === 'technical' && !['Básico', 'Intermedio', 'Avanzado'].includes(data.level as string)) {
    return false;
  }
  if (data.skill_type === 'language' && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(data.level as string)) {
    return false;
  }
  if (data.skill_type === 'soft' && data.level) {
    return false;
  }
  return true;
}, {
  message: "Nivel inválido para este tipo de habilidad",
  path: ["level"]
});

export const certificationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  institution: z.string().min(1, 'La institución es requerida'),
  issued_month: z.number().min(1).max(12).optional().nullable(),
  issued_year: z.number().min(1950).max(new Date().getFullYear() + 1).optional().nullable(),
  verification_url: z.string().url('URL inválida').optional().nullable().or(z.literal(''))
});

// Infered types
export type AcademicInfoData = z.infer<typeof academicInfoSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type CertificationData = z.infer<typeof certificationSchema>;
