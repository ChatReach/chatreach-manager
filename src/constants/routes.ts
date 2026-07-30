export const APP_ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_IN_VERIFY: '/sign-in/verify',
  USERS: '/users',
  USER: (id: string) => `/users/${id}`,
  WORKSPACES: '/workspaces',
  WORKSPACES_CREATE: '/workspaces/create',
  SUBSCRIPTIONS: '/subscriptions',
  WEBHOOK_CALLS: '/webhook-calls',
  PROFILE: '/profile',
};

export const AUTH_ROUTES = [APP_ROUTES.SIGN_IN, APP_ROUTES.SIGN_IN_VERIFY];
