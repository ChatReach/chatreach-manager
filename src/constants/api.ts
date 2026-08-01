export const API_ROUTES = {
  AUTH: {
    SESSION: '/session',
    LOGIN: '/admin/auth/login',
    LOGOUT: '/admin/auth/logout',
    USER: '/admin/auth/user',
    TWO_FACTOR_ENABLE: '/admin/auth/2fa/enable',
    TWO_FACTOR_CONFIRM: '/admin/auth/2fa/confirm',
    TWO_FACTOR_VERIFY: '/admin/auth/2fa/verify',
    TWO_FACTOR_DISABLE: '/admin/auth/2fa/disable',
    TWO_FACTOR_RECOVERY_CODES: '/admin/auth/2fa/recovery-codes',
  },
  ADMIN: {
    USERS: '/admin/users',
    USER: (id: string) => `/admin/users/${id}`,
    USER_SEND_PASSWORD_RESET: (id: string) => `/admin/users/${id}/send-password-reset`,
    TENANTS: '/admin/tenants',
    TENANT: (id: string) => `/admin/tenants/${id}`,
    TENANT_BETA_ACCESS: (id: string) => `/admin/tenants/${id}/beta-access`,

    WEBHOOK_CALLS: '/admin/webhook-calls',
    WEBHOOK_CALL: (id: string) => `/admin/webhook-calls/${id}`,

    SUBSCRIPTION_PLANS: '/admin/subscription-plans',
    SUBSCRIPTION_PLAN: (id: string) => `/admin/subscription-plans/${id}`,
    SUBSCRIPTION_PLAN_ADDONS: (planId: string) => `/admin/subscription-plans/${planId}/addons`,
    SUBSCRIPTION_ADDON: (id: string) => `/admin/addons/${id}`,

    TENANT_SUBSCRIPTION: (tenantId: string) => `/admin/tenants/${tenantId}/subscription`,
    TENANT_SUBSCRIPTION_SWAP: (tenantId: string) => `/admin/tenants/${tenantId}/subscription/swap`,
    TENANT_SUBSCRIPTION_CANCEL: (tenantId: string) => `/admin/tenants/${tenantId}/subscription/cancel`,
    TENANT_SUBSCRIPTION_RESUME: (tenantId: string) => `/admin/tenants/${tenantId}/subscription/resume`,
    TENANT_SUBSCRIPTION_ADDONS: (tenantId: string) => `/admin/tenants/${tenantId}/subscription/addons`,
  },
  BROADCASTING_AUTH: '/broadcasting/auth',
};
