
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { APP_NAME } from '@/lib/constants';
import { LogOut, UserCircle, Menu } from 'lucide-react';
import { MOCK_USERS } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from '@/components/ui/sidebar';


export default function Header() {
  const { currentUser, logout, login } = useAppContext();
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          {isMobile && (
             <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image 
              src="/xb-logo.png" 
              alt="XB Stress Facility Logo" 
              width={28} 
              height={28} 
              className="h-7 w-7"
              data-ai-hint="logo brand"
            />
            <span className="text-xl font-semibold font-headline">{APP_NAME}</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <UserCircle className="h-7 w-7" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email} ({currentUser.role})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Switch User (Demo)</DropdownMenuLabel>
                {MOCK_USERS.filter(u => u.id !== currentUser.id).map(user => (
                    <DropdownMenuItem key={user.id} onClick={() => login(user.id)}>
                        {user.name} ({user.role})
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
