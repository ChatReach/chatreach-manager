import { ReactNode, Suspense } from 'react';
import ClientMiddlewareLayout from '@/components/layouts/ClientMiddlewareLayout';
import MainLayout from '@/components/sidebar/MainLayout';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
    <ClientMiddlewareLayout>
      <MainLayout>{children}</MainLayout>
    </ClientMiddlewareLayout>
    </Suspense>
  );
}
