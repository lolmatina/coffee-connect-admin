'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { initializeAuthState, selectIsAuthenticated } from '@/lib/slices/authSlice';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuthState());
      setInitialized(true);
    }
  }, [dispatch, initialized]);

  return null;
} 