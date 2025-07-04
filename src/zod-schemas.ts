
import { z } from 'zod';
import { FACILITY_FUNCTIONS, STRESS_LEVELS_MAP } from '@/lib/constants';
import type { FacilityFunction, StressLevel } from '@/lib/types';

// Helper to create a dynamic enum for stress levels based on facility function
const getStressLevelEnum = (facilityFunction?: FacilityFunction) => {
  if (!facilityFunction) return z.enum([''] as [string, ...string[]]).optional();
  const levels = STRESS_LEVELS_MAP[facilityFunction]?.map(sl => sl.value) as [StressLevel, ...StressLevel[]] | undefined;
  if (!levels || levels.length === 0) return z.enum([''] as [string, ...string[]]).optional();
  return z.enum(levels);
};


export const StressRequestSchema = z.object({
  facilityId: z.string().min(1, "Facility is required."),
  facilityFunctionContext: z.enum(FACILITY_FUNCTIONS, {
    required_error: "Operating facility function is required.",
    invalid_type_error: "Invalid facility function selected.",
  }),
  stressLevel: z.custom<StressLevel>((val): val is StressLevel => typeof val === 'string' && val.length > 0, "Stress level is required."),
  routeId: z.string().optional(),
  subclusterId: z.string().optional(),
  pincode: z.string().optional(), // Added pincode field
  startDate: z.date({ required_error: "Start date is required." })
    .min(new Date(new Date().setHours(0,0,0,0)), "Start date cannot be in the past."),
  extensionDays: z.coerce.number().min(1, "Extension days must be at least 1."),
  reason: z.enum(["Space Stress", "Manpower Stress"], {
    required_error: "Stress reason is required.",
    invalid_type_error: "Stress reason is required."
  }).or(z.string().min(1, "Stress reason is required when AI suggested.")), // Allow AI suggested reasons
}).superRefine((data, ctx) => {
    const selectedFunctionLevels = data.facilityFunctionContext ? STRESS_LEVELS_MAP[data.facilityFunctionContext] : [];
    const availableStressLevelsForFunction = selectedFunctionLevels.map(opt => opt.value);

    if (!availableStressLevelsForFunction.includes(data.stressLevel)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid stress level for selected facility function. Available: ${availableStressLevelsForFunction.join(', ')}`,
            path: ['stressLevel'],
        });
    }

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
    if (data.stressLevel === 'Pincode' && (!data.pincode || data.pincode.trim() === '')) { // Added pincode validation
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pincode is required when stress level is 'Pincode'.",
        path: ['pincode'],
      });
    }
});

export type StressRequestFormData = z.infer<typeof StressRequestSchema>;

export const AdminApprovalSchema = z.object({
  adminComments: z.string().optional(),
});

export type AdminApprovalFormData = z.infer<typeof AdminApprovalSchema>;

export const AdminSettingsSchema = z.object({
  maxExtensionDays: z.coerce.number().min(1, "Max extension days must be at least 1.").max(365, "Max extension days cannot exceed 365."),
});

export type AdminSettingsFormData = z.infer<typeof AdminSettingsSchema>;
