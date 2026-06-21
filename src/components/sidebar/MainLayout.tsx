import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/sidebar/AppSidebar';

interface Props {
  children: ReactNode;
}

const MainLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b px-4 py-3">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
