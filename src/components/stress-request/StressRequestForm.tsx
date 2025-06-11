
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
import type { Facility, FacilityFunction, StressLevel } from '@/lib/types'; // FacilityType -> FacilityFunction
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
      setSelectedFacility(facility);
      if (facility && facility.availableFunctions) {
        setAvailableFunctionsForSelectedFacility(facility.availableFunctions);
        if (facility.availableFunctions.length === 1) {
          form.setValue('facilityFunctionContext', facility.availableFunctions[0]);
        } else {
          form.setValue('facilityFunctionContext', undefined); // Reset if multiple options
        }
      } else {
        setAvailableFunctionsForSelectedFacility([]);
        form.setValue('facilityFunctionContext', undefined);
      }
      form.setValue('stressLevel', undefined); // Reset stress level on facility change
      form.setValue('routeId', undefined);
      form.setValue('subclusterId', undefined);
    } else {
      setSelectedFacility(undefined);
      setAvailableFunctionsForSelectedFacility([]);
      form.setValue('facilityFunctionContext', undefined);
      form.setValue('stressLevel', undefined);
    }
  }, [watchedFacilityId, getFacilityById, form]);


  // Effect for when facilityFunctionContext changes
  useEffect(() => {
    if (watchedFacilityFunctionContext) {
      const stressOptions = STRESS_LEVELS_MAP[watchedFacilityFunctionContext];
      if (stressOptions && stressOptions.length === 1) {
        if (form.getValues('stressLevel') !== stressOptions[0].value) {
          form.setValue('stressLevel', stressOptions[0].value);
        }
      } else {
         // If not auto-populating or options change, reset stressLevel if previous one is no longer valid
        const currentStressLevel = form.getValues('stressLevel');
        if (currentStressLevel && stressOptions && !stressOptions.find(opt => opt.value === currentStressLevel)) {
            form.setValue('stressLevel', undefined);
        }
      }
    } else {
      form.setValue('stressLevel', undefined); // Reset if no function context
    }
    // Reset route/subcluster when function context changes as stress level might change
    form.setValue('routeId', undefined); 
    form.setValue('subclusterId', undefined);
    if (form.formState.dirtyFields.facilityFunctionContext) form.trigger('facilityFunctionContext');
    if (form.formState.dirtyFields.stressLevel) form.trigger('stressLevel');

  }, [watchedFacilityFunctionContext, form]);


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
    form.setValue('facilityId', facilityId); 
    // Other logic is handled by the useEffect watching watchedFacilityId
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
    if (!currentUser || !selectedFacility || !data.facilityFunctionContext) { // Added facilityFunctionContext check
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
        facilityFunctionContext: data.facilityFunctionContext, // Submit chosen function
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
            facilityFunctionContext: undefined, // Will be auto-set by useEffect if applicable
            stressLevel: undefined,
            routeId: undefined,
            subclusterId: undefined,
            startDate: undefined,
            extensionDays: 1,
            reason: "Space Stress",
        });
        
        // Manually trigger side effects after reset if facility is pre-selected for FacilityHead
        if (facilityHeadAssignedId) {
            const facility = getFacilityById(facilityHeadAssignedId);
            setSelectedFacility(facility); // Ensure selectedFacility is updated
             if (facility && facility.availableFunctions) {
                setAvailableFunctionsForSelectedFacility(facility.availableFunctions);
                if (facility.availableFunctions.length === 1) {
                    form.setValue('facilityFunctionContext', facility.availableFunctions[0], { shouldValidate: true, shouldDirty: true });
                }
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
                    onValueChange={field.onChange} 
                    value={field.value}
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
                    <FormDescription>Auto-selected based on facility.</FormDescription>
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
                      onRouteChange={field.onChange}
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
                      onSubclusterChange={field.onChange}
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
