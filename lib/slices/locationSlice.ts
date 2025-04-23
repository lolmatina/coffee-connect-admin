import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Location, LocationState, LocationStaff } from '../types';
import { locationsApi } from '../api/locationsApi';
import { RootState } from '../store';

// Initial state for locations
const initialState: LocationState = {
  locations: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // Set the list of locations
    setLocations: (state, { payload }: PayloadAction<Location[]>) => {
      state.locations = payload;
    },
    
    // Set a selected location for viewing/editing
    setSelectedLocation: (state, { payload }: PayloadAction<Location>) => {
      state.selectedLocation = payload;
    },
    
    // Clear the selected location
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
    },
    
    // Set error state
    setLocationError: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
    },
    
    // Clear error state
    clearLocationError: (state) => {
      state.error = null;
    },
    
    // Set loading state
    setLocationLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
  },
  // Handle API-related state updates
  extraReducers: (builder) => {
    // Get all locations
    builder.addMatcher(
      locationsApi.endpoints.getLocations.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.getLocations.matchFulfilled,
      (state, { payload }) => {
        state.locations = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.getLocations.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch locations';
      }
    );
    
    // Get locations by brand
    builder.addMatcher(
      locationsApi.endpoints.getLocationsByBrand.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.getLocationsByBrand.matchFulfilled,
      (state, { payload }) => {
        state.locations = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.getLocationsByBrand.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch brand locations';
      }
    );
    
    // Get location by ID
    builder.addMatcher(
      locationsApi.endpoints.getLocationById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.getLocationById.matchFulfilled,
      (state, { payload }) => {
        state.selectedLocation = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.getLocationById.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch location';
      }
    );
    
    // Create location
    builder.addMatcher(
      locationsApi.endpoints.createLocation.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.createLocation.matchFulfilled,
      (state, { payload }) => {
        state.locations.push(payload);
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.createLocation.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to create location';
      }
    );
    
    // Update location
    builder.addMatcher(
      locationsApi.endpoints.updateLocation.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.updateLocation.matchFulfilled,
      (state, { payload }) => {
        // Update the location in the locations array
        state.locations = state.locations.map((location) =>
          location.id === payload.id ? payload : location
        );
        // Update selected location if it's the one being updated
        if (state.selectedLocation?.id === payload.id) {
          state.selectedLocation = payload;
        }
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.updateLocation.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to update location';
      }
    );
    
    // Delete location
    builder.addMatcher(
      locationsApi.endpoints.deleteLocation.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.deleteLocation.matchFulfilled,
      (state) => {
        // The actual removal happens via cache invalidation
        // Clear selected location if it was deleted
        state.selectedLocation = null;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      locationsApi.endpoints.deleteLocation.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to delete location';
      }
    );
  },
});

// Export actions
export const {
  setLocations,
  setSelectedLocation,
  clearSelectedLocation,
  setLocationError,
  clearLocationError,
  setLocationLoading,
} = locationSlice.actions;

// Export selectors
export const selectLocations = (state: RootState) => state.location.locations;
export const selectSelectedLocation = (state: RootState) => state.location.selectedLocation;
export const selectLocationError = (state: RootState) => state.location.error;
export const selectLocationLoading = (state: RootState) => state.location.isLoading;

export default locationSlice.reducer; 