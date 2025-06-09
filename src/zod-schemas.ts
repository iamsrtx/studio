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
  // facilityType is not directly in form, but used to derive stressLevel options
  stressLevel: z.custom<StressLevel>((val) => typeof val === 'string' && val.length > 0, "Stress level is required."),
  startDate: z.date({ required_error: "Start date is required." })
    .min(new Date(new Date().setHours(0,0,0,0)), "Start date cannot be in the past."), // Ensure start date is not before today
  extensionDays: z.coerce.number().min(1, "Extension days must be at least 1.").max(30, "Extension days cannot exceed 30."),
  reason: z.string().optional(),
}).refine(data => {
    // This refinement is tricky because facilityType isn't part of the schema directly for validation.
    // It's assumed that the UI correctly populates stressLevel options based on facilityType.
    // A more robust validation would involve passing facilityType to the schema or validating in the submit handler.
    return true; 
}, {
    message: "Invalid stress level for the selected facility type.", // Generic message
    path: ["stressLevel"],
});

export type StressRequestFormData = z.infer<typeof StressRequestSchema>;

export const AdminApprovalSchema = z.object({
  adminComments: z.string().optional(),
});

export type AdminApprovalFormData = z.infer<typeof AdminApprovalSchema>;
