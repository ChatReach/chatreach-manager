import { ReactNode, Suspense } from 'react';
import ClientMiddlewareLayout from '@/components/layouts/ClientMiddlewareLayout';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
    <ClientMiddlewareLayout>
      <div className="flex min-h-screen items-center justify-center px-4">
        {children}
      </div>
    </ClientMiddlewareLayout>
    </Suspense>
  );
}
