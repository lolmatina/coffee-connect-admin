import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Location, CreateLocationDto, UpdateLocationDto, LocationStaff } from '../types';
import { RootState } from '../store';

// Create the API base query with automatic token inclusion
const baseQuery = fetchBaseQuery({
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

export const locationsApi = createApi({
  reducerPath: 'locationsApi',
  baseQuery,
  tagTypes: ['Location', 'Locations', 'LocationStaff'],
  endpoints: (builder) => ({
    // Get all locations
    getLocations: builder.query<Location[], void>({
      query: () => '/locations',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Location' as const, id })),
              { type: 'Locations', id: 'LIST' },
            ]
          : [{ type: 'Locations', id: 'LIST' }],
    }),
    
    // Get locations by brand ID
    getLocationsByBrand: builder.query<Location[], number>({
      query: (brandId) => `/brands/${brandId}/locations`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Location' as const, id })),
              { type: 'Locations', id: 'LIST' },
            ]
          : [{ type: 'Locations', id: 'LIST' }],
    }),
    
    // Get location by ID
    getLocationById: builder.query<Location, number>({
      query: (id) => `/locations/${id}`,
      providesTags: (result, error, id) => [
        { type: 'Location', id },
        ...(result?.LocationStaff?.map(staff => ({ 
          type: 'LocationStaff' as const, 
          id: staff.id 
        })) || []),
      ],
    }),
    
    // Create location (COFFEE_SHOP_OWNER only)
    createLocation: builder.mutation<Location, CreateLocationDto>({
      query: (locationData) => ({
        url: '/locations',
        method: 'POST',
        body: locationData,
      }),
      invalidatesTags: [{ type: 'Locations', id: 'LIST' }],
    }),
    
    // Update location
    updateLocation: builder.mutation<Location, { id: number; data: UpdateLocationDto }>({
      query: ({ id, data }) => ({
        url: `/locations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Location', id },
        { type: 'Locations', id: 'LIST' },
      ],
    }),
    
    // Delete location
    deleteLocation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Locations', id: 'LIST' }],
    }),
    
    // Get location staff (employees assigned to a location)
    getLocationStaff: builder.query<LocationStaff[], number>({
      query: (locationId) => `/locations/${locationId}/staff`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'LocationStaff' as const, id })),
              { type: 'LocationStaff', id: 'LIST' },
            ]
          : [{ type: 'LocationStaff', id: 'LIST' }],
    }),
    
    // Assign staff to location
    assignStaffToLocation: builder.mutation<LocationStaff, { locationId: number; staffId: number }>({
      query: ({ locationId, staffId }) => ({
        url: `/locations/${locationId}/staff`,
        method: 'POST',
        body: { staffId },
      }),
      invalidatesTags: (result) => [
        { type: 'LocationStaff', id: 'LIST' },
        { type: 'Location', id: result?.id },
      ],
    }),
    
    // Remove staff from location
    removeStaffFromLocation: builder.mutation<void, { locationId: number; staffId: number }>({
      query: ({ locationId, staffId }) => ({
        url: `/locations/${locationId}/staff/${staffId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'LocationStaff', id: 'LIST' },
      ],
    }),
  }),
});

// Export the auto-generated hooks
export const {
  useGetLocationsQuery,
  useGetLocationsByBrandQuery,
  useGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useGetLocationStaffQuery,
  useAssignStaffToLocationMutation,
  useRemoveStaffFromLocationMutation,
} = locationsApi; 