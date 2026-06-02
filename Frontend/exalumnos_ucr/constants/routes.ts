/**
 * Rutas internas de navegación de la aplicación para tipado estricto y centralizado.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  // Rutas administrativas
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    EVENTS: '/admin/events',
  },
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
