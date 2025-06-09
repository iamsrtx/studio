'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Facility, StressRequest, UserRole, FacilityType } from '@/lib/types';
import { MOCK_USERS, MOCK_FACILITIES, MOCK_STRESS_REQUESTS } from '@/lib/data';
import { suggestStressReason as suggestStressReasonFlow } from '@/ai/flows/suggest-stress-reason';
import { useRouter } from 'next/navigation';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  facilities: Facility[];
  stressRequests: StressRequest[];
  login: (userId: string) => void;
  logout: () => void;
  addStressRequest: (requestData: Omit<StressRequest, 'id' | 'submissionDate' | 'status' | 'submittedByUserId' | 'submittedByName'>) => Promise<StressRequest | null>;
  updateStressRequestStatus: (requestId: string, status: 'Approved' | 'Rejected', adminComments?: string) => Promise<void>;
  isLoadingAiReason: boolean;
  fetchAiReason: (facilityType: FacilityType) => Promise<string>;
  getFacilityById: (id: string) => Facility | undefined;
  getUserById: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES);
  const [stressRequests, setStressRequests] = useState<StressRequest[]>(MOCK_STRESS_REQUESTS);
  const [isLoadingAiReason, setIsLoadingAiReason] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Persist/retrieve minimal auth state (e.g., userId) for demo purposes
    const storedUserId = localStorage.getItem('stressless-userId');
    if (storedUserId) {
      const user = MOCK_USERS.find(u => u.id === storedUserId);
      if (user) {
        setCurrentUser(user);
        setCurrentRole(user.role);
      }
    }
  }, []);

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
    return newRequest;
  };

  const updateStressRequestStatus = async (requestId: string, status: 'Approved' | 'Rejected', adminComments?: string) => {
    if (!currentUser || currentUser.role !== 'Administrator') {
      console.error("Unauthorized or no admin logged in");
      return;
    }
    setStressRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status, adminComments, adminApproverId: currentUser.id, approvalDate: new Date().toISOString() }
          : req
      )
    );
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


  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        facilities,
        stressRequests,
        login,
        logout,
        addStressRequest,
        updateStressRequestStatus,
        isLoadingAiReason,
        fetchAiReason,
        getFacilityById,
        getUserById,
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
