
'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { StressRequest, UserRole } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { CheckCircle, XCircle, Clock, User, CalendarDays, MessageSquare, Building, Layers, MapPinned, Boxes, GitMerge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StressRequestListItemProps {
  request: StressRequest;
  currentUserRole: UserRole | null;
}

export default function StressRequestListItem({ request, currentUserRole }: StressRequestListItemProps) {
  const { updateStressRequestStatus, getUserById } = useAppContext();
  const [adminComments, setAdminComments] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const { toast } = useToast();

  const submittedByUser = getUserById(request.submittedByUserId);
  const adminApprover = request.adminApproverId ? getUserById(request.adminApproverId) : null;

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (currentUserRole !== 'Administrator') return;
    try {
      await updateStressRequestStatus(request.id, status, adminComments);
      toast({ title: `Request ${status.toLowerCase()}`, description: `Request ID ${request.id} has been ${status.toLowerCase()}. If merged, check existing requests.`});
      if (status === 'Approved') {
        setIsApproveDialogOpen(false);
      } else {
        setIsRejectDialogOpen(false);
      }
      setAdminComments(''); 
    } catch (error) {
      toast({ title: "Error", description: `Failed to update request status.`, variant: "destructive" });
      if (status === 'Approved') {
        setIsApproveDialogOpen(false);
      } else {
        setIsRejectDialogOpen(false);
      }
    }
  };

  const getStatusBadgeVariant = (status: StressRequest['status']) => {
    switch (status) {
      case 'Approved': return 'default'; 
      case 'Rejected': return 'destructive';
      case 'Pending': return 'secondary';
      case 'Merged': return 'outline'; // Using 'outline' for Merged, can be customized
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: StressRequest['status']) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Merged': return <GitMerge className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-headline">{request.facilityName}</CardTitle>
            <CardDescription className="text-sm">Request ID: {request.id}</CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(request.status)} className="flex items-center gap-1 text-sm px-3 py-1">
            {getStatusIcon(request.status)}
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoItem icon={Building} label="Facility Type" value={request.facilityType} />
          <InfoItem icon={Layers} label="Stress Level" value={request.stressLevel} />
          {request.routeName && <InfoItem icon={MapPinned} label="Route" value={request.routeName} />}
          {request.subclusterName && <InfoItem icon={Boxes} label="Subcluster" value={request.subclusterName} />}
          <InfoItem icon={CalendarDays} label="Start Date" value={format(parseISO(request.startDate), 'PPP')} />
          <InfoItem icon={CalendarDays} label="Extension" value={`${request.extensionDays} days`} />
          <InfoItem icon={User} label="Submitted By" value={submittedByUser?.name || request.submittedByName} />
          <InfoItem icon={CalendarDays} label="Submitted On" value={format(parseISO(request.submissionDate), 'PPP p')} />
        </div>
        {request.reason && (
          <InfoItem icon={MessageSquare} label="Reason" value={request.reason} isFullWidth />
        )}
        {request.status !== 'Pending' && adminApprover && (
          <>
            <InfoItem icon={User} label={`${request.status !== 'Merged' ? request.status : 'Processed'} By`} value={adminApprover.name} />
            {request.adminComments && (
              <InfoItem icon={MessageSquare} label="Admin Comments" value={request.adminComments} isFullWidth />
            )}
            {request.approvalDate && (
              <InfoItem icon={CalendarDays} label={`${request.status !== 'Merged' ? request.status : 'Processed'} On`} value={format(parseISO(request.approvalDate), 'PPP p')} />
            )}
          </>
        )}
      </CardContent>
      {currentUserRole === 'Administrator' && request.status === 'Pending' && (
        <CardFooter className="flex justify-end gap-2">
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">Reject</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Stress Request?</DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder="Reason for rejection (optional)"
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                className="min-h-[100px]"
              />
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={() => handleAction('Rejected')}>Confirm Reject</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
             <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Approve</Button>
             </DialogTrigger>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approve Stress Request?</DialogTitle>
                </DialogHeader>
                <Textarea
                    placeholder="Additional comments (optional)"
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                    className="min-h-[100px]"
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => handleAction('Approved')}>Confirm Approve</Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
}

const InfoItem: React.FC<{icon: React.ElementType, label: string, value: string, isFullWidth?: boolean}> = ({ icon: Icon, label, value, isFullWidth }) => (
  <div className={`flex items-start space-x-2 ${isFullWidth ? 'md:col-span-2' : ''}`}>
    <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
    <div>
      <p className="font-medium text-foreground">{label}:</p>
      <p className="text-muted-foreground break-words">{value}</p>
    </div>
  </div>
);
