import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, AuthResponse } from '../types';
import { authApi } from '../api/authApi';
import { RootState } from '../store';

// Check if localStorage is available (client-side only)
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    // Test localStorage access
    const testKey = '__test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Helper function to safely access localStorage
const getFromStorage = (key: string): string | null => {
  if (!isLocalStorageAvailable()) return null;
  return localStorage.getItem(key);
};

const setToStorage = (key: string, value: string): void => {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(key, value);
};

const removeFromStorage = (key: string): void => {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(key);
};

// Helper function to retrieve persisted auth state from localStorage
const loadAuthState = (): AuthState => {
  try {
    const token = getFromStorage('token');
    const refreshToken = getFromStorage('refreshToken');
    const userString = getFromStorage('user');
    
    if (token && refreshToken && userString) {
      const user = JSON.parse(userString) as User;
      return {
        token,
        refreshToken,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Failed to load auth state from localStorage', error);
  }
  
  return {
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

// Initial state for auth
const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { accessToken, refreshToken } }: PayloadAction<AuthResponse>
    ) => {
      state.token = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      
      setToStorage('token', accessToken);
      setToStorage('refreshToken', refreshToken);
    },
    
    setUser: (state, { payload }: PayloadAction<User>) => {
      state.user = payload;
      state.isAuthenticated = true;
      
      setToStorage('user', JSON.stringify(payload));
    },
    
    clearCredentials: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      
      removeFromStorage('token');
      removeFromStorage('refreshToken');
      removeFromStorage('user');
    },
    
    initializeAuthState: (state) => {
      const loadedState = loadAuthState();
      state.token = loadedState.token;
      state.refreshToken = loadedState.refreshToken;
      state.user = loadedState.user;
      
      // Explicitly set isAuthenticated based on token existence
      state.isAuthenticated = !!loadedState.token && !!loadedState.user;
      
      console.log('Auth state initialized:', { 
        hasToken: !!loadedState.token,
        hasUser: !!loadedState.user,
        isAuthenticated: state.isAuthenticated 
      });
    },
    
    setError: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.signIn.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      authApi.endpoints.signIn.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        
        setToStorage('token', payload.accessToken);
        setToStorage('refreshToken', payload.refreshToken);
      }
    );
    builder.addMatcher(
      authApi.endpoints.signIn.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Authentication failed';
      }
    );
    
    builder.addMatcher(
      authApi.endpoints.getCurrentUser.matchPending,
      (state) => {
        state.isLoading = true;
      }
    );
    builder.addMatcher(
      authApi.endpoints.getCurrentUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        
        setToStorage('user', JSON.stringify(payload));
      }
    );
    builder.addMatcher(
      authApi.endpoints.getCurrentUser.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch user data';
      }
    );
    
    builder.addMatcher(
      authApi.endpoints.logout.matchFulfilled,
      (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        
        removeFromStorage('token');
        removeFromStorage('refreshToken');
        removeFromStorage('user');
      }
    );
    
    builder.addMatcher(
      authApi.endpoints.refreshToken.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isAuthenticated = true;
        
        setToStorage('token', payload.accessToken);
        setToStorage('refreshToken', payload.refreshToken);
      }
    );
  },
});

// Export actions
export const {
  setCredentials,
  setUser,
  clearCredentials,
  setError,
  clearError,
  setLoading,
  initializeAuthState
} = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer; 