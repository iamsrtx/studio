
'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Facility, StressRequest, UserRole, FacilityType, Route, Subcluster, Notification } from '@/lib/types';
import { MOCK_USERS, MOCK_FACILITIES, MOCK_STRESS_REQUESTS, MOCK_ROUTES, MOCK_SUBCLUSTERS, MOCK_NOTIFICATIONS } from '@/lib/data';
import { suggestStressReason as suggestStressReasonFlow } from '@/ai/flows/suggest-stress-reason';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  facilities: Facility[];
  routes: Route[];
  subclusters: Subcluster[];
  stressRequests: StressRequest[];
  maxExtensionDays: number;
  notifications: Notification[];
  login: (userId: string) => void;
  logout: () => void;
  addStressRequest: (requestData: Omit<StressRequest, 'id' | 'submissionDate' | 'status' | 'submittedByUserId' | 'submittedByName'>) => Promise<StressRequest | null>;
  updateStressRequestStatus: (requestId: string, status: 'Approved' | 'Rejected', adminComments?: string) => Promise<void>;
  isLoadingAiReason: boolean;
  fetchAiReason: (facilityType: FacilityType) => Promise<string>;
  getFacilityById: (id: string) => Facility | undefined;
  getUserById: (id: string) => User | undefined;
  getRouteById: (id: string) => Route | undefined;
  getSubclusterById: (id: string) => Subcluster | undefined;
  setMaxExtensionDays: (days: number) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllCurrentUserNotificationsAsRead: () => void;
  getUnreadNotificationsCount: () => number;
  getCurrentUserNotifications: (limit?: number) => Notification[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [subclusters, setSubclusters] = useState<Subcluster[]>(MOCK_SUBCLUSTERS);
  const [stressRequests, setStressRequests] = useState<StressRequest[]>(MOCK_STRESS_REQUESTS);
  const [isLoadingAiReason, setIsLoadingAiReason] = useState(false);
  const [maxExtensionDays, setMaxExtensionDaysState] = useState<number>(30);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('stressless-userId');
    if (storedUserId) {
      const user = MOCK_USERS.find(u => u.id === storedUserId);
      if (user) {
        setCurrentUser(user);
        setCurrentRole(user.role);
      }
    }
    const storedMaxDays = localStorage.getItem('stressless-maxExtensionDays');
    if (storedMaxDays) {
        setMaxExtensionDaysState(parseInt(storedMaxDays, 10));
    }
    const storedNotifications = localStorage.getItem('stressless-notifications');
    if (storedNotifications) {
        try {
            setNotifications(JSON.parse(storedNotifications));
        } catch (e) {
            console.error("Error parsing notifications from localStorage", e);
            setNotifications(MOCK_NOTIFICATIONS); 
        }
    }

  }, []);

  useEffect(() => {
    localStorage.setItem('stressless-notifications', JSON.stringify(notifications));
  }, [notifications]);


  const login = useCallback((userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role);
      localStorage.setItem('stressless-userId', userId);
      router.push('/dashboard');
    } else {
      console.error("User not found for login");
    }
  }, [router]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentRole(null);
    localStorage.removeItem('stressless-userId');
    router.push('/login');
  }, [router]);

  const internalAddNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const addStressRequest = async (requestData: Omit<StressRequest, 'id' | 'submissionDate' | 'status' | 'submittedByUserId' | 'submittedByName'>): Promise<StressRequest | null> => {
    if (!currentUser) {
      console.error("No user logged in to submit request");
      return null;
    }
    const newRequest: StressRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      submissionDate: new Date().toISOString(),
      status: 'Pending',
      submittedByUserId: currentUser.id,
      submittedByName: currentUser.name,
    };
    setStressRequests(prev => [newRequest, ...prev]);

    MOCK_USERS.filter(user => user.role === 'Administrator').forEach(admin => {
      internalAddNotification({
        userId: admin.id,
        message: `New stress request for ${newRequest.facilityName} needs approval.`,
        relatedRequestId: newRequest.id,
        isRead: false,
        link: `/dashboard/admin/approvals` 
      });
    });
    return newRequest;
  };

  const updateStressRequestStatus = async (requestId: string, status: 'Approved' | 'Rejected', adminCommentsInput?: string) => {
    if (!currentUser || currentUser.role !== 'Administrator') {
      console.error("Unauthorized or no admin logged in");
      return;
    }

    let requestToApprove = stressRequests.find(req => req.id === requestId);
    if (!requestToApprove) {
      console.error("Request to update/approve not found");
      return;
    }
    
    let finalUpdatedRequestForNotification: StressRequest | undefined;

    if (status === 'Approved') {
      const existingActiveRequest = stressRequests.find(req => {
        if (req.id === requestId || req.status !== 'Approved') return false;
        if (req.facilityId !== requestToApprove!.facilityId) return false;

        const toApproveStressLevel = requestToApprove!.stressLevel.toLowerCase();
        const existingReqStressLevel = req.stressLevel.toLowerCase();

        if (toApproveStressLevel.includes('route')) {
          if (!existingReqStressLevel.includes('route') || req.routeId !== requestToApprove!.routeId) return false;
        } else if (toApproveStressLevel.includes('subcluster')) {
          if (!existingReqStressLevel.includes('subcluster') || req.subclusterId !== requestToApprove!.subclusterId) return false;
        } else { // Pincode level for requestToApprove
          if (existingReqStressLevel.includes('route') || existingReqStressLevel.includes('subcluster')) return false;
        }

        const reqStartDate = new Date(req.startDate);
        const reqEndDate = new Date(reqStartDate);
        reqEndDate.setDate(reqStartDate.getDate() + req.extensionDays);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return reqEndDate >= today;
      });

      if (existingActiveRequest) {
        const currentAdminApproverId = currentUser.id;
        const currentApprovalDate = new Date().toISOString();

        const existingOrigStartDate = new Date(existingActiveRequest.startDate);
        const existingOrigEndDate = new Date(existingOrigStartDate);
        existingOrigEndDate.setDate(existingOrigStartDate.getDate() + existingActiveRequest.extensionDays);

        const newReqStartDate = new Date(requestToApprove.startDate);
        const newReqEndDate = new Date(newReqStartDate);
        newReqEndDate.setDate(newReqStartDate.getDate() + requestToApprove.extensionDays);

        const finalStartDate = existingOrigStartDate < newReqStartDate ? existingOrigStartDate : newReqStartDate;
        const finalEndDate = existingOrigEndDate > newReqEndDate ? existingOrigEndDate : newReqEndDate;
        
        const timeDiff = finalEndDate.getTime() - finalStartDate.getTime();
        const totalNewExtensionDays = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

        const commentForExisting = `Extended/Updated on ${format(new Date(currentApprovalDate), 'PPP')} by ${currentUser.name} (merging request ${requestToApprove.id}). Admin note: ${adminCommentsInput || '-'}.`;
        const updatedExistingRequest = {
          ...existingActiveRequest,
          startDate: finalStartDate.toISOString(),
          extensionDays: totalNewExtensionDays,
          adminComments: existingActiveRequest.adminComments ? `${existingActiveRequest.adminComments}; ${commentForExisting}` : commentForExisting,
          adminApproverId: currentAdminApproverId,
          approvalDate: currentApprovalDate,
        };
        
        const mergedRequest = {
            ...requestToApprove,
            status: 'Merged' as 'Merged',
            adminComments: `Request approved; its period was merged into existing stress marking ${existingActiveRequest.id}. Admin comment for this action: ${adminCommentsInput || 'None'}`.trim(),
            adminApproverId: currentAdminApproverId,
            approvalDate: currentApprovalDate,
        };
        finalUpdatedRequestForNotification = mergedRequest;

        setStressRequests(prev =>
          prev.map(r => {
            if (r.id === existingActiveRequest.id) return updatedExistingRequest;
            if (r.id === requestId) return mergedRequest;
            return r;
          })
        );

        if (existingActiveRequest.submittedByUserId !== requestToApprove.submittedByUserId) {
             internalAddNotification({
                userId: existingActiveRequest.submittedByUserId,
                message: `The stress period for ${existingActiveRequest.facilityName} (ID: ${existingActiveRequest.id}) has been updated. New end date: ${format(finalEndDate, 'PPP')}.`,
                relatedRequestId: existingActiveRequest.id,
                isRead: false,
                link: `/dashboard/requests`
            });
        }
         internalAddNotification({
            userId: requestToApprove.submittedByUserId,
            message: `Your stress request for ${requestToApprove.facilityName} was approved and merged. Facility stressed until ${format(finalEndDate, 'PPP')}.`,
            relatedRequestId: requestToApprove.id,
            isRead: false,
            link: `/dashboard/requests`
        });

      } else {
        // No existing active request, proceed with normal approval
        setStressRequests(prev =>
          prev.map(req => {
            if (req.id === requestId) {
              finalUpdatedRequestForNotification = { ...req, status, adminComments: adminCommentsInput, adminApproverId: currentUser.id, approvalDate: new Date().toISOString() };
              return finalUpdatedRequestForNotification;
            }
            return req;
          })
        );
         if (finalUpdatedRequestForNotification) {
            internalAddNotification({
                userId: finalUpdatedRequestForNotification.submittedByUserId,
                message: `Your stress request for ${finalUpdatedRequestForNotification.facilityName} has been ${status}.`,
                relatedRequestId: finalUpdatedRequestForNotification.id,
                isRead: false,
                link: `/dashboard/requests`
            });
        }
      }
    } else { // For 'Rejected' status
      setStressRequests(prev =>
        prev.map(req => {
          if (req.id === requestId) {
            finalUpdatedRequestForNotification = { ...req, status, adminComments: adminCommentsInput, adminApproverId: currentUser.id, approvalDate: new Date().toISOString() };
            return finalUpdatedRequestForNotification;
          }
          return req;
        })
      );
       if (finalUpdatedRequestForNotification) {
         internalAddNotification({
            userId: finalUpdatedRequestForNotification.submittedByUserId,
            message: `Your stress request for ${finalUpdatedRequestForNotification.facilityName} has been ${status}.`,
            relatedRequestId: finalUpdatedRequestForNotification.id,
            isRead: false,
            link: `/dashboard/requests`
        });
      }
    }
  };
  
  const fetchAiReason = async (facilityType: FacilityType): Promise<string> => {
    setIsLoadingAiReason(true);
    try {
      const result = await suggestStressReasonFlow({ facilityType });
      return result.reason;
    } catch (error) {
      console.error("Error fetching AI reason:", error);
      return "Could not fetch suggestion at this time.";
    } finally {
      setIsLoadingAiReason(false);
    }
  };

  const getFacilityById = (id: string) => facilities.find(f => f.id === id);
  const getUserById = (id: string) => MOCK_USERS.find(u => u.id === id);
  const getRouteById = (id: string) => routes.find(r => r.id === id);
  const getSubclusterById = (id: string) => subclusters.find(sc => sc.id === id);

  const setMaxExtensionDays = (days: number) => {
    if (days > 0) {
      setMaxExtensionDaysState(days);
      localStorage.setItem('stressless-maxExtensionDays', days.toString());
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const markAllCurrentUserNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n));
  };
  
  const getUnreadNotificationsCount = useCallback(() => {
    if (!currentUser) return 0;
    return notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;
  }, [currentUser, notifications]);

  const getCurrentUserNotifications = useCallback((limit?: number) => {
    if (!currentUser) return [];
    const userNotifications = notifications
      .filter(n => n.userId === currentUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return limit ? userNotifications.slice(0, limit) : userNotifications;
  }, [currentUser, notifications]);


  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        facilities,
        routes,
        subclusters,
        stressRequests,
        maxExtensionDays,
        notifications,
        login,
        logout,
        addStressRequest,
        updateStressRequestStatus,
        isLoadingAiReason,
        fetchAiReason,
        getFacilityById,
        getUserById,
        getRouteById,
        getSubclusterById,
        setMaxExtensionDays,
        markNotificationAsRead,
        markAllCurrentUserNotificationsAsRead,
        getUnreadNotificationsCount,
        getCurrentUserNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
