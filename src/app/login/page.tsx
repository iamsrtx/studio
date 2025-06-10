
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import next/image
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { MOCK_USERS } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { APP_NAME } from '@/lib/constants';

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { login } = useAppContext();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      login(selectedUserId);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            {/* User needs to place their logo at public/logo.png or update src */}
            <Image 
              src="/logo.png" 
              alt="App Logo" 
              width={180} // Larger size for login page
              height={62}  // Maintain aspect ratio (274/94 ~ 2.91). 180/2.91 ~ 61.8
              data-ai-hint="logo large"
            />
          </div>
          <CardTitle className="text-3xl font-headline">{APP_NAME}</CardTitle>
          <CardDescription>Select a user profile to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="user-select" className="text-base">User Profile</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select" className="w-full text-base h-12">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_USERS.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="text-base py-2">
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg h-12" disabled={!selectedUserId}>
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p>This is a demo login. No actual authentication is performed.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
