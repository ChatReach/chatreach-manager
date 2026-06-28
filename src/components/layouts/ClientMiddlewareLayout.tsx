'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/providers/UserContext';
import { APP_ROUTES, AUTH_ROUTES } from '@/constants/routes';

interface Props {
  children: ReactNode;
}

const ClientMiddlewareLayout = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();
  const [isReady, setIsReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || loading) return;

    const requiresTwoFactorVerification = Boolean(user?.two_factor_enabled && !user?.two_factor_verified);
    const isTwoFactorVerifyRoute = pathname === APP_ROUTES.SIGN_IN_VERIFY;

    if (isTwoFactorVerifyRoute && !user) {
      router.replace(APP_ROUTES.SIGN_IN);
      return;
    }

    if (requiresTwoFactorVerification && !isTwoFactorVerifyRoute) {
      router.replace(APP_ROUTES.SIGN_IN_VERIFY);
      return;
    }

    if (!requiresTwoFactorVerification && user && isAuthRoute) {
      router.replace(APP_ROUTES.HOME);
      return;
    }

    if (!user && !isAuthRoute) {
      router.replace(APP_ROUTES.SIGN_IN);
      return;
    }

    setIsReady(true);
  }, [isClient, loading, user, isAuthRoute, pathname, router]);

  if (!isClient || loading || !isReady) return null;

  return <>{children}</>;
};

export default ClientMiddlewareLayout;
