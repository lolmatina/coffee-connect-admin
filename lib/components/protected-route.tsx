'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { selectIsAuthenticated, selectIsLoading } from '@/lib/slices/authSlice';

export default function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!isAuthenticated && pathname !== '/auth') {
      router.push('/auth');
    } else if (isAuthenticated && pathname === '/auth') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router, pathname, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if ((pathname === '/auth' && !isAuthenticated) || (pathname !== '/auth' && isAuthenticated)) {
    return <>{children}</>;
  }

  return null;
} 