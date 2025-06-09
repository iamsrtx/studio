'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentUser } = useAppContext(); // Access context directly

  useEffect(() => {
    // Check if currentUser is resolved. If it's undefined, context might still be initializing.
    // Only redirect once currentUser is explicitly null (not logged in) or has a value (logged in).
    if (typeof localStorage !== 'undefined') { // Ensure localStorage is available
        const storedUserId = localStorage.getItem('stressless-userId');
        if (storedUserId) {
            router.replace('/dashboard');
        } else {
            router.replace('/login');
        }
    } else if (currentUser === null) { // Fallback if localStorage isn't immediately available or no storedId
        router.replace('/login');
    } else if (currentUser) {
        router.replace('/dashboard');
    }
  }, [currentUser, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
