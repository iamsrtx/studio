
'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { StressRequest, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { CheckCircle, XCircle, Clock, User, CalendarDays, MessageSquare, Building, Layers, MapPinned, Boxes, GitMerge, Settings2, ShieldQuestion } from 'lucide-react';

export default function ViewRequestsPage() {
  const { currentUser, currentRole, stressRequests, updateStressRequestStatus, getUserById } = useAppContext();
  const { toast } = useToast();

  const [displayedRequests, setDisplayedRequests] = useState<StressRequest[]>([]);
  const [title, setTitle] = useState("All Stress Requests");

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<StressRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminComments, setAdminComments] = useState('');

  useEffect(() => {
    if (!currentUser || !currentRole) return;

    let filteredRequests: StressRequest[] = [];
    let pageTitle = "All Stress Requests";

    if (currentRole === 'Administrator') {
      filteredRequests = stressRequests;
    } else if (currentRole === 'Ops') {
      filteredRequests = stressRequests;
      pageTitle = "All Facility Stress Requests";
    } else if (currentRole === 'FacilityHead') {
      filteredRequests = stressRequests.filter(req => req.submittedByUserId === currentUser.id || req.facilityId === currentUser.assignedFacilityId);
      pageTitle = "My Facility Stress Requests";
    }
    
    filteredRequests.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    setDisplayedRequests(filteredRequests);
    setTitle(pageTitle);

  }, [currentUser, currentRole, stressRequests]);


  const getStatusBadgeVariant = (status: StressRequest['status']) => {
    switch (status) {
      case 'Approved': return 'default'; 
      case 'Rejected': return 'destructive';
      case 'Pending': return 'secondary';
      case 'Merged': return 'outline'; 
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

  const openActionDialog = (request: StressRequest, type: 'approve' | 'reject') => {
    setSelectedRequestForAction(request);
    setActionType(type);
    setAdminComments(request.adminComments || ''); // Pre-fill if editing? No, for new action.
    setIsActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequestForAction || !actionType || currentRole !== 'Administrator') return;

    try {
      await updateStressRequestStatus(selectedRequestForAction.id, actionType === 'approve' ? 'Approved' : 'Rejected', adminComments);
      toast({ title: `Request ${actionType === 'approve' ? 'Approved' : 'Rejected'}`, description: `Request ID ${selectedRequestForAction.id} has been updated.`});
      setIsActionDialogOpen(false);
      setSelectedRequestForAction(null);
      setActionType(null);
      setAdminComments('');
    } catch (error) {
      toast({ title: "Error", description: `Failed to update request status.`, variant: "destructive" });
      setIsActionDialogOpen(false);
    }
  };


  if (!currentUser || !currentRole) {
    return <p className="text-center py-10 text-muted-foreground">Loading user data...</p>;
  }

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold font-headline">{title}</h1>
      
      {displayedRequests.length === 0 ? (
        <div className="text-center py-10 border rounded-lg shadow-sm bg-card">
          <ShieldQuestion className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No stress requests found.</p>
          {currentRole !== 'Administrator' && <p className="text-sm text-muted-foreground mt-2">You can create new requests from the dashboard or "New Request" page.</p>}
        </div>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Function</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Ext. Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  {currentRole === 'Administrator' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedRequests.map((request) => {
                  const submittedByUser = getUserById(request.submittedByUserId);
                  const adminApprover = request.adminApproverId ? getUserById(request.adminApproverId) : null;
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.facilityName}</TableCell>
                      <TableCell>{request.facilityFunctionContext}</TableCell>
                      <TableCell>{request.stressLevel}</TableCell>
                      <TableCell>
                        {request.routeName ? `Route: ${request.routeName}` : request.subclusterName ? `SC: ${request.subclusterName}` : 'N/A'}
                      </TableCell>
                      <TableCell>{format(parseISO(request.startDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{request.extensionDays}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[100px] inline-block">{request.reason || 'N/A'}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{request.reason || 'N/A'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{submittedByUser?.name || request.submittedByName}</TableCell>
                      <TableCell>{format(parseISO(request.submissionDate), 'MMM d, yyyy p')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)} className="flex items-center gap-1 whitespace-nowrap">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                        {request.status !== 'Pending' && adminApprover && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {request.status !== 'Merged' ? request.status : 'Processed'} by {adminApprover.name}
                            {request.approvalDate && ` on ${format(parseISO(request.approvalDate), 'MMM d')}`}
                          </div>
                        )}
                      </TableCell>
                      {currentRole === 'Administrator' && (
                        <TableCell className="text-right">
                          {request.status === 'Pending' ? (
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm" onClick={() => openActionDialog(request, 'reject')} className="border-destructive text-destructive hover:bg-destructive/10">
                                Reject
                              </Button>
                              <Button variant="default" size="sm" onClick={() => openActionDialog(request, 'approve')} className="bg-primary hover:bg-primary/90">
                                Approve
                              </Button>
                            </div>
                          ) : (
                             <span className="text-xs text-muted-foreground">Processed</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedRequestForAction && actionType && (
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === 'approve' ? 'Approve' : 'Reject'} Stress Request for {selectedRequestForAction.facilityName}?</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder={`Comments for ${actionType === 'approve' ? 'approval' : 'rejection'} (optional)`}
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              className="min-h-[100px] mt-2"
            />
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => setIsActionDialogOpen(false)}>Cancel</Button>
              <Button 
                variant={actionType === 'reject' ? 'destructive' : 'default'} 
                onClick={handleConfirmAction}
                className={actionType === 'approve' ? 'bg-primary hover:bg-primary/90' : ''}
              >
                Confirm {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Import ShadCN Card, Tooltip components for consistent styling
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

