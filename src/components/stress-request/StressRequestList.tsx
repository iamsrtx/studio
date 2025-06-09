'use client';

import type { StressRequest, UserRole } from '@/lib/types';
import StressRequestListItem from './StressRequestListItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StressRequestListProps {
  requests: StressRequest[];
  currentUserRole: UserRole | null;
  title?: string;
}

export default function StressRequestList({ requests, currentUserRole, title = "Stress Requests" }: StressRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No stress requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-semibold font-headline mb-4">{title}</h2>}
      <ScrollArea className="h-[calc(100vh-250px)]"> {/* Adjust height as needed */}
        <div className="pr-4">
        {requests.map((request) => (
          <StressRequestListItem key={request.id} request={request} currentUserRole={currentUserRole} />
        ))}
        </div>
      </ScrollArea>
    </div>
  );
}
