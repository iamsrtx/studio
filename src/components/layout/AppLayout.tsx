
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import SidebarNav from './SidebarNav';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, currentRole } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('stressless-userId');
    if (!storedUserId && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser || !currentRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {/* This is the overall page container, strictly viewport height */}
      <div className="flex h-screen flex-col bg-background">
        <Header /> {/* Header is already configured sticky (sticky top-0 z-40) */}
        {/* This container holds the sidebar and the main scrollable content area, taking up remaining vertical space */}
        <div className="flex flex-1 overflow-hidden"> {/* overflow-hidden helps contain children and manage layout */}
          <SidebarNav /> {/* Sidebar, manages its own internal scrolling */}
          {/* SidebarInset is the main content area. It will take available width and scroll vertically if its content overflows. */}
          <SidebarInset className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
