import { z } from 'zod'

export const createApplicationSchema = z.object({
  position_id: z.string().uuid('ID de posición inválido'),
  cv_id: z.string().uuid('ID de CV inválido').optional().nullable(),
  message: z
    .string()
    .max(500, 'El mensaje no puede superar los 500 caracteres')
    .optional()
    .nullable(),
})

export const updateApplicationStatusSchema = z.object({
  application_id: z.string().uuid(),
  status: z.enum(['en_revision', 'seleccionado', 'descartado']),
  close_position: z.boolean().optional().default(false),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>
