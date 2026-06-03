/**
 * Define los roles posibles de los usuarios en la plataforma de exalumnos.
 */
export type UserRole = 'ADMIN' | 'ALUMNI' | 'COMPANY';

/**
 * Estructura de datos principal para el perfil de un usuario autenticado.
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Información específica del perfil de un exalumno (Alumni).
 */
export interface AlumniProfile {
  id: string;
  userId: string;
  graduationYear: number;
  major: string; // Carrera cursada en la UCR
  currentCompany?: string;
  jobTitle?: string;
  linkedInUrl?: string;
  bio?: string;
  phoneNumber?: string;
}
