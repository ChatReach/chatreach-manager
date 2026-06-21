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

    if (!user && !isAuthRoute) {
      router.replace(APP_ROUTES.SIGN_IN);
      return;
    }

    if (user && isAuthRoute) {
      router.replace(APP_ROUTES.HOME);
      return;
    }

    setIsReady(true);
  }, [isClient, loading, user, isAuthRoute, router]);

  if (!isClient || loading || !isReady) return null;

  return <>{children}</>;
};

export default ClientMiddlewareLayout;
