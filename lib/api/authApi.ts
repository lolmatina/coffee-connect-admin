import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  AuthResponse, 
  SignInCredentials, 
  SignUpCredentials, 
  User, 
  InviteUserRequest
} from '../types';
import { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
  credentials: 'include',
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthResponse, SignInCredentials>({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    
    createUser: builder.mutation<User, SignUpCredentials>({
      query: (userData) => ({
        url: '/auth/create-user',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Auth', 'User'],
    }),
    
    inviteUser: builder.mutation<{ message: string, email: string, role: string, temporaryPassword: string }, InviteUserRequest>({
      query: (data) => ({
        url: '/auth/invite-user',
        method: 'POST',
        body: data,
      }),
    }),
    
    refreshToken: builder.mutation<AuthResponse, string>({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useSignInMutation,
  useLogoutMutation,
  useCreateUserMutation,
  useGetCurrentUserQuery,
  useInviteUserMutation,
  useRefreshTokenMutation,
} = authApi; 