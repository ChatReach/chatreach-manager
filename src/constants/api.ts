export const API_ROUTES = {
  AUTH: {
    SESSION: '/session',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER: '/auth/user',
    TWO_FACTOR_ENABLE: '/auth/2fa/enable',
    TWO_FACTOR_CONFIRM: '/auth/2fa/confirm',
    TWO_FACTOR_VERIFY: '/auth/2fa/verify',
    TWO_FACTOR_DISABLE: '/auth/2fa/disable',
    TWO_FACTOR_RECOVERY_CODES: '/auth/2fa/recovery-codes',
  },
  ADMIN: {
    USERS: '/admin/users',
    TENANTS: '/admin/tenants',
    TENANT: (id: string) => `/admin/tenants/${id}`,
  },
  BROADCASTING_AUTH: '/broadcasting/auth',
};
