import { ReactNode } from 'react';
import ClientMiddlewareLayout from '@/components/layouts/ClientMiddlewareLayout';
import MainLayout from '@/components/sidebar/MainLayout';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ClientMiddlewareLayout>
      <MainLayout>{children}</MainLayout>
    </ClientMiddlewareLayout>
  );
}
