
import type { User, Facility, StressRequest, FacilityFunction, Route, Subcluster, Notification } from './types';
import { FACILITY_FUNCTION_TO_SHIPMENT_LEG, FACILITY_FUNCTIONS } from './constants';

export const MOCK_USERS: User[] = [
  { id: 'user-ops-1', name: 'Subham', email: 'subham.ops@example.com', role: 'Ops' },
  { id: 'user-fh-fm', name: 'Parag', email: 'parag.fh@example.com', role: 'FacilityHead', assignedFacilityId: 'facility-1' },
  { id: 'user-fh-lm', name: 'Ankush', email: 'ankush.fh@example.com', role: 'FacilityHead', assignedFacilityId: 'facility-2' },
  { id: 'user-fh-rto', name: 'Priya', email: 'priya.fh@example.com', role: 'FacilityHead', assignedFacilityId: 'facility-3' },
  { id: 'user-fh-rvp', name: 'Mohan', email: 'mohan.fh@example.com', role: 'FacilityHead', assignedFacilityId: 'facility-4' },
  { id: 'user-admin-1', name: 'Raman', email: 'raman.admin@example.com', role: 'Administrator' },
];

export const MOCK_FACILITIES: Facility[] = [
  {
    id: 'facility-1',
    name: 'PNQ/KHR',
    type: 'FM Pickup', // Primary function
    availableFunctions: ['FM Pickup', 'RTO/DTO'], // Multi-functional
    shipmentLeg: FACILITY_FUNCTION_TO_SHIPMENT_LEG['FM Pickup'], // Primary shipment leg
    address: '123 North St, Anytown',
    assignedHeadId: 'user-fh-fm',
    pincodes: ['411018'], 
  },
  {
    id: 'facility-2',
    name: 'PNQ/CHK',
    type: 'LM Delivery',
    availableFunctions: ['LM Delivery'],
    shipmentLeg: FACILITY_FUNCTION_TO_SHIPMENT_LEG['LM Delivery'],
    address: '456 South Ave, Anytown',
    assignedHeadId: 'user-fh-lm',
    pincodes: ['411001', '411002', '411003', '411014'], 
  },
  {
    id: 'facility-3',
    name: 'DEL/PTD',
    type: 'RTO/DTO',
    availableFunctions: ['RTO/DTO'],
    shipmentLeg: FACILITY_FUNCTION_TO_SHIPMENT_LEG['RTO/DTO'],
    address: '789 East Rd, Anytown',
    assignedHeadId: 'user-fh-rto',
    pincodes: ['110001'], 
  },
  {
    id: 'facility-4',
    name: 'PNQ/Dummy',
    type: 'RVP Facility',
    availableFunctions: ['RVP Facility'],
    shipmentLeg: FACILITY_FUNCTION_TO_SHIPMENT_LEG['RVP Facility'],
    address: '101 West Ln, Anytown',
    assignedHeadId: 'user-fh-rvp',
    pincodes: ['411019', '411020'],
  },
  {
    id: 'facility-5',
    name: 'MUM/BHW',
    type: 'FM Pickup',
    availableFunctions: ['FM Pickup'],
    shipmentLeg: FACILITY_FUNCTION_TO_SHIPMENT_LEG['FM Pickup'],
    address: '202 Center Blvd, Anytown',
    pincodes: ['400001'],
  },
  {
    id: 'facility-6',
    name: 'PUN/WAK', 
    type: 'LM Delivery',
    availableFunctions: ['LM Delivery'],
    shipmentLeg: FACILITY_FUNCTION_TO_SHIPMENT_LEG['LM Delivery'],
    address: '777 Wakad Rd, Pune',
    pincodes: ['411057'], 
  },
];

export const MOCK_ROUTES: Route[] = [
  { id: 'route-fm-1', name: 'FM Route Alpha', type: 'Pickup' },
  { id: 'route-fm-2', name: 'FM Route Beta', type: 'Pickup' },
  { id: 'route-rto-1', name: 'RTO Route Gamma', type: 'Transfer' },
  { id: 'route-rto-2', name: 'RTO Route Delta', type: 'Transfer' },
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
    facilityName: 'PNQ/KHR',
    facilityFunctionContext: 'FM Pickup',
    stressLevel: 'Route',
    routeId: 'route-fm-1',
    routeName: 'FM Route Alpha',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    extensionDays: 5,
    reason: 'Space Stress',
    submittedByUserId: 'user-fh-fm',
    submittedByName: 'Parag',
    submissionDate: new Date().toISOString(),
    status: 'Pending',
  },
  {
    id: 'req-2',
    facilityId: 'facility-2',
    facilityName: 'PNQ/CHK',
    facilityFunctionContext: 'LM Delivery',
    stressLevel: 'Subcluster',
    subclusterId: 'sc-south',
    subclusterName: 'South Subcluster',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    extensionDays: 7,
    reason: 'Space Stress',
    submittedByUserId: 'user-ops-1',
    submittedByName: 'Subham',
    submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Approved',
    adminApproverId: 'user-admin-1',
    adminComments: 'Approved due to critical space issues.',
    approvalDate: new Date().toISOString(),
  },
    {
    id: 'req-3',
    facilityId: 'facility-3',
    facilityName: 'DEL/PTD',
    facilityFunctionContext: 'RTO/DTO',
    stressLevel: 'Facility',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    extensionDays: 3,
    reason: 'Manpower Stress',
    submittedByUserId: 'user-fh-rto',
    submittedByName: 'Priya',
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Rejected',
    adminApproverId: 'user-admin-1',
    adminComments: 'System outage resolved, stress marking not required.',
    approvalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-4',
    facilityId: 'facility-2',
    facilityName: 'PNQ/CHK',
    facilityFunctionContext: 'LM Delivery',
    stressLevel: 'Pincode',
    pincode: '411001',
    startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    extensionDays: 3,
    reason: 'High volume for specific pincode',
    submittedByUserId: 'user-ops-1',
    submittedByName: 'Subham',
    submissionDate: new Date().toISOString(),
    status: 'Pending',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [];

    