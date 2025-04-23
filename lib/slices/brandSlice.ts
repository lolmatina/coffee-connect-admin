import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Brand, BrandState } from '../types';
import { brandsApi } from '../api/brandsApi';
import { RootState } from '../store';

// Initial state for brands
const initialState: BrandState = {
  brands: [],
  selectedBrand: null,
  isLoading: false,
  error: null,
};

const brandSlice = createSlice({
  name: 'brand',
  initialState,
  reducers: {
    // Set the list of brands
    setBrands: (state, { payload }: PayloadAction<Brand[]>) => {
      state.brands = payload;
    },
    
    // Set a selected brand for viewing/editing
    setSelectedBrand: (state, { payload }: PayloadAction<Brand>) => {
      state.selectedBrand = payload;
    },
    
    // Clear the selected brand
    clearSelectedBrand: (state) => {
      state.selectedBrand = null;
    },
    
    // Set error state
    setBrandError: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
    },
    
    // Clear error state
    clearBrandError: (state) => {
      state.error = null;
    },
    
    // Set loading state
    setBrandLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
  },
  // Handle API-related state updates
  extraReducers: (builder) => {
    // Get all brands
    builder.addMatcher(
      brandsApi.endpoints.getBrands.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.getBrands.matchFulfilled,
      (state, { payload }) => {
        state.brands = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.getBrands.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch brands';
      }
    );
    
    // Get brand by ID
    builder.addMatcher(
      brandsApi.endpoints.getBrandById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.getBrandById.matchFulfilled,
      (state, { payload }) => {
        state.selectedBrand = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.getBrandById.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch brand';
      }
    );
    
    // Create brand
    builder.addMatcher(
      brandsApi.endpoints.createBrand.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.createBrand.matchFulfilled,
      (state, { payload }) => {
        state.brands.push(payload);
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.createBrand.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to create brand';
      }
    );
    
    // Update brand
    builder.addMatcher(
      brandsApi.endpoints.updateBrand.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.updateBrand.matchFulfilled,
      (state, { payload }) => {
        // Update the brand in the brands array
        state.brands = state.brands.map((brand) =>
          brand.id === payload.id ? payload : brand
        );
        // Update selected brand if it's the one being updated
        if (state.selectedBrand?.id === payload.id) {
          state.selectedBrand = payload;
        }
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.updateBrand.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to update brand';
      }
    );
    
    // Delete brand
    builder.addMatcher(
      brandsApi.endpoints.deleteBrand.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.deleteBrand.matchFulfilled,
      (state) => {
        // The actual removal happens via cache invalidation
        // Clear selected brand if it was deleted
        state.selectedBrand = null;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      brandsApi.endpoints.deleteBrand.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to delete brand';
      }
    );
  },
});

// Export actions
export const {
  setBrands,
  setSelectedBrand,
  clearSelectedBrand,
  setBrandError,
  clearBrandError,
  setBrandLoading,
} = brandSlice.actions;

// Export selectors
export const selectBrands = (state: RootState) => state.brand.brands;
export const selectSelectedBrand = (state: RootState) => state.brand.selectedBrand;
export const selectBrandError = (state: RootState) => state.brand.error;
export const selectBrandLoading = (state: RootState) => state.brand.isLoading;

export default brandSlice.reducer; 