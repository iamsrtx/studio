
export type UserRole = 'Ops' | 'FacilityHead' | 'Administrator';

export type ShipmentLeg = 'Seller Side' | 'Buyer Side' | 'RTO' | 'Reverse';

export type FacilityType = 'FM Pickup' | 'LM Delivery' | 'RTO/DTO' | 'RVP Facility';

export type StressLevelFmPickup = 'Route' | 'Subcluster' | 'Pincode';
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

export interface Route {
  id: string;
  name: string;
  // facilityType?: FacilityType; // Could be used for filtering if routes are type-specific
}

export interface Subcluster {
  id: string;
  name: string;
  // facilityType?: FacilityType; // Could be used for filtering if subclusters are type-specific
}

export interface StressRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: FacilityType;
  stressLevel: StressLevel;
  routeId?: string;
  routeName?: string;
  subclusterId?: string;
  subclusterName?: string;
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

export interface Notification {
  id: string;
  userId: string; // The ID of the user this notification is for
  message: string;
  timestamp: string; // ISO string
  isRead: boolean;
  relatedRequestId?: string; // Optional ID of the stress request this notification pertains to
  link?: string; // Optional link for navigation
}
