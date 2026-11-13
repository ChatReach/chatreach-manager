import { APP_ROUTES } from '@/constants/routes';

/**
 * Whether a `returnTo` value is a path on this app, so redirecting to it can't send the user to another site.
 * Browsers read `/\evil.com` as `//evil.com`, so the check resolves the URL instead of only looking at its prefix.
 */
export const isSafeReturnTo = (url?: string | null): url is string => {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
};

// Home is where sign-in lands anyway, so it needs no returnTo.
export const returnToParams = (returnTo: string): Record<string, string> =>
  returnTo === APP_ROUTES.HOME ? {} : { returnTo };
