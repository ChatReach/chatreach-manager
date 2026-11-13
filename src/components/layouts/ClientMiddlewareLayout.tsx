'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/providers/UserContext';
import { getSession, logout } from '@/api/auth';
import { APP_ROUTES, AUTH_ROUTES } from '@/constants/routes';
import { isSafeReturnTo, returnToParams } from '@/lib/returnTo';

interface Props {
  children: ReactNode;
}

const ClientMiddlewareLayout = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, setUser, loading } = useUser();
  const [isReady, setIsReady] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const isDiscardingSession = useRef(false);

  const search = searchParams.toString();
  const currentUrl = pathname + (search ? `?${search}` : '');
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  /*
   * The backend won't open an admin session for a non-admin, so this is a
   * second line of defence: a non-admin is treated as signed out and never
   * gets as far as rendering the manager.
   */
  const admin = user?.is_admin ? user : null;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || loading) return;

    // Discard a session that somehow authenticated a non-admin.
    if (user && !user.is_admin) {
      if (isDiscardingSession.current) return;
      isDiscardingSession.current = true;

      void (async () => {
        try {
          await getSession();
          await logout();
        } finally {
          setUser(null);
          router.replace(APP_ROUTES.SIGN_IN);
        }
      })();

      return;
    }

    const requiresTwoFactorVerification = Boolean(admin?.two_factor_enabled && !admin?.two_factor_verified);
    const isTwoFactorVerifyRoute = pathname === APP_ROUTES.SIGN_IN_VERIFY;

    if (isTwoFactorVerifyRoute && !admin) {
      router.replace(APP_ROUTES.SIGN_IN);
      return;
    }

    if (requiresTwoFactorVerification && !isTwoFactorVerifyRoute) {
      const query = new URLSearchParams(returnToParams(currentUrl)).toString();
      router.replace(query ? `${APP_ROUTES.SIGN_IN_VERIFY}?${query}` : APP_ROUTES.SIGN_IN_VERIFY);
      return;
    }

    if (!requiresTwoFactorVerification && admin && isAuthRoute) {
      const returnTo = new URLSearchParams(search).get('returnTo');
      router.replace(isSafeReturnTo(returnTo) ? returnTo : APP_ROUTES.HOME);
      return;
    }

    if (!admin && !isAuthRoute) {
      const query = new URLSearchParams(returnToParams(currentUrl)).toString();
      router.replace(query ? `${APP_ROUTES.SIGN_IN}?${query}` : APP_ROUTES.SIGN_IN);
      return;
    }

    setIsReady(true);
  }, [isClient, loading, user, admin, setUser, isAuthRoute, pathname, currentUrl, search, router]);

  if (!isClient || loading || !isReady) return null;

  return <>{children}</>;
};

export default ClientMiddlewareLayout;
