import { Database } from './database.types'

// Adaptación de los tipos ya que la BD aún no tiene reflejada la migración en Database.types
export type ApplicationStatus = 
  | 'enviada' 
  | 'en_revision' 
  | 'seleccionado' 
  | 'descartado'

// Como Database.types aún no se ha regenerado, definimos manualmente el Row esperado para la tabla de aplicaciones
export type Application = {
  id: string
  position_id: string
  student_id: string
  alumni_id: string
  cv_id: string | null
  message: string | null
  status: ApplicationStatus
  compatibility_score: number | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export type ApplicationWithDetails = Application & {
  student: {
    id: string
    nombre: string
    // En la DB actual estos datos provienen de estudiante/users/profiles
    // Por simplicidad en la UI:
    carrera: string
    sede: string
    foto_url: string | null
  }
  position: {
    id: string
    titulo: string
    exalumno_id: string
  }
  cv: {
    id: string
    nombre_version: string
  } | null
}

export type StudentApplicationView = Pick<
  Application,
  'id' | 'position_id' | 'status' | 'message' | 'created_at'
> & {
  position: {
    titulo: string
    alumni_name: string
  }
}

export type AlumniApplicationView = Application & {
  student: {
    id: string
    nombre: string
    carrera: string
    sede: string
    foto_url: string | null
  }
  cv: {
    id: string
    nombre_version: string
    signed_url?: string
  } | null
}

export type StatusMessage = {
  [K in ApplicationStatus]: string
}

export const STATUS_MESSAGES: StatusMessage = {
  enviada:     'Tu aplicación fue enviada',
  en_revision: 'El exalumno está revisando tu perfil',
  seleccionado:'¡Fuiste seleccionado! Revisa tu correo',
  descartado:  'La posición fue cubierta por otro candidato',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  enviada:     'bg-blue-100 text-blue-800',
  en_revision: 'bg-yellow-100 text-yellow-800',
  seleccionado:'bg-green-100 text-green-800',
  descartado:  'bg-gray-100 text-gray-600',
}
