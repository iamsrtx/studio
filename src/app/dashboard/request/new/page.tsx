'use client';

import StressRequestForm from '@/components/stress-request/StressRequestForm';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewRequestPage() {
  const { currentRole } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (currentRole === 'Administrator') {
      router.replace('/dashboard'); // Admins don't create requests this way
    }
  }, [currentRole, router]);

  if (currentRole === 'Administrator') {
    return null; // Or a loading/redirecting message
  }
  
  const handleFormSuccess = () => {
    router.push('/dashboard/requests');
  };

  return (
    <div>
      <StressRequestForm onSubmitSuccess={handleFormSuccess} />
    </div>
  );
}
