'use client';

import StressRequestList from '@/components/stress-request/StressRequestList';
import { useAppContext } from '@/contexts/AppContext';
import type { StressRequest } from '@/lib/types';

export default function ViewRequestsPage() {
  const { currentUser, currentRole, stressRequests } = useAppContext();

  let displayedRequests: StressRequest[] = [];
  let title = "All Stress Requests";

  if (!currentUser || !currentRole) {
    return <p>Loading...</p>;
  }

  if (currentRole === 'Administrator') {
    displayedRequests = stressRequests;
  } else if (currentRole === 'Ops') {
    displayedRequests = stressRequests; // Ops can see all requests
    title = "All Facility Stress Requests";
  } else if (currentRole === 'FacilityHead') {
    displayedRequests = stressRequests.filter(req => req.submittedByUserId === currentUser.id || req.facilityId === currentUser.assignedFacilityId);
    title = "My Facility Stress Requests";
  }
  
  // Sort by submission date, newest first
  displayedRequests.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

  return (
    <div className="max-w-screen-xl mx-auto">
      <StressRequestList requests={displayedRequests} currentUserRole={currentRole} title={title} />
    </div>
  );
}
