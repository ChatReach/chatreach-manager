export const API_ROUTES = {
  AUTH: {
    SESSION: '/session',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER: '/auth/user',
  },
  ADMIN: {
    TENANTS: '/admin/tenants',
    TENANT: (id: string) => `/admin/tenants/${id}`,
  },
  BROADCASTING_AUTH: '/broadcasting/auth',
};
