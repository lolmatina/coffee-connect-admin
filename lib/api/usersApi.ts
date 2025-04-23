import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  User, 
  UserWithRelations, 
  UpdateUserProfileRequest, 
  AssignUserToBrandRequest, 
  AssignUserToLocationRequest 
} from '../types';
import { RootState } from '../store';

// Define query parameters interface
export interface GetUsersParams {
  roleFilter?: string;
}

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

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    // Get all users with optional role filter
    getUsers: builder.query<User[], GetUsersParams | void>({
      query: (params) => {
        // If params exist, convert them to query string
        if (params && Object.keys(params).length > 0) {
          const { roleFilter } = params as GetUsersParams;
          const queryParams = new URLSearchParams();
          
          if (roleFilter) {
            queryParams.append('role', roleFilter);
          }
          
          return `/users?${queryParams.toString()}`;
        }
        
        // No params, fetch all users
        return '/users';
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    
    // Get a single user by ID
    getUserById: builder.query<UserWithRelations, number>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    
    // Update user profile
    updateUserProfile: builder.mutation<User, { id: number; data: UpdateUserProfileRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),
    
    // Delete a user (Admin only)
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
    
    // Assign user to brand (Admin only)
    assignUserToBrand: builder.mutation<any, AssignUserToBrandRequest>({
      query: (data) => ({
        url: '/users/assign-to-brand',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'Users', id: 'LIST' },
      ],
    }),
    
    // Assign user to location (Owner or Admin)
    assignUserToLocation: builder.mutation<any, AssignUserToLocationRequest>({
      query: (data) => ({
        url: '/users/assign-to-location',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'Users', id: 'LIST' },
      ],
    }),
  }),
});

// Export the auto-generated hooks
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserProfileMutation,
  useDeleteUserMutation,
  useAssignUserToBrandMutation,
  useAssignUserToLocationMutation,
} = usersApi; 