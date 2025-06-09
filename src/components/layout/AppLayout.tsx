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
       // Only redirect if context is also confirming no user (currentUser is null)
       // This prevents premature redirect if context is still initializing
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser || !currentRole) {
    // Show loading indicator while checking auth or redirecting
    // This check should ideally be quick due to localStorage sync in AppContext
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <SidebarNav />
          <SidebarInset>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <div className="container mx-auto">
                 {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
