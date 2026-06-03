/**
 * Endpoints del backend para llamadas de API organizados por categorías.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
  },
  ALUMNI: {
    BASE: '/alumni',
    PROFILE: '/alumni/profile',
    BY_ID: (id: string) => `/alumni/${id}`,
  },
  EVENTS: {
    BASE: '/events',
    BY_ID: (id: string) => `/events/${id}`,
    REGISTER: (id: string) => `/events/${id}/register`,
  },
} as const;
