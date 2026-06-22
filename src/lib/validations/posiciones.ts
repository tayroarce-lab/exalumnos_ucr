import { z } from 'zod'

export const PosicionSchema = z.object({
  titulo: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede exceder los 100 caracteres'),
  
  tipo: z.union([
    z.enum(['Empleo', 'Pasantía']),
    z.enum(['empleo', 'pasantia'])
  ], {
    required_error: 'Debe seleccionar el tipo de posición',
  }),
  
  modalidad: z.union([
    z.enum(['Presencial', 'Remoto', 'Híbrido']),
    z.enum(['presencial', 'remoto', 'hibrido'])
  ], {
    required_error: 'Debe seleccionar la modalidad',
  }),
  
  jornada: z.union([
    z.enum(['Tiempo completo', 'Medio tiempo', 'Por proyecto']),
    z.enum(['tiempo_completo', 'medio_tiempo', 'por_proyecto'])
  ], {
    required_error: 'Debe seleccionar la jornada',
  }),
  
  lugar: z.string().min(2, 'Debe especificar el lugar de trabajo'),
  
  empresa: z.string().min(2, 'Debe especificar el nombre de la empresa'),
  
  sector: z.array(z.string()).min(1, 'Debe seleccionar al menos un sector'),
  
  fecha_limite: z.string()
    .refine(dateStr => new Date(dateStr) > new Date(), {
      message: 'La fecha límite debe ser futura',
    }),
  
  habilidades_requeridas: z.array(z.string()).min(1, 'Debe agregar al menos una habilidad requerida'),
  
  descripcion_general: z.string()
    .min(50, 'La descripción debe tener al menos 50 caracteres')
    .max(1500, 'La descripción no puede exceder los 1500 caracteres'),
  
  responsabilidades: z.array(z.string().min(5, 'Cada responsabilidad debe ser descriptiva'))
    .min(3, 'Debe agregar al menos 3 responsabilidades')
    .max(10, 'No puede agregar más de 10 responsabilidades'),
  
  contexto_equipo: z.string()
    .max(300, 'El contexto del equipo no puede exceder los 300 caracteres')
    .optional()
    .nullable(),
})

export type PosicionFormValues = z.infer<typeof PosicionSchema>
