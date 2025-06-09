export type UserRole = 'Ops' | 'FacilityHead' | 'Administrator';

export type ShipmentLeg = 'Seller Side' | 'Buyer Side' | 'RTO' | 'Reverse';

export type FacilityType = 'FM Pickup' | 'LM Delivery' | 'RTO/DTO' | 'RVP Facility';

export type StressLevelFmPickup = 'Route' | 'Subcluster';
export type StressLevelLmDelivery = 'Subcluster' | 'Pincode';
export type StressLevelRtoDto = 'Route' | 'Pincode';
export type StressLevelRvpFacility = 'Pincode';

export type StressLevel = StressLevelFmPickup | StressLevelLmDelivery | StressLevelRtoDto | StressLevelRvpFacility;

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  shipmentLeg: ShipmentLeg;
  address: string;
  assignedHeadId?: string; 
  coLocatedWith?: string; // ID of another facility if co-located
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedFacilityId?: string; // For FacilityHead
}

export interface StressRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: FacilityType;
  stressLevel: StressLevel;
  startDate: string; // ISO string
  extensionDays: number;
  reason?: string;
  submittedByUserId: string;
  submittedByName: string;
  submissionDate: string; // ISO string
  status: 'Pending' | 'Approved' | 'Rejected';
  adminApproverId?: string;
  adminComments?: string;
  approvalDate?: string; // ISO string
}

export interface StressLevelOption {
  value: StressLevel;
  label: string;
}
