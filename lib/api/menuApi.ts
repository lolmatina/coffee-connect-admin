import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  Menu, 
  CreateMenuDto, 
  UpdateMenuDto, 
  MenuTemplate, 
  CreateMenuTemplateDto, 
  UpdateMenuTemplateDto,
  TemplateItem,
  CreateTemplateItemDto,
  UpdateTemplateItemDto,
  MenuItemOverride,
  CreateMenuItemOverrideDto,
  UpdateMenuItemOverrideDto
} from '../types/menu';
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

export const menuApi = createApi({
  reducerPath: 'menuApi',
  baseQuery,
  tagTypes: ['Menu', 'Menus', 'MenuTemplate', 'MenuTemplates', 'TemplateItem', 'TemplateItems', 'MenuItemOverride', 'MenuItemOverrides'],
  endpoints: (builder) => ({
    // Menu Template Endpoints
    getMenuTemplates: builder.query<MenuTemplate[], void>({
      query: () => '/menu/templates',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'MenuTemplate' as const, id })),
              { type: 'MenuTemplates', id: 'LIST' },
            ]
          : [{ type: 'MenuTemplates', id: 'LIST' }],
    }),
    
    getMenuTemplatesByBrand: builder.query<MenuTemplate[], number>({
      query: (brandId) => `/menu/templates/brand/${brandId}`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'MenuTemplate' as const, id })),
              { type: 'MenuTemplates', id: 'LIST' },
            ]
          : [{ type: 'MenuTemplates', id: 'LIST' }],
    }),
    
    getMenuTemplateById: builder.query<MenuTemplate, number>({
      query: (id) => `/menu/templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'MenuTemplate', id }],
    }),
    
    createMenuTemplate: builder.mutation<MenuTemplate, CreateMenuTemplateDto>({
      query: (data) => ({
        url: '/menu/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'MenuTemplates', id: 'LIST' }],
    }),
    
    updateMenuTemplate: builder.mutation<MenuTemplate, { id: number; data: UpdateMenuTemplateDto }>({
      query: ({ id, data }) => ({
        url: `/menu/templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MenuTemplate', id },
        { type: 'MenuTemplates', id: 'LIST' },
      ],
    }),
    
    deleteMenuTemplate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/menu/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'MenuTemplates', id: 'LIST' }],
    }),
    
    // Template Item Endpoints
    getTemplateItems: builder.query<TemplateItem[], void>({
      query: () => '/menu/template-items',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'TemplateItem' as const, id })),
              { type: 'TemplateItems', id: 'LIST' },
            ]
          : [{ type: 'TemplateItems', id: 'LIST' }],
    }),
    
    getTemplateItemsByTemplate: builder.query<TemplateItem[], number>({
      query: (templateId) => `/menu/template-items/template/${templateId}`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'TemplateItem' as const, id })),
              { type: 'TemplateItems', id: 'LIST' },
            ]
          : [{ type: 'TemplateItems', id: 'LIST' }],
    }),
    
    getTemplateItemById: builder.query<TemplateItem, number>({
      query: (id) => `/menu/template-items/${id}`,
      providesTags: (result, error, id) => [{ type: 'TemplateItem', id }],
    }),
    
    createTemplateItem: builder.mutation<TemplateItem, CreateTemplateItemDto>({
      query: (data) => ({
        url: '/menu/template-items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'TemplateItems', id: 'LIST' }],
    }),
    
    updateTemplateItem: builder.mutation<TemplateItem, { id: number; data: UpdateTemplateItemDto }>({
      query: ({ id, data }) => ({
        url: `/menu/template-items/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TemplateItem', id },
        { type: 'TemplateItems', id: 'LIST' },
      ],
    }),
    
    deleteTemplateItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/menu/template-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'TemplateItems', id: 'LIST' }],
    }),
    
    // Menu Endpoints
    getMenus: builder.query<Menu[], void>({
      query: () => '/menu',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Menu' as const, id })),
              { type: 'Menus', id: 'LIST' },
            ]
          : [{ type: 'Menus', id: 'LIST' }],
    }),
    
    getMenuByLocation: builder.query<Menu, number>({
      query: (locationId) => `/menu/location/${locationId}`,
      providesTags: (result, error, locationId) => [
        { type: 'Menu', id: result?.id },
        { type: 'Menus', id: 'LIST' }
      ],
    }),
    
    getMenuById: builder.query<Menu, number>({
      query: (id) => `/menu/${id}`,
      providesTags: (result, error, id) => [{ type: 'Menu', id }],
    }),
    
    createMenu: builder.mutation<Menu, CreateMenuDto>({
      query: (data) => ({
        url: '/menu',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Menus', id: 'LIST' }],
    }),
    
    updateMenu: builder.mutation<Menu, { id: number; data: UpdateMenuDto }>({
      query: ({ id, data }) => ({
        url: `/menu/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Menu', id },
        { type: 'Menus', id: 'LIST' },
      ],
    }),
    
    deleteMenu: builder.mutation<void, number>({
      query: (id) => ({
        url: `/menu/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Menus', id: 'LIST' }],
    }),
    
    // Menu Item Override Endpoints
    getMenuItemOverridesByMenu: builder.query<MenuItemOverride[], number>({
      query: (menuId) => `/menu/item-overrides/menu/${menuId}`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'MenuItemOverride' as const, id })),
              { type: 'MenuItemOverrides', id: 'LIST' },
            ]
          : [{ type: 'MenuItemOverrides', id: 'LIST' }],
    }),
    
    createMenuItemOverride: builder.mutation<MenuItemOverride, CreateMenuItemOverrideDto>({
      query: (data) => ({
        url: '/menu/item-overrides',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'MenuItemOverrides', id: 'LIST' }],
    }),
    
    updateMenuItemOverride: builder.mutation<MenuItemOverride, { id: number; data: UpdateMenuItemOverrideDto }>({
      query: ({ id, data }) => ({
        url: `/menu/item-overrides/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MenuItemOverride', id },
        { type: 'MenuItemOverrides', id: 'LIST' },
      ],
    }),
    
    deleteMenuItemOverride: builder.mutation<void, number>({
      query: (id) => ({
        url: `/menu/item-overrides/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'MenuItemOverrides', id: 'LIST' }],
    }),
  }),
});

// Export the auto-generated hooks
export const {
  // Menu Template hooks
  useGetMenuTemplatesQuery,
  useGetMenuTemplatesByBrandQuery,
  useGetMenuTemplateByIdQuery,
  useCreateMenuTemplateMutation,
  useUpdateMenuTemplateMutation,
  useDeleteMenuTemplateMutation,
  
  // Template Item hooks
  useGetTemplateItemsQuery,
  useGetTemplateItemsByTemplateQuery,
  useGetTemplateItemByIdQuery,
  useCreateTemplateItemMutation,
  useUpdateTemplateItemMutation,
  useDeleteTemplateItemMutation,
  
  // Menu hooks
  useGetMenusQuery,
  useGetMenuByLocationQuery,
  useGetMenuByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  
  // Menu Item Override hooks
  useGetMenuItemOverridesByMenuQuery,
  useCreateMenuItemOverrideMutation,
  useUpdateMenuItemOverrideMutation,
  useDeleteMenuItemOverrideMutation,
} = menuApi; 