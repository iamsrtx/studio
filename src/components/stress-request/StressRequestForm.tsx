
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


// Effect for when facilityId changes (user selects a facility or form initializes for FacilityHead)
useEffect(() => {
    const facility = watchedFacilityId ? getFacilityById(watchedFacilityId) : undefined;
    setSelectedFacility(facility); // Update local UI state for displaying facility info

    const newAvailableFunctions = facility?.availableFunctions || [];
    setAvailableFunctionsForSelectedFacility(newAvailableFunctions); // Update local UI state for function dropdown

    let determinedFacilityFunction: FacilityFunction | undefined = undefined;
    if (facility && newAvailableFunctions.length === 1) {
        const singleFunctionCandidate = newAvailableFunctions[0];
        // Ensure the single function is a valid one before auto-selecting
        if (FACILITY_FUNCTIONS.includes(singleFunctionCandidate as FacilityFunction)) {
            determinedFacilityFunction = singleFunctionCandidate;
        }
    }

    // Set the facilityFunctionContext in the form.
    // react-hook-form's setValue will only trigger a re-render if the value actually changes.
    form.setValue('facilityFunctionContext', determinedFacilityFunction, { shouldDirty: true });

    // Always reset stressLevel when the facility (and thus potentially its function context strategy) changes.
    // The subsequent useEffect for watchedFacilityFunctionContext will handle
    // potentially auto-selecting a stressLevel if applicable based on the new context.
    // shouldValidate: true helps clear any previous validation messages on stressLevel.
    form.setValue('stressLevel', undefined, { shouldDirty: true, shouldValidate: true });

    // routeId and subclusterId are reset by the useEffect watching facilityFunctionContext/stressLevel.

}, [watchedFacilityId, getFacilityById, form]);


  // Effect for when facilityFunctionContext changes
  useEffect(() => {
    if (watchedFacilityFunctionContext) {
      const stressOptions = STRESS_LEVELS_MAP[watchedFacilityFunctionContext];
      if (stressOptions && stressOptions.length === 1) {
        if (form.getValues('stressLevel') !== stressOptions[0].value) {
          form.setValue('stressLevel', stressOptions[0].value, {shouldValidate: true, shouldDirty: true});
        }
      } else {
        const currentStressLevel = form.getValues('stressLevel');
        if (currentStressLevel && stressOptions && !stressOptions.find(opt => opt.value === currentStressLevel)) {
            form.setValue('stressLevel', undefined, {shouldValidate: true, shouldDirty: true});
        } else if (!watchedFacilityFunctionContext && currentStressLevel){
            form.setValue('stressLevel', undefined, {shouldValidate: true, shouldDirty: true});
        }
      }
    } else {
      form.setValue('stressLevel', undefined, {shouldValidate: true, shouldDirty: true});
    }
    form.setValue('routeId', undefined, {shouldDirty: true});
    form.setValue('subclusterId', undefined, {shouldDirty: true});

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
  };

  const handleStressLevelChange = (stressLevel: StressLevel | undefined) => {
    form.setValue('stressLevel', stressLevel, {shouldValidate: true, shouldDirty: true});
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
            facilityId: facilityHeadAssignedId,
            facilityFunctionContext: undefined,
            stressLevel: undefined,
            routeId: undefined,
            subclusterId: undefined,
            startDate: undefined,
            extensionDays: 1,
            reason: "Space Stress",
        });

        // After reset, selectedFacility and availableFunctionsForSelectedFacility might need to be re-established
        // for FacilityHeads, as form.reset doesn't trigger the watchedFacilityId effect directly in the same cycle
        // if facilityId value hasn't changed. However, the watchedFacilityId effect *should* run if facilityId
        // in defaultValues is different from what it was, or on next render due to state change.
        // Forcing re-evaluation:
        if (facilityHeadAssignedId) {
            const facility = getFacilityById(facilityHeadAssignedId);
            setSelectedFacility(facility);
             if (facility && facility.availableFunctions) {
                setAvailableFunctionsForSelectedFacility(facility.availableFunctions);
                // The watchedFacilityId useEffect will handle setting facilityFunctionContext
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
                <Input value={selectedFacility.name} disabled className="h-10" />
              </div>
            )}

            <FormField
              control={form.control}
              name="facilityFunctionContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating Facility Function</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (FACILITY_FUNCTIONS.includes(value as FacilityFunction)) {
                        field.onChange(value as FacilityFunction);
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                    value={field.value ?? ''}
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
                    <FormDescription>Auto-selected based on facility's function(s).</FormDescription>
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
                    onStressLevelChange={(value) => handleStressLevelChange(value as StressLevel)}
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

