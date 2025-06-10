
'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import FacilitySelector from './FacilitySelector';
import StressLevelSelector from './StressLevelSelector';
import RouteSelector from './RouteSelector';
import SubclusterSelector from './SubclusterSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select imports
import { useAppContext } from '@/contexts/AppContext';
import type { Facility, FacilityType, StressLevel, User } from '@/lib/types';
import { StressRequestSchema, type StressRequestFormData } from '@/zod-schemas';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Label } from "@/components/ui/label";

interface StressRequestFormProps {
  onSubmitSuccess?: () => void;
}

export default function StressRequestForm({ onSubmitSuccess }: StressRequestFormProps) {
  const { currentUser, facilities, addStressRequest, getFacilityById, getRouteById, getSubclusterById, maxExtensionDays } = useAppContext();
  const { toast } = useToast();
  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StressRequestFormData>({
    resolver: zodResolver(StressRequestSchema),
    defaultValues: {
      facilityId: currentUser?.role === 'FacilityHead' && currentUser.assignedFacilityId ? currentUser.assignedFacilityId : '',
      stressLevel: undefined,
      routeId: undefined,
      subclusterId: undefined,
      startDate: undefined,
      extensionDays: 1,
      reason: undefined, // Changed to undefined for Select placeholder
    },
  });

  const watchedStressLevel = form.watch('stressLevel');
  const watchedExtensionDays = form.watch('extensionDays');

  useEffect(() => {
    if (currentUser?.role === 'FacilityHead' && currentUser.assignedFacilityId) {
      const facility = getFacilityById(currentUser.assignedFacilityId);
      setSelectedFacility(facility);
      if (facility) {
        form.setValue('facilityId', facility.id);
      }
    }
  }, [currentUser, getFacilityById, form]);

  useEffect(() => {
    const stressLevelValue = watchedStressLevel as string | undefined;
    if (!stressLevelValue || !stressLevelValue.toLowerCase().includes('route')) {
      form.setValue('routeId', undefined);
      if(form.formState.dirtyFields.routeId) form.clearErrors('routeId');
    }
    if (!stressLevelValue || !stressLevelValue.toLowerCase().includes('subcluster')) {
      form.setValue('subclusterId', undefined);
      if(form.formState.dirtyFields.subclusterId) form.clearErrors('subclusterId');
    }
  }, [watchedStressLevel, form]);

  // Effect to validate extensionDays against admin-set maxExtensionDays
  useEffect(() => {
    if (watchedExtensionDays > maxExtensionDays) {
      form.setError('extensionDays', {
        type: 'manual',
        message: `Extension days cannot exceed the admin-set limit of ${maxExtensionDays}.`
      });
    } else if (form.formState.errors.extensionDays?.type === 'manual' && watchedExtensionDays <= maxExtensionDays) {
      // Clear only if it was a manual error previously set by this logic and now it's valid
      form.clearErrors('extensionDays');
    }
  }, [watchedExtensionDays, maxExtensionDays, form]);


  const handleFacilityChange = (facilityId: string) => {
    const facility = getFacilityById(facilityId);
    setSelectedFacility(facility);
    form.setValue('facilityId', facilityId);
    form.setValue('stressLevel', undefined);
    form.setValue('routeId', undefined);
    form.setValue('subclusterId', undefined);
    form.clearErrors('stressLevel');
    form.clearErrors('routeId');
    form.clearErrors('subclusterId');
  };

  const handleStressLevelChange = (stressLevel: StressLevel | undefined) => {
    form.setValue('stressLevel', stressLevel);
    if (stressLevel && !stressLevel.toLowerCase().includes('route')) {
        form.setValue('routeId', undefined);
        form.clearErrors('routeId');
    }
    if (stressLevel && !stressLevel.toLowerCase().includes('subcluster')) {
        form.setValue('subclusterId', undefined);
        form.clearErrors('subclusterId');
    }
    if (form.formState.dirtyFields.stressLevel) form.trigger('stressLevel');
  };


  const onSubmit = async (data: StressRequestFormData) => {
    if (!currentUser || !selectedFacility) {
      toast({ title: "Error", description: "User or facility not found.", variant: "destructive" });
      return;
    }
     // Final check before submission, though useEffect should handle this reactively
    if (data.extensionDays > maxExtensionDays) {
        form.setError('extensionDays', {
            type: 'manual',
            message: `Extension days cannot exceed ${maxExtensionDays}.`
        });
        toast({ title: "Validation Error", description: `Extension days cannot exceed ${maxExtensionDays}.`, variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const route = data.routeId ? getRouteById(data.routeId) : undefined;
      const subcluster = data.subclusterId ? getSubclusterById(data.subclusterId) : undefined;

      const requestPayload = {
        facilityId: data.facilityId,
        facilityName: selectedFacility.name,
        facilityType: selectedFacility.type,
        stressLevel: data.stressLevel,
        routeId: data.routeId,
        routeName: route?.name,
        subclusterId: data.subclusterId,
        subclusterName: subcluster?.name,
        startDate: data.startDate.toISOString(),
        extensionDays: data.extensionDays,
        reason: data.reason, // reason is now guaranteed to be one of the enum values
      };

      const newRequest = await addStressRequest(requestPayload);
      if (newRequest) {
        toast({ title: "Success", description: "Stress request submitted successfully." });
        form.reset({
            facilityId: currentUser?.role === 'FacilityHead' && currentUser.assignedFacilityId ? currentUser.assignedFacilityId : '',
            stressLevel: undefined,
            routeId: undefined,
            subclusterId: undefined,
            startDate: undefined,
            extensionDays: 1,
            reason: undefined,
        });
        if (currentUser?.role !== 'FacilityHead') setSelectedFacility(undefined);

        if (onSubmitSuccess) onSubmitSuccess();
      } else {
         toast({ title: "Error", description: "Failed to submit stress request.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const facilityTypeForSelectors = selectedFacility?.type;
  const currentStressLevel = form.getValues('stressLevel') as string | undefined;


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Mark Facility as Stressed</CardTitle>
        <CardDescription>Fill in the details below to submit a stress marking request.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentUser?.role === 'Ops' && (
              <FormField
                control={form.control}
                name="facilityId"
                render={({ field }) => (
                  <FormItem>
                    <FacilitySelector
                      selectedFacilityId={field.value}
                      onFacilityChange={(facilityId) => {
                        handleFacilityChange(facilityId);
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentUser?.role === 'FacilityHead' && selectedFacility && (
              <div className="space-y-1">
                <Label>Facility</Label>
                <Input value={`${selectedFacility.name} (${selectedFacility.type})`} disabled className="h-10" />
              </div>
            )}

            <FormField
              control={form.control}
              name="stressLevel"
              render={({ field }) => (
                <FormItem>
                  <StressLevelSelector
                    facilityType={facilityTypeForSelectors}
                    selectedStressLevel={field.value}
                    onStressLevelChange={(value) => handleStressLevelChange(value as StressLevel)}
                    disabled={!selectedFacility}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentStressLevel && currentStressLevel.toLowerCase().includes('route') && (
              <FormField
                control={form.control}
                name="routeId"
                render={({ field }) => (
                  <FormItem>
                    <RouteSelector
                      selectedRouteId={field.value}
                      onRouteChange={field.onChange}
                      disabled={!selectedFacility || !currentStressLevel}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentStressLevel && currentStressLevel.toLowerCase().includes('subcluster') && (
              <FormField
                control={form.control}
                name="subclusterId"
                render={({ field }) => (
                  <FormItem>
                    <SubclusterSelector
                      selectedSubclusterId={field.value}
                      onSubclusterChange={field.onChange}
                      disabled={!selectedFacility || !currentStressLevel}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Stress Marking Start Date D(S)</FormLabel>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="extensionDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extension Days T(Ex)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 7"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value,10) || 0)}
                      min={1}
                      max={maxExtensionDays} // HTML5 validation
                      className="h-10"
                    />
                  </FormControl>
                  <FormDescription>
                    Min: 1, Max: {maxExtensionDays} (Admin-defined)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stress Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Space Stress">Space Stress</SelectItem>
                      <SelectItem value="Volume Stress">Volume Stress</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg h-12" disabled={isSubmitting || !form.formState.isValid}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
