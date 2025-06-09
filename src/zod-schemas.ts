
import { z } from 'zod';
import { FACILITY_TYPES, STRESS_LEVELS_MAP } from '@/lib/constants';
import type { FacilityType, StressLevel } from '@/lib/types';

// Helper to create a dynamic enum for stress levels based on facility type
const getStressLevelEnum = (facilityType?: FacilityType) => {
  if (!facilityType) return z.enum([''] as [string, ...string[]]).optional(); // Fallback for undefined facilityType
  const levels = STRESS_LEVELS_MAP[facilityType].map(sl => sl.value) as [StressLevel, ...StressLevel[]];
  if (levels.length === 0) return z.enum([''] as [string, ...string[]]).optional(); // Should not happen if STRESS_LEVELS_MAP is correct
  return z.enum(levels);
};


export const StressRequestSchema = z.object({
  facilityId: z.string().min(1, "Facility is required."),
  stressLevel: z.custom<StressLevel>((val): val is StressLevel => typeof val === 'string' && val.length > 0, "Stress level is required."),
  routeId: z.string().optional(),
  subclusterId: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required." })
    .min(new Date(new Date().setHours(0,0,0,0)), "Start date cannot be in the past."),
  extensionDays: z.coerce.number().min(1, "Extension days must be at least 1.").max(30, "Extension days cannot exceed 30."),
  reason: z.string().optional(),
}).superRefine((data, ctx) => {
    // Check if stressLevel is 'Route' or 'Subcluster' and if the respective ID is provided.
    // Note: The STRESS_LEVELS_MAP helps UI filter these, but this ensures data integrity.
    if (data.stressLevel.toLowerCase().includes('route') && !data.routeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Route is required when stress level is 'Route'.",
        path: ['routeId'],
      });
    }
    if (data.stressLevel.toLowerCase().includes('subcluster') && !data.subclusterId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Subcluster is required when stress level is 'Subcluster'.",
        path: ['subclusterId'],
      });
    }
});

export type StressRequestFormData = z.infer<typeof StressRequestSchema>;

export const AdminApprovalSchema = z.object({
  adminComments: z.string().optional(),
});

export type AdminApprovalFormData = z.infer<typeof AdminApprovalSchema>;
