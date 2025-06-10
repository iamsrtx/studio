
import type { FacilityType, StressLevel, UserRole, StressLevelOption, ShipmentLeg } from './types';

export const USER_ROLES: UserRole[] = ['Ops', 'FacilityHead', 'Administrator'];

export const FACILITY_TYPES: FacilityType[] = ['FM Pickup', 'LM Delivery', 'RTO/DTO', 'RVP Facility'];

export const SHIPMENT_LEGS: ShipmentLeg[] = ['Seller Side', 'Buyer Side', 'RTO', 'Reverse'];

export const FACILITY_TYPE_TO_SHIPMENT_LEG: Record<FacilityType, ShipmentLeg> = {
  'FM Pickup': 'Seller Side',
  'LM Delivery': 'Buyer Side',
  'RTO/DTO': 'RTO',
  'RVP Facility': 'Reverse',
};

export const STRESS_LEVELS_MAP: Record<FacilityType, StressLevelOption[]> = {
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
