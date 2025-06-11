
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditFacilityPage() {
  const router = useRouter();
  const params = useParams();
  const { currentRole, getFacilityById } = useAppContext();
  const facilityId = params.facilityId as string;

  useEffect(() => {
    if (currentRole !== 'Administrator') {
      router.replace('/dashboard');
    }
  }, [currentRole, router]);

  const facility = facilityId ? getFacilityById(facilityId) : undefined;

  if (currentRole !== 'Administrator') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => router.push('/dashboard/admin/facilities')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Facilities
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Edit Facility</CardTitle>
          {facility ? (
            <CardDescription>Editing details for: {facility.name} (ID: {facility.id})</CardDescription>
          ) : (
            <CardDescription>Loading facility details...</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {facility ? (
            <div>
              <p className="text-muted-foreground">Facility edit form will be here.</p>
              {/* Placeholder for actual form fields */}
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Facility Name</label>
                  <Skeleton className="h-10 w-full mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Address</label>
                  <Skeleton className="h-10 w-full mt-1" />
                </div>
                <Button className="mt-4" disabled>Save Changes (Not Implemented)</Button>
              </div>
            </div>
          ) : facilityId ? (
             <p className="text-destructive">Facility with ID "{facilityId}" not found.</p>
          ) : (
            <p className="text-destructive">Facility ID is missing.</p>
          )
        }
        </CardContent>
      </Card>
    </div>
  );
}
