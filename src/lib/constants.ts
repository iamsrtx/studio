
import type { FacilityFunction, StressLevel, UserRole, StressLevelOption, ShipmentLeg } from './types';

export const USER_ROLES: UserRole[] = ['Ops', 'FacilityHead', 'Administrator'];

// Renamed from FACILITY_TYPES
export const FACILITY_FUNCTIONS: FacilityFunction[] = ['FM Pickup', 'LM Delivery', 'RTO/DTO', 'RVP Facility'];

export const SHIPMENT_LEGS: ShipmentLeg[] = ['Seller Side', 'Buyer Side', 'RTO', 'Reverse'];

// Renamed from FACILITY_TYPE_TO_SHIPMENT_LEG
export const FACILITY_FUNCTION_TO_SHIPMENT_LEG: Record<FacilityFunction, ShipmentLeg> = {
  'FM Pickup': 'Seller Side',
  'LM Delivery': 'Buyer Side',
  'RTO/DTO': 'RTO',
  'RVP Facility': 'Reverse',
};

// Keys are now FacilityFunction
export const STRESS_LEVELS_MAP: Record<FacilityFunction, StressLevelOption[]> = {
  'FM Pickup': [
    { value: 'Facility', label: 'Facility' },
    { value: 'Route', label: 'Route' },
  ],
  'LM Delivery': [
    { value: 'Facility', label: 'Facility' },
    { value: 'Subcluster', label: 'Subcluster' },
  ],
  'RTO/DTO': [
    { value: 'Facility', label: 'Facility' },
    { value: 'Route', label: 'Route' },
  ],
  'RVP Facility': [
    { value: 'Facility', label: 'Facility' },
  ],
};

export const APP_NAME = "XB Stress Facility Manager";
