
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { APP_NAME } from '@/lib/constants';
import { LogOut, UserCircle, Menu, Bell, CheckCheck, PanelLeft } from 'lucide-react';
import { MOCK_USERS } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';


export default function Header() {
  const { 
    currentUser, 
    logout, 
    login, 
    getUnreadNotificationsCount, 
    getCurrentUserNotifications,
    markNotificationAsRead,
    markAllCurrentUserNotificationsAsRead 
  } = useAppContext();
  const { toggleSidebar, isMobile } = useSidebar();
  const router = useRouter();

  const unreadCount = getUnreadNotificationsCount();
  const notificationsToDisplay = getCurrentUserNotifications(5);

  const handleNotificationClick = (notificationId: string, link?: string) => {
    markNotificationAsRead(notificationId);
    if (link) {
      router.push(link);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:mr-4">
            {isMobile ? <Menu className="h-6 w-6" /> : <PanelLeft className="h-6 w-6" />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-lg font-bold">XB</span>
            </div>
            <span className="text-xl font-semibold font-headline hidden sm:inline-block">{APP_NAME}</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 md:w-96" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notifications</span>
                  {notificationsToDisplay.length > 0 && unreadCount > 0 && (
                     <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={markAllCurrentUserNotificationsAsRead}>
                        <CheckCheck className="mr-1 h-3 w-3" />
                        Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationsToDisplay.length > 0 ? (
                  <DropdownMenuGroup className="max-h-80 overflow-y-auto">
                    {notificationsToDisplay.map(notification => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className={`flex flex-col items-start gap-1 whitespace-normal ${!notification.isRead ? 'bg-primary/5' : ''}`}
                        onClick={() => handleNotificationClick(notification.id, notification.link)}
                      >
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                ) : (
                  <DropdownMenuItem disabled className="text-center text-muted-foreground">
                    No new notifications
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
