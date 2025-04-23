'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { 
  selectIsLoading, 
  selectAuthToken, 
  selectRefreshToken,
  initializeAuthState, 
  setCredentials,
  setUser,
  clearCredentials
} from '@/lib/slices/authSlice';
import { useGetCurrentUserQuery, useRefreshTokenMutation } from '@/lib/api/authApi';

const ProtectedRoute = dynamic(
  () => import("@/lib/components/protected-route"),
  { ssr: false }
);

const AppSidebar = dynamic(
  () => import("@/lib/widgets/sidebar"),
  { ssr: false }
);

const SidebarTrigger = dynamic(
  () => import("@/components/ui/sidebar").then((mod) => mod.SidebarTrigger),
  { ssr: false }
);

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const refreshToken = useAppSelector(selectRefreshToken);
  const isLoading = useAppSelector(selectIsLoading);
  const [initialized, setInitialized] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  
  const { data: user, error: userError, isLoading: isUserLoading } = 
    useGetCurrentUserQuery(undefined, { skip: !token || tokenValidated || !initialized });
  const [refreshTokenMutation, { isLoading: isRefreshing }] = useRefreshTokenMutation();
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized) {
      console.log('[ClientWrapper] Loading auth state from localStorage');
      dispatch(initializeAuthState());
      setInitialized(true);
    }
  }, [dispatch, initialized]);
  
  useEffect(() => {
    if (initialized && token && !tokenValidated && !validationAttempted && user) {
      console.log('[ClientWrapper] User data retrieved successfully, token is valid');
      dispatch(setUser(user));
      setTokenValidated(true);
      setValidationAttempted(true);
    } else if (initialized && token && !tokenValidated && !validationAttempted && userError) {
      console.log('[ClientWrapper] Token validation failed:', userError);
      setValidationAttempted(true);
    }
  }, [dispatch, initialized, token, tokenValidated, validationAttempted, user, userError]);
  
  useEffect(() => {
    const attemptTokenRefresh = async () => {
      if (initialized && validationAttempted && !tokenValidated && refreshToken && !refreshAttempted) {
        console.log('[ClientWrapper] Attempting to refresh token');
        try {
          const result = await refreshTokenMutation(refreshToken).unwrap();
          console.log('[ClientWrapper] Token refreshed successfully');
          dispatch(setCredentials(result));
          setRefreshAttempted(true);
          setValidationAttempted(false);
        } catch (error) {
          console.log('[ClientWrapper] Token refresh failed:', error);
          dispatch(clearCredentials());
          setRefreshAttempted(true);
        }
      }
    };

    attemptTokenRefresh();
  }, [dispatch, initialized, validationAttempted, tokenValidated, refreshToken, refreshAttempted, refreshTokenMutation]);
  
  useEffect(() => {
    if (initialized && validationAttempted && refreshAttempted && !tokenValidated) {
      console.log('[ClientWrapper] Auth validation failed completely, clearing auth state');
      dispatch(clearCredentials());
    }
  }, [dispatch, initialized, validationAttempted, refreshAttempted, tokenValidated]);
  
  if (!initialized || isLoading || isUserLoading || isRefreshing || 
      (token && !tokenValidated && (!validationAttempted || !refreshAttempted))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <p className="ml-2 text-sm">
          {!initialized 
            ? 'Initializing application...' 
            : isUserLoading 
              ? 'Validating authentication...' 
              : isRefreshing 
                ? 'Refreshing authentication...' 
                : 'Checking authentication status...'}
        </p>
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full p-4">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 