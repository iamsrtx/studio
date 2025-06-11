
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_USERS } from '@/lib/data'; // Using mock data directly for this demo
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, PlusCircle } from 'lucide-react';


export default function ManageUsersPage() {
  const { currentRole } = useAppContext();
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
        <CardTitle className="text-2xl font-headline">Manage Users</CardTitle>
         <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </CardHeader>
      <CardContent>
       {MOCK_USERS.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Facility</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.assignedFacilityId || 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No users found.</p>
             <p className="text-sm text-muted-foreground">Add a new user to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
