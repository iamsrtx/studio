
'use client';

import { useAppContext } from '@/contexts/AppContext';
import StressRequestForm from '@/components/stress-request/StressRequestForm';
import StressRequestList from '@/components/stress-request/StressRequestList';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, UserCheck, ShieldAlert } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, currentRole, stressRequests, facilities, getFacilityById } = useAppContext();
  const router = useRouter();

  if (!currentUser || !currentRole) {
    // This should ideally be handled by the AppLayout, but as a fallback:
    return <p>Loading user data...</p>; 
  }

  const userRequests = stressRequests.filter(req => req.submittedByUserId === currentUser.id);
  const pendingAdminRequests = stressRequests.filter(req => req.status === 'Pending');

  const handleFormSuccess = () => {
    // Potentially navigate or refresh list, for now it auto-updates via context
    router.push('/dashboard/requests');
  };

  const assignedFacility = currentUser.role === 'FacilityHead' && currentUser.assignedFacilityId 
    ? getFacilityById(currentUser.assignedFacilityId) 
    : null;

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold font-headline">Welcome, {currentUser.name}!</h1>
      
      {currentRole === 'Ops' && (
        <StressRequestForm onSubmitSuccess={handleFormSuccess} />
      )}

      {currentRole === 'FacilityHead' && (
        <>
          {assignedFacility ? (
            <Card className="mb-6 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Building className="h-6 w-6 text-primary" />
                  Your Assigned Facility: {assignedFacility.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Primary Function:</strong> {assignedFacility.type}</p>
                {assignedFacility.availableFunctions.length > 1 && (
                  <p><strong>Other Functions:</strong> {assignedFacility.availableFunctions.filter(fn => fn !== assignedFacility.type).join(', ')}</p>
                )}
                <p><strong>Address:</strong> {assignedFacility.address}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 bg-destructive/10 border-destructive text-destructive-foreground shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                 <ShieldAlert className="h-6 w-6" />
                  No Facility Assigned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>You do not have a facility assigned. Please contact an administrator.</p>
              </CardContent>
            </Card>
          )}
          {assignedFacility && <StressRequestForm onSubmitSuccess={handleFormSuccess} />}
        </>
      )}

      {currentRole === 'Administrator' && (
        <StressRequestList requests={pendingAdminRequests} currentUserRole={currentRole} title="Pending Approvals" />
      )}
      
      {currentRole !== 'Administrator' && userRequests.length > 0 && (
         <div className="mt-8">
           <StressRequestList requests={userRequests.slice(0,3)} currentUserRole={currentRole} title="Your Recent Requests" />
         </div>
      )}
    </div>
  );
}
