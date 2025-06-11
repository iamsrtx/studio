
export type UserRole = 'Ops' | 'FacilityHead' | 'Administrator';

export type ShipmentLeg = 'Seller Side' | 'Buyer Side' | 'RTO' | 'Reverse';

// Renamed from FacilityType
export type FacilityFunction = 'FM Pickup' | 'LM Delivery' | 'RTO/DTO' | 'RVP Facility';

export type StressLevelFmPickup = 'Route' | 'Subcluster' | 'Facility';
export type StressLevelLmDelivery = 'Subcluster' | 'Facility';
export type StressLevelRtoDto = 'Route' | 'Facility';
export type StressLevelRvpFacility = 'Facility';

export type StressLevel = StressLevelFmPickup | StressLevelLmDelivery | StressLevelRtoDto | StressLevelRvpFacility;

export interface Facility {
  id: string;
  name: string;
  type: FacilityFunction; // Primary or default function
  availableFunctions: FacilityFunction[]; // All functions this facility can perform
  shipmentLeg: ShipmentLeg; // This might need re-evaluation if functions have different legs
  address: string;
  assignedHeadId?: string;
  coLocatedWith?: string; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedFacilityId?: string; 
}

export interface Route {
  id: string;
  name: string;
  type: string; 
}

export interface Subcluster {
  id: string;
  name: string;
}

export interface StressRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityFunctionContext: FacilityFunction; // The function under which this stress request is made
  stressLevel: StressLevel;
  routeId?: string;
  routeName?: string;
  subclusterId?: string;
  subclusterName?: string;
  startDate: string; 
  extensionDays: number;
  reason?: string;
  submittedByUserId: string;
  submittedByName: string;
  submissionDate: string; 
  status: 'Pending' | 'Approved' | 'Rejected' | 'Merged';
  adminApproverId?: string;
  adminComments?: string;
  approvalDate?: string; 
}

export interface StressLevelOption {
  value: StressLevel;
  label: string;
}

export interface Notification {
  id: string;
  userId: string; 
  message: string;
  timestamp: string; 
  isRead: boolean;
  relatedRequestId?: string; 
  link?: string; 
}
