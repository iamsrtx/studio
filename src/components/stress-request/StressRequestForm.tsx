
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from '@/contexts/AppContext';
import type { Facility, FacilityFunction, StressLevel } from '@/lib/types';
import { StressRequestSchema, type StressRequestFormData } from '@/zod-schemas';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { STRESS_LEVELS_MAP, FACILITY_FUNCTIONS } from '@/lib/constants';
import ReasonSuggestion from './ReasonSuggestion';


interface StressRequestFormProps {
  onSubmitSuccess?: () => void;
}

export default function StressRequestForm({ onSubmitSuccess }: StressRequestFormProps) {
  const { currentUser, facilities, addStressRequest, getFacilityById, getRouteById, getSubclusterById, maxExtensionDays } = useAppContext();
  const { toast } = useToast();
  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableFunctionsForSelectedFacility, setAvailableFunctionsForSelectedFacility] = useState<FacilityFunction[]>([]);

  const form = useForm<StressRequestFormData>({
    resolver: zodResolver(StressRequestSchema),
    defaultValues: {
      facilityId: currentUser?.role === 'FacilityHead' && currentUser.assignedFacilityId ? currentUser.assignedFacilityId : '',
      facilityFunctionContext: undefined,
      stressLevel: undefined,
      routeId: undefined,
      subclusterId: undefined,
      startDate: undefined,
      extensionDays: 1,
      reason: "Space Stress",
    },
  });

  const watchedFacilityId = form.watch('facilityId');
  const watchedFacilityFunctionContext = form.watch('facilityFunctionContext');
  const watchedStressLevel = form.watch('stressLevel');
  const watchedExtensionDays = form.watch('extensionDays');
  const watchedReason = form.watch('reason');


  // Effect for when facilityId changes (user selects a facility)
useEffect(() => {
    if (watchedFacilityId) {
        const facility = getFacilityById(watchedFacilityId);
        setSelectedFacility(facility); // React state for UI elements that depend on the whole facility object

        if (facility && facility.availableFunctions && facility.availableFunctions.length > 0) {
            setAvailableFunctionsForSelectedFacility(facility.availableFunctions); // React state for populating dropdown

            if (facility.availableFunctions.length === 1) {
                const singleFunction = facility.availableFunctions[0];
                // Ensure the single function is a valid one from the global list
                if (FACILITY_FUNCTIONS.includes(singleFunction as FacilityFunction)) {
                    form.setValue('facilityFunctionContext', singleFunction, { shouldDirty: true, shouldValidate: true });
                } else {
                    // This case means bad data in facility.availableFunctions (e.g., it contains an empty string or invalid function)
                    form.setValue('facilityFunctionContext', undefined, { shouldDirty: true, shouldValidate: true });
                }
            } else { // Facility has multiple functions, or the single one was invalid; user must select
                form.setValue('facilityFunctionContext', undefined, { shouldDirty: true, shouldValidate: true });
            }
        } else { // No facility found, or facility has no available functions defined
            setAvailableFunctionsForSelectedFacility([]);
            form.setValue('facilityFunctionContext', undefined, { shouldDirty: true, shouldValidate: true });
        }
        // Reset dependent fields as facility or its core function context might change
        // These resets should generally not trigger validation on their own unless they were previously dirty and had errors.
        form.setValue('stressLevel', undefined, { shouldDirty: true });
        form.setValue('routeId', undefined, { shouldDirty: true });
        form.setValue('subclusterId', undefined, { shouldDirty: true });
        
        // If stressLevel was already dirty (e.g. user interacted with it), explicit re-validation might be needed
        // if (form.formState.dirtyFields.stressLevel) form.trigger('stressLevel');
        // It's often better to let Zod's superRefine handle dependent field validation on submit or blur.

    } else { // No facility ID selected (e.g., Ops user cleared selection, or initial state for Ops)
        setSelectedFacility(undefined);
        setAvailableFunctionsForSelectedFacility([]);
        // form.setValue('facilityId', ''); // RHF handles this field directly if it's a controlled input
        form.setValue('facilityFunctionContext', undefined, { shouldDirty: true, shouldValidate: true });
        form.setValue('stressLevel', undefined, { shouldDirty: true });
        form.setValue('routeId', undefined, { shouldDirty: true });
        form.setValue('subclusterId', undefined, { shouldDirty: true });
    }
}, [watchedFacilityId, getFacilityById, form]);


  // Effect for when facilityFunctionContext changes
  useEffect(() => {
    if (watchedFacilityFunctionContext) {
      const stressOptions = STRESS_LEVELS_MAP[watchedFacilityFunctionContext];
      if (stressOptions && stressOptions.length === 1) {
        // Auto-populate if current stressLevel is not already this single option, or if it's undefined
        if (form.getValues('stressLevel') !== stressOptions[0].value) {
          form.setValue('stressLevel', stressOptions[0].value, {shouldValidate: true, shouldDirty: true});
        }
      } else {
         // If not auto-populating or options change, reset stressLevel if previous one is no longer valid
        const currentStressLevel = form.getValues('stressLevel');
        if (currentStressLevel && stressOptions && !stressOptions.find(opt => opt.value === currentStressLevel)) {
            form.setValue('stressLevel', undefined, {shouldValidate: true, shouldDirty: true});
        } else if (!watchedFacilityFunctionContext && currentStressLevel){ // If function context is cleared, clear stress level
            form.setValue('stressLevel', undefined, {shouldValidate: true, shouldDirty: true});
        }
      }
    } else { // No facilityFunctionContext
      form.setValue('stressLevel', undefined, {shouldValidate: true, shouldDirty: true}); 
    }
    // Reset route/subcluster when function context changes as stress level might change which dictates their visibility/requirement
    form.setValue('routeId', undefined, {shouldDirty: true}); 
    form.setValue('subclusterId', undefined, {shouldDirty: true});
    
    // Explicitly trigger validation for related fields if they were touched by the user
    if (form.formState.dirtyFields.facilityFunctionContext) form.trigger('facilityFunctionContext');
    if (form.formState.dirtyFields.stressLevel || !watchedFacilityFunctionContext) form.trigger('stressLevel');


  }, [watchedFacilityFunctionContext, form]);


  useEffect(() => {
    const stressLevelValue = watchedStressLevel as string | undefined;
    const needsRoute = stressLevelValue && stressLevelValue.toLowerCase().includes('route');
    const needsSubcluster = stressLevelValue && stressLevelValue.toLowerCase().includes('subcluster');

    if (!needsRoute && form.getValues('routeId')) {
      form.setValue('routeId', undefined);
      if(form.formState.dirtyFields.routeId) form.clearErrors('routeId');
    }
    if (!needsSubcluster && form.getValues('subclusterId')) {
      form.setValue('subclusterId', undefined);
      if(form.formState.dirtyFields.subclusterId) form.clearErrors('subclusterId');
    }
  }, [watchedStressLevel, form]);

  useEffect(() => {
    if (watchedExtensionDays > maxExtensionDays) {
      form.setError('extensionDays', {
        type: 'manual',
        message: `Extension days cannot exceed the admin-set limit of ${maxExtensionDays}.`
      });
    } else if (form.formState.errors.extensionDays?.type === 'manual' && watchedExtensionDays <= maxExtensionDays) {
      form.clearErrors('extensionDays');
    }
  }, [watchedExtensionDays, maxExtensionDays, form]);


  const handleFacilityChange = (facilityId: string) => {
    form.setValue('facilityId', facilityId, { shouldValidate: true, shouldDirty: true }); 
    // Other logic is handled by the useEffect watching watchedFacilityId
  };

  const handleStressLevelChange = (stressLevel: StressLevel | undefined) => {
    form.setValue('stressLevel', stressLevel, {shouldValidate: true, shouldDirty: true});
    // Logic for clearing route/subclusterId is now in its own useEffect watching watchedStressLevel
  };


  const onSubmit = async (data: StressRequestFormData) => {
    if (!currentUser || !selectedFacility || !data.facilityFunctionContext) { 
      toast({ title: "Error", description: "User, facility, or facility function not found.", variant: "destructive" });
      return;
    }
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
        facilityFunctionContext: data.facilityFunctionContext, 
        stressLevel: data.stressLevel,
        routeId: data.routeId,
        routeName: route?.name,
        subclusterId: data.subclusterId,
        subclusterName: subcluster?.name,
        startDate: data.startDate.toISOString(),
        extensionDays: data.extensionDays,
        reason: data.reason,
      };

      const newRequest = await addStressRequest(requestPayload);
      if (newRequest) {
        toast({ title: "Success", description: "Stress request submitted successfully." });
        const facilityHeadAssignedId = currentUser?.role === 'FacilityHead' && currentUser.assignedFacilityId ? currentUser.assignedFacilityId : '';
        
        form.reset({
            facilityId: facilityHeadAssignedId, // Keep FacilityHead's assigned facility
            facilityFunctionContext: undefined, // Will be auto-set by useEffect
            stressLevel: undefined, // Will be auto-set or cleared by useEffect
            routeId: undefined,
            subclusterId: undefined,
            startDate: undefined,
            extensionDays: 1,
            reason: "Space Stress",
        });
        
        // After reset, manually ensure selectedFacility and availableFunctions are correctly set for FacilityHead
        if (facilityHeadAssignedId) {
            const facility = getFacilityById(facilityHeadAssignedId);
            setSelectedFacility(facility); 
             if (facility && facility.availableFunctions) {
                setAvailableFunctionsForSelectedFacility(facility.availableFunctions);
                // The useEffect for watchedFacilityId will handle auto-setting facilityFunctionContext
            }
        } else {
            setSelectedFacility(undefined);
            setAvailableFunctionsForSelectedFacility([]);
        }

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
  
  const currentStressLevel = form.getValues('stressLevel') as string | undefined;


  return (
    <Card className="w-full shadow-lg">
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
                      onFacilityChange={handleFacilityChange}
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
              name="facilityFunctionContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating Facility Function</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === '' ? undefined : value)} // Ensure empty string is not passed
                    value={field.value ?? ''} // Ensure Select gets '' if field.value is undefined, if it expects that for placeholder
                    disabled={!selectedFacility || availableFunctionsForSelectedFacility.length <= 1}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select operating function..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableFunctionsForSelectedFacility.map(fn => (
                        <SelectItem key={fn} value={fn}>{fn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableFunctionsForSelectedFacility.length <=1 && selectedFacility &&
                    <FormDescription>Auto-selected based on facility's primary function.</FormDescription>
                  }
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="stressLevel"
              render={({ field }) => (
                <FormItem>
                  <StressLevelSelector
                    facilityFunction={watchedFacilityFunctionContext}
                    selectedStressLevel={field.value}
                    onStressLevelChange={(value) => handleStressLevelChange(value as StressLevel)} // casting here is okay as component expects StressLevel
                    disabled={!selectedFacility || !watchedFacilityFunctionContext}
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
                      onRouteChange={(value) => field.onChange(value === '' ? undefined : value)}
                      disabled={!selectedFacility || !currentStressLevel || !watchedFacilityFunctionContext}
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
                      onSubclusterChange={(value) => field.onChange(value === '' ? undefined : value)}
                      disabled={!selectedFacility || !currentStressLevel || !watchedFacilityFunctionContext}
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
                      max={maxExtensionDays}
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
                render={({field}) => (
                    <FormItem>
                        <ReasonSuggestion
                            reason={field.value || ''}
                            onReasonChange={field.onChange}
                            facilityFunction={watchedFacilityFunctionContext}
                            disabled={!watchedFacilityFunctionContext}
                        />
                        <FormMessage/>
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

