
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, PlusCircle } from 'lucide-react';

export default function ManageFacilitiesPage() {
  const { currentRole, facilities } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (currentRole !== 'Administrator') {
      router.replace('/dashboard');
    }
  }, [currentRole, router]);

  if (currentRole !== 'Administrator') {
    return null;
  }

  return (
    <Card className="max-w-screen-xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-headline">Manage Facilities</CardTitle>
        <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Facility
        </Button>
      </CardHeader>
      <CardContent>
        {facilities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Available Functions</TableHead>
                <TableHead>Shipment Leg</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell>{facility.name}</TableCell>
                  <TableCell>{facility.availableFunctions.join(', ')}</TableCell>
                  <TableCell>{facility.shipmentLeg}</TableCell>
                  <TableCell>{facility.address}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No facilities found.</p>
            <p className="text-sm text-muted-foreground">Add a new facility to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
