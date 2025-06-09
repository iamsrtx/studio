
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { AdminSettingsSchema, type AdminSettingsFormData } from '@/zod-schemas';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const { currentRole, maxExtensionDays, setMaxExtensionDays } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (currentRole !== 'Administrator') {
      router.replace('/dashboard');
    }
  }, [currentRole, router]);

  const form = useForm<AdminSettingsFormData>({
    resolver: zodResolver(AdminSettingsSchema),
    defaultValues: {
      maxExtensionDays: maxExtensionDays,
    },
  });

  // Sync form default value if context maxExtensionDays changes (e.g. from localStorage initial load)
  useEffect(() => {
    form.reset({ maxExtensionDays });
  }, [maxExtensionDays, form]);


  const onSubmit = (data: AdminSettingsFormData) => {
    try {
      setMaxExtensionDays(data.maxExtensionDays);
      toast({
        title: 'Settings Saved',
        description: `Maximum extension days set to ${data.maxExtensionDays}.`,
      });
    } catch (error) {
        toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    }
  };

  if (currentRole !== 'Administrator') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Application Settings</CardTitle>
        <CardDescription>Manage application-wide settings for stress requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="maxExtensionDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Extension Days</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 30" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                      className="h-10"
                    />
                  </FormControl>
                  <FormDescription>
                    Set the maximum number of days a stress marking can be extended. (Min: 1, Max: 365)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-12" disabled={form.formState.isSubmitting || !form.formState.isValid}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
