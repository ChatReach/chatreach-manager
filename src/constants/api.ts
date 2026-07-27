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
