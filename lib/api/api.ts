import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// Create the API base query with automatic token inclusion
export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the auth state
    const token = (getState() as RootState).auth.token;
    
    // If we have a token, include it in the request headers
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
  credentials: 'include',
});

// Base API setup that can be extended by other API slices
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'User', 'Users', 'Brand', 'Brands', 'Location', 'Locations'],
  endpoints: () => ({}),
});

// Reusable error handler
export const handleApiError = (error: any) => {
  if (error) {
    const { status, data } = error;
    return {
      status,
      message: data?.message || 'An error occurred',
    };
  }
  return { status: 500, message: 'Unknown error' };
}; 