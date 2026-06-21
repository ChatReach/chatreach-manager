'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

import { APP_ROUTES } from '@/constants/routes';
import { useUser } from '@/providers/UserContext';
import { logout } from '@/api/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: APP_ROUTES.HOME, icon: LayoutDashboard },
  { label: 'Tenants', href: APP_ROUTES.TENANTS, icon: Users },
  { label: 'Subscriptions', href: APP_ROUTES.SUBSCRIPTIONS, icon: CreditCard },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      router.push(APP_ROUTES.SIGN_IN);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold">
            CR
          </div>
          <span className="truncate text-sm font-semibold">ChatReach Admin</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} tooltip={label}>
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sign out">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
