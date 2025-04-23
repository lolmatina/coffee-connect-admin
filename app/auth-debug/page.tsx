'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { 
  selectIsAuthenticated, 
  selectCurrentUser, 
  selectAuthToken, 
  selectRefreshToken, 
  selectIsLoading,
  selectAuthError
} from '@/lib/slices/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePathname } from 'next/navigation';

export default function AuthDebugPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(selectAuthToken);
  const refreshToken = useAppSelector(selectRefreshToken);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const pathname = usePathname();
  
  useEffect(() => {
    // Check localStorage directly
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const localStorageUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    console.log('[AuthDebug] Storage check:', {
      localStorage: {
        token: localStorageToken ? 'exists' : 'missing',
        user: localStorageUser ? 'exists' : 'missing',
      }
    });
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Current Path</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2">{pathname}</pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Authentication State</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2">
                {JSON.stringify({ isAuthenticated, isLoading, error }, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Token Information</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2">
                {JSON.stringify({
                  hasToken: !!token,
                  tokenPreview: token ? `${token.substring(0, 15)}...` : null,
                  hasRefreshToken: !!refreshToken,
                }, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">User Information</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2">
                {JSON.stringify({
                  hasUser: !!user,
                  userDetails: user ? {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                  } : null,
                }, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 