/**
 * Estructura genérica para las respuestas del API del backend.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Metadatos para respuestas paginadas.
 */
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Estructura para respuestas paginadas de la API.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
