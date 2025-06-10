
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  ClipboardPlus, 
  ListChecks, 
  ShieldCheck
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ('Ops' | 'FacilityHead' | 'Administrator')[];
  isRemoved?: boolean; // Flag to easily filter out items
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Ops', 'FacilityHead', 'Administrator'] },
  { href: '/dashboard/request/new', label: 'New Request', icon: ClipboardPlus, roles: ['Ops', 'FacilityHead'] },
  { href: '/dashboard/requests', label: 'View Requests', icon: ListChecks, roles: ['Ops', 'FacilityHead', 'Administrator'] },
  { href: '/dashboard/admin/approvals', label: 'Pending Approvals', icon: ShieldCheck, roles: ['Administrator'] },
  { href: '/dashboard/admin/facilities', label: 'Manage Facilities', icon: LayoutDashboard, roles: ['Administrator'], isRemoved: true },
  { href: '/dashboard/admin/users', label: 'Manage Users', icon: LayoutDashboard, roles: ['Administrator'], isRemoved: true },
  { href: '/dashboard/admin/settings', label: 'App Settings', icon: LayoutDashboard, roles: ['Administrator'], isRemoved: true },
];

export default function SidebarNav() {
  const { currentRole, currentUser } = useAppContext();
  const pathname = usePathname();

  if (!currentRole || !currentUser) return null;

  const filteredNavItems = navItems.filter(item => !item.isRemoved && item.roles.includes(currentRole));

  return (
    <Sidebar collapsible="offcanvas" className="border-r">
        <SidebarHeader className="flex items-center justify-between p-2">
            <div className="p-2 text-sm font-semibold text-sidebar-foreground">Navigation</div>
        </SidebarHeader>
        <SidebarContent>
            <ScrollArea className="h-full pt-4"> {/* Added pt-4 here */}
            <SidebarMenu>
                {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                        className={cn(
                            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                        )}
                        tooltip={item.label} 
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden group-data-[state=collapsed]:hidden">
            <p className="text-xs text-sidebar-foreground/70">© {new Date().getFullYear()} XB Stress Facility Manager</p>
        </SidebarFooter>
    </Sidebar>
  );
}
