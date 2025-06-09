'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import FacilitySelector from './FacilitySelector';
import StressLevelSelector from './StressLevelSelector';
import ReasonSuggestion from './ReasonSuggestion';
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
  const { currentUser, facilities, addStressRequest, getFacilityById } = useAppContext();
  const { toast } = useToast();
  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StressRequestFormData>({
    resolver: zodResolver(StressRequestSchema),
    defaultValues: {
      facilityId: currentUser?.role === 'FacilityHead' && currentUser.assignedFacilityId ? currentUser.assignedFacilityId : '',
      stressLevel: undefined,
      startDate: undefined,
      extensionDays: 1,
      reason: '',
    },
  });

  useEffect(() => {
    if (currentUser?.role === 'FacilityHead' && currentUser.assignedFacilityId) {
      const facility = getFacilityById(currentUser.assignedFacilityId);
      setSelectedFacility(facility);
      if (facility) {
        form.setValue('facilityId', facility.id);
      }
    }
  }, [currentUser, getFacilityById, form]);

  const handleFacilityChange = (facilityId: string) => {
    const facility = getFacilityById(facilityId);
    setSelectedFacility(facility);
    form.setValue('facilityId', facilityId);
    form.setValue('stressLevel', undefined); // Reset stress level when facility changes
    form.clearErrors('stressLevel');
  };

  const onSubmit = async (data: StressRequestFormData) => {
    if (!currentUser || !selectedFacility) {
      toast({ title: "Error", description: "User or facility not found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const requestPayload = {
        facilityId: data.facilityId,
        facilityName: selectedFacility.name,
        facilityType: selectedFacility.type,
        stressLevel: data.stressLevel,
        startDate: data.startDate.toISOString(),
        extensionDays: data.extensionDays,
        reason: data.reason,
      };
      
      const newRequest = await addStressRequest(requestPayload);
      if (newRequest) {
        toast({ title: "Success", description: "Stress request submitted successfully." });
        form.reset({
            facilityId: currentUser?.role === 'FacilityHead' && currentUser.assignedFacilityId ? currentUser.assignedFacilityId : '',
            stressLevel: undefined,
            startDate: undefined,
            extensionDays: 1,
            reason: '',
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
  
  const facilityTypeForStressLevel = selectedFacility?.type;

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
                        field.onChange(facilityId);
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
                    facilityType={facilityTypeForStressLevel}
                    selectedStressLevel={field.value}
                    onStressLevelChange={field.onChange}
                    disabled={!selectedFacility}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Stress Marking Start Date D(S)</FormLabel>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
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
                    <Input type="number" placeholder="e.g., 7" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                   <ReasonSuggestion
                    reason={field.value || ''}
                    onReasonChange={field.onChange}
                    facilityType={selectedFacility?.type}
                  />
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
