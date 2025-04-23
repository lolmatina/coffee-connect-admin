import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Brand, CreateBrandDto, UpdateBrandDto } from '../types';
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

export const brandsApi = createApi({
  reducerPath: 'brandsApi',
  baseQuery,
  tagTypes: ['Brand', 'Brands'],
  endpoints: (builder) => ({
    // Get all brands
    getBrands: builder.query<Brand[], void>({
      query: () => '/brands',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Brand' as const, id })),
              { type: 'Brands', id: 'LIST' },
            ]
          : [{ type: 'Brands', id: 'LIST' }],
    }),
    
    // Get brand by ID
    getBrandById: builder.query<Brand, number>({
      query: (id) => `/brands/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brand', id }],
    }),
    
    // Create brand (SUPER_ADMIN only)
    createBrand: builder.mutation<Brand, CreateBrandDto>({
      query: (brandData) => ({
        url: '/brands',
        method: 'POST',
        body: brandData,
      }),
      invalidatesTags: [{ type: 'Brands', id: 'LIST' }],
    }),
    
    // Update brand
    updateBrand: builder.mutation<Brand, { id: number; data: UpdateBrandDto }>({
      query: ({ id, data }) => ({
        url: `/brands/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Brand', id },
        { type: 'Brands', id: 'LIST' },
      ],
    }),
    
    // Delete brand
    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Brands', id: 'LIST' }],
    }),
  }),
});

// Export the auto-generated hooks
export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi; 