
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
// Stress Level options reordered: Route, Subcluster, Pincode, Facility
export const STRESS_LEVELS_MAP: Record<FacilityFunction, StressLevelOption[]> = {
  'FM Pickup': [
    { value: 'Route', label: 'Route' },
    { value: 'Pincode', label: 'Pincode' },
    { value: 'Facility', label: 'Facility' },
  ],
  'LM Delivery': [
    { value: 'Subcluster', label: 'Subcluster' },
    { value: 'Pincode', label: 'Pincode' },
    { value: 'Facility', label: 'Facility' },
  ],
  'RTO/DTO': [
    { value: 'Route', label: 'Route' },
    { value: 'Pincode', label: 'Pincode' },
    { value: 'Facility', label: 'Facility' },
  ],
  'RVP Facility': [
    { value: 'Pincode', label: 'Pincode' },
    { value: 'Facility', label: 'Facility' },
  ],
};

export const APP_NAME = "XB Stress Facility Manager";
