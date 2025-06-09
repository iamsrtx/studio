
import type { User, Facility, StressRequest, FacilityType, Route, Subcluster } from './types';
import { FACILITY_TYPE_TO_SHIPMENT_LEG } from './constants';

export const MOCK_USERS: User[] = [
  { id: 'user-ops-1', name: 'Sam Operations', email: 'sam.ops@example.com', role: 'Ops' },
  { id: 'user-fh-1', name: 'Alex FacilityHead', email: 'alex.fh@example.com', role: 'FacilityHead', assignedFacilityId: 'facility-1' },
  { id: 'user-fh-2', name: 'Jordan FacilityHead', email: 'jordan.fh@example.com', role: 'FacilityHead', assignedFacilityId: 'facility-3' },
  { id: 'user-admin-1', name: 'Casey Administrator', email: 'casey.admin@example.com', role: 'Administrator' },
];

export const MOCK_FACILITIES: Facility[] = [
  { id: 'facility-1', name: 'North Hub - FM Pickup', type: 'FM Pickup', shipmentLeg: FACILITY_TYPE_TO_SHIPMENT_LEG['FM Pickup'], address: '123 North St, Anytown', assignedHeadId: 'user-fh-1' },
  { id: 'facility-2', name: 'South Hub - LM Delivery', type: 'LM Delivery', shipmentLeg: FACILITY_TYPE_TO_SHIPMENT_LEG['LM Delivery'], address: '456 South Ave, Anytown' },
  { id: 'facility-3', name: 'East Wing - RTO/DTO', type: 'RTO/DTO', shipmentLeg: FACILITY_TYPE_TO_SHIPMENT_LEG['RTO/DTO'], address: '789 East Rd, Anytown', assignedHeadId: 'user-fh-2' },
  { id: 'facility-4', name: 'West End - RVP Facility', type: 'RVP Facility', shipmentLeg: FACILITY_TYPE_TO_SHIPMENT_LEG['RVP Facility'], address: '101 West Ln, Anytown' },
  { id: 'facility-5', name: 'Central Depot - FM Pickup', type: 'FM Pickup', shipmentLeg: FACILITY_TYPE_TO_SHIPMENT_LEG['FM Pickup'], address: '202 Center Blvd, Anytown' },
];

export const MOCK_ROUTES: Route[] = [
  { id: 'route-fm-1', name: 'FM Route Alpha' },
  { id: 'route-fm-2', name: 'FM Route Beta' },
  { id: 'route-rto-1', name: 'RTO Route Gamma' },
  { id: 'route-rto-2', name: 'RTO Route Delta' },
];

export const MOCK_SUBCLUSTERS: Subcluster[] = [
  { id: 'sc-central', name: 'Central Subcluster' },
  { id: 'sc-north', name: 'North Subcluster' },
  { id: 'sc-south', name: 'South Subcluster' },
  { id: 'sc-east', name: 'East Subcluster' },
  { id: 'sc-west', name: 'West Subcluster' },
];

export const MOCK_STRESS_REQUESTS: StressRequest[] = [
  {
    id: 'req-1',
    facilityId: 'facility-1',
    facilityName: 'North Hub - FM Pickup',
    facilityType: 'FM Pickup',
    stressLevel: 'Route',
    routeId: 'route-fm-1',
    routeName: 'FM Route Alpha',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    extensionDays: 5,
    reason: 'High volume due to peak season.',
    submittedByUserId: 'user-fh-1',
    submittedByName: 'Alex FacilityHead',
    submissionDate: new Date().toISOString(),
    status: 'Pending',
  },
  {
    id: 'req-2',
    facilityId: 'facility-2',
    facilityName: 'South Hub - LM Delivery',
    facilityType: 'LM Delivery',
    stressLevel: 'Subcluster',
    subclusterId: 'sc-south',
    subclusterName: 'South Subcluster',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    extensionDays: 7,
    reason: 'Manpower shortage.',
    submittedByUserId: 'user-ops-1',
    submittedByName: 'Sam Operations',
    submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'Approved',
    adminApproverId: 'user-admin-1',
    adminComments: 'Approved due to critical manpower issues.',
    approvalDate: new Date().toISOString(),
  },
    {
    id: 'req-3',
    facilityId: 'facility-3',
    facilityName: 'East Wing - RTO/DTO',
    facilityType: 'RTO/DTO',
    stressLevel: 'Pincode', // No route/subcluster for Pincode
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    extensionDays: 3,
    reason: 'System outage affecting processing.',
    submittedByUserId: 'user-fh-2',
    submittedByName: 'Jordan FacilityHead',
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Rejected',
    adminApproverId: 'user-admin-1',
    adminComments: 'System outage resolved, stress marking not required.',
    approvalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
