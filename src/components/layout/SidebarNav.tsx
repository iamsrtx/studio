'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  ClipboardPlus, 
  ListChecks, 
  ShieldCheck, 
  Building,
  Users
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ('Ops' | 'FacilityHead' | 'Administrator')[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Ops', 'FacilityHead', 'Administrator'] },
  { href: '/dashboard/request/new', label: 'New Request', icon: ClipboardPlus, roles: ['Ops', 'FacilityHead'] },
  { href: '/dashboard/requests', label: 'View Requests', icon: ListChecks, roles: ['Ops', 'FacilityHead', 'Administrator'] },
  { href: '/dashboard/admin/approvals', label: 'Pending Approvals', icon: ShieldCheck, roles: ['Administrator'] },
  { href: '/dashboard/admin/facilities', label: 'Manage Facilities', icon: Building, roles: ['Administrator'] },
  { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users, roles: ['Administrator'] },
];

export default function SidebarNav() {
  const { currentRole, currentUser } = useAppContext();
  const pathname = usePathname();

  if (!currentRole || !currentUser) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <Sidebar collapsible="icon" defaultOpen={true} className="border-r">
        <SidebarHeader className="flex items-center justify-between p-2">
            <div className="p-2 text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">Navigation</div>
             <SidebarTrigger className="hidden md:flex text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" />
        </SidebarHeader>
        <SidebarContent>
            <ScrollArea className="h-full">
            <SidebarMenu>
                {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                        className={cn(
                            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                        )}
                        tooltip={item.label}
                    >
                        <a>
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </a>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-sidebar-foreground/70">© {new Date().getFullYear()} StressLess Inc.</p>
        </SidebarFooter>
    </Sidebar>
  );
}
