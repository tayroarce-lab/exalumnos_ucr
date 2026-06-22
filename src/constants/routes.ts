export const ROUTES = {
  HOME: '/',
  LOGIN: '/loginMariel',
  REGISTER: '/registerMariel',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
