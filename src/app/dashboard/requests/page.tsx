
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { StressRequest, UserRole, Facility } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';
import { CheckCircle, XCircle, Clock, User, CalendarDays, MessageSquare, Building, Layers, MapPinned, Boxes, GitMerge, Settings2, ShieldQuestion, FileDown, FilterX, SlidersHorizontal, Pin } from 'lucide-react'; // Added Pin
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export default function ViewRequestsPage() {
  const { currentUser, currentRole, stressRequests, updateStressRequestStatus, getUserById, facilities } = useAppContext();
  const { toast } = useToast();

  const [allRequestsForRole, setAllRequestsForRole] = useState<StressRequest[]>([]);
  const [displayedRequests, setDisplayedRequests] = useState<StressRequest[]>([]);
  const [title, setTitle] = useState("All Stress Requests");

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<StressRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminComments, setAdminComments] = useState('');

  // Filter states
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined);
  const [filterFacilityId, setFilterFacilityId] = useState<string>('all');

  // Memoize facilities for the dropdown to prevent unnecessary re-renders
  const facilityOptions = useMemo(() => [
    { id: 'all', name: 'All Facilities' },
    ...facilities.map(f => ({ id: f.id, name: f.name })).sort((a,b) => a.name.localeCompare(b.name))
  ], [facilities]);

  useEffect(() => {
    if (!currentUser || !currentRole) return;

    let initialFilteredRequests: StressRequest[] = [];
    let pageTitle = "All Stress Requests";

    if (currentRole === 'Administrator') {
      initialFilteredRequests = stressRequests;
    } else if (currentRole === 'Ops') {
      initialFilteredRequests = stressRequests; // Ops can see all requests
      pageTitle = "All Facility Stress Requests";
    } else if (currentRole === 'FacilityHead') {
      initialFilteredRequests = stressRequests.filter(req => req.submittedByUserId === currentUser.id || req.facilityId === currentUser.assignedFacilityId);
      pageTitle = "My Facility Stress Requests";
    }

    initialFilteredRequests.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    setAllRequestsForRole(initialFilteredRequests);
    setTitle(pageTitle);

  }, [currentUser, currentRole, stressRequests]);

  useEffect(() => {
    let filtered = [...allRequestsForRole];

    if (filterDateFrom) {
      const startDate = startOfDay(filterDateFrom);
      filtered = filtered.filter(req => new Date(req.submissionDate) >= startDate);
    }
    if (filterDateTo) {
      const endDate = endOfDay(filterDateTo);
      filtered = filtered.filter(req => new Date(req.submissionDate) <= endDate);
    }
    if (filterFacilityId !== 'all') {
      filtered = filtered.filter(req => req.facilityId === filterFacilityId);
    }
    setDisplayedRequests(filtered);
  }, [allRequestsForRole, filterDateFrom, filterDateTo, filterFacilityId]);


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
    setAdminComments('');
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

  const handleClearFilters = () => {
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
    setFilterFacilityId('all');
  };

  const handleExportCSV = () => {
    if (displayedRequests.length === 0) return;

    const headers = [
      "Request ID", "Facility Name", "Operating Function", "Stress Level",
      "Scope Type", "Scope Name/Pincode", "Start Date D(S)", "Extension Days T(Ex)",
      "Reason", "Submitted By", "Submitted On", "Status",
      "Processed By (Admin)", "Admin Comments", "Processed Date"
    ];

    const rows = displayedRequests.map(req => {
      const submittedByUser = getUserById(req.submittedByUserId);
      const adminApprover = req.adminApproverId ? getUserById(req.adminApproverId) : null;

      let scopeType = 'N/A';
      let scopeName = 'N/A';
      if (req.stressLevel === 'Pincode' && req.pincode) {
        scopeType = 'Pincode';
        scopeName = req.pincode;
      } else if (req.routeName) {
        scopeType = 'Route';
        scopeName = req.routeName;
      } else if (req.subclusterName) {
        scopeType = 'Subcluster';
        scopeName = req.subclusterName;
      }


      return [
        req.id,
        req.facilityName,
        req.facilityFunctionContext,
        req.stressLevel,
        scopeType,
        scopeName,
        format(parseISO(req.startDate), 'yyyy-MM-dd'),
        req.extensionDays.toString(),
        req.reason || 'N/A',
        submittedByUser?.name || req.submittedByName || 'N/A',
        format(parseISO(req.submissionDate), 'yyyy-MM-dd HH:mm'),
        req.status,
        adminApprover?.name || (req.status !== 'Pending' ? 'N/A' : ''),
        req.adminComments || (req.status !== 'Pending' ? 'N/A' : ''),
        req.approvalDate ? format(parseISO(req.approvalDate), 'yyyy-MM-dd HH:mm') : (req.status !== 'Pending' ? 'N/A' : '')
      ].map(String); // Ensure all are strings for CSV
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `stress_requests_export_${format(new Date(), 'yyyyMMddHHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast({title: "Export Successful", description: "CSV file download initiated."});
  };

  if (!currentUser || !currentRole) {
    return <p className="text-center py-10 text-muted-foreground">Loading user data...</p>;
  }

  const hasActiveFilters = filterDateFrom || filterDateTo || filterFacilityId !== 'all';

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">{title}</h1>
        <Button onClick={handleExportCSV} disabled={displayedRequests.length === 0} variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="filter-date-from">Submission Date From</Label>
            <DatePicker
              date={filterDateFrom}
              setDate={setFilterDateFrom}
              placeholder="Start date"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="filter-date-to">Submission Date To</Label>
            <DatePicker
              date={filterDateTo}
              setDate={setFilterDateTo}
              placeholder="End date"
              disabled={(date) => filterDateFrom ? date < filterDateFrom : false}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="filter-facility">Facility</Label>
            <Select value={filterFacilityId} onValueChange={setFilterFacilityId}>
              <SelectTrigger id="filter-facility" className="w-full h-10">
                <SelectValue placeholder="Select Facility" />
              </SelectTrigger>
              <SelectContent>
                {facilityOptions.map(facility => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleClearFilters} variant="outline" className="w-full lg:w-auto self-end h-10">
            <FilterX className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </CardContent>
      </Card>

      {displayedRequests.length === 0 ? (
        <div className="text-center py-10 border rounded-lg shadow-sm bg-card">
          <ShieldQuestion className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">
            {hasActiveFilters ? "No stress requests match your filter criteria." : "No stress requests found."}
          </p>
          {currentRole !== 'Administrator' && !hasActiveFilters && <p className="text-sm text-muted-foreground mt-2">You can create new requests from the dashboard or "New Request" page.</p>}
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
                  <TableHead>Scope / Pincode</TableHead>
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
                  let scopeDisplay = 'N/A';
                  if (request.stressLevel === 'Pincode' && request.pincode) {
                    scopeDisplay = `Pincode: ${request.pincode}`;
                  } else if (request.routeName) {
                    scopeDisplay = `Route: ${request.routeName}`;
                  } else if (request.subclusterName) {
                    scopeDisplay = `SC: ${request.subclusterName}`;
                  }

                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.facilityName}</TableCell>
                      <TableCell>{request.facilityFunctionContext}</TableCell>
                      <TableCell>{request.stressLevel}</TableCell>
                      <TableCell>{scopeDisplay}</TableCell>
                      <TableCell>{format(parseISO(request.startDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-center">{request.extensionDays}</TableCell>
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
              <DialogClose asChild>
                  <Button variant="ghost" onClick={() => {setIsActionDialogOpen(false); setAdminComments('');}}>Cancel</Button>
              </DialogClose>
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
