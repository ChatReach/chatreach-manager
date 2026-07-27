export const APP_ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_IN_VERIFY: '/sign-in/verify',
  TENANTS: '/tenants',
  TENANTS_CREATE: '/tenants/create',
  SUBSCRIPTIONS: '/subscriptions',
  WEBHOOK_CALLS: '/webhook-calls',
  SETTINGS_SECURITY: '/settings/security',
  PROFILE: '/profile',
};

export const AUTH_ROUTES = [APP_ROUTES.SIGN_IN, APP_ROUTES.SIGN_IN_VERIFY];
