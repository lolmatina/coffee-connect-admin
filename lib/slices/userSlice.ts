import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';
import { usersApi } from '../api/usersApi';
import { RootState } from '../store';

interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set the list of users
    setUsers: (state, { payload }: PayloadAction<User[]>) => {
      state.users = payload;
    },
    
    // Set a selected user for viewing/editing
    setSelectedUser: (state, { payload }: PayloadAction<User>) => {
      state.selectedUser = payload;
    },
    
    // Clear the selected user
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    
    // Set error state
    setUserError: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
    },
    
    // Clear error state
    clearUserError: (state) => {
      state.error = null;
    },
    
    // Set loading state
    setUserLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
  },
  // Handle API-related state updates
  extraReducers: (builder) => {
    // Get all users
    builder.addMatcher(
      usersApi.endpoints.getUsers.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      usersApi.endpoints.getUsers.matchFulfilled,
      (state, { payload }) => {
        state.users = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      usersApi.endpoints.getUsers.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch users';
      }
    );
    
    // Get single user
    builder.addMatcher(
      usersApi.endpoints.getUserById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      usersApi.endpoints.getUserById.matchFulfilled,
      (state, { payload }) => {
        state.selectedUser = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      usersApi.endpoints.getUserById.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch user';
      }
    );
    
    // Update user profile
    builder.addMatcher(
      usersApi.endpoints.updateUserProfile.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      usersApi.endpoints.updateUserProfile.matchFulfilled,
      (state, { payload }) => {
        state.selectedUser = payload;
        // Update user in the users array as well
        state.users = state.users.map((user) =>
          user.id === payload.id ? payload : user
        );
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      usersApi.endpoints.updateUserProfile.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to update user';
      }
    );
    
    // Delete user
    builder.addMatcher(
      usersApi.endpoints.deleteUser.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      usersApi.endpoints.deleteUser.matchFulfilled,
      (state) => {
        state.isLoading = false;
        // Note: actual user removal happens via the cache invalidation
      }
    );
    builder.addMatcher(
      usersApi.endpoints.deleteUser.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to delete user';
      }
    );
  },
});

// Export actions
export const {
  setUsers,
  setSelectedUser,
  clearSelectedUser,
  setUserError,
  clearUserError,
  setUserLoading,
} = userSlice.actions;

// Export selectors
export const selectUsers = (state: RootState) => state.user.users;
export const selectSelectedUser = (state: RootState) => state.user.selectedUser;
export const selectUserError = (state: RootState) => state.user.error;
export const selectUserLoading = (state: RootState) => state.user.isLoading;

export default userSlice.reducer; 