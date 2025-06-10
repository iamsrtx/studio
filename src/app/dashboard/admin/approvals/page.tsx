'use client';

import StressRequestList from '@/components/stress-request/StressRequestList';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminApprovalsPage() {
  const { currentRole, stressRequests } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (currentRole !== 'Administrator') {
      router.replace('/dashboard');
    }
  }, [currentRole, router]);

  if (currentRole !== 'Administrator') {
    return null; 
  }

  const pendingRequests = stressRequests.filter(req => req.status === 'Pending')
    .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime()); // Oldest first

  return (
    <div className="max-w-screen-xl mx-auto">
      <StressRequestList requests={pendingRequests} currentUserRole="Administrator" title="Pending Stress Request Approvals" />
    </div>
  );
}
