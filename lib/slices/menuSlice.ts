import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  MenuState, 
  Menu, 
  MenuItemOverride,
} from '../types/menu';
import { menuApi } from '../api/menuApi';
import { RootState } from '../store';

// Initial state for menus
const initialState: MenuState = {
  menus: [],
  selectedMenu: null,
  menuItemOverrides: [],
  selectedMenuItemOverride: null,
  isLoading: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // Set the list of menus
    setMenus: (state, { payload }: PayloadAction<Menu[]>) => {
      state.menus = payload;
    },
    
    // Set a selected menu for viewing/editing
    setSelectedMenu: (state, { payload }: PayloadAction<Menu>) => {
      state.selectedMenu = payload;
    },
    
    // Clear the selected menu
    clearSelectedMenu: (state) => {
      state.selectedMenu = null;
    },
    
    // Set the list of menu item overrides
    setMenuItemOverrides: (state, { payload }: PayloadAction<MenuItemOverride[]>) => {
      state.menuItemOverrides = payload;
    },
    
    // Set a selected menu item override for viewing/editing
    setSelectedMenuItemOverride: (state, { payload }: PayloadAction<MenuItemOverride>) => {
      state.selectedMenuItemOverride = payload;
    },
    
    // Clear the selected menu item override
    clearSelectedMenuItemOverride: (state) => {
      state.selectedMenuItemOverride = null;
    },
    
    // Set error state
    setMenuError: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
    },
    
    // Clear error state
    clearMenuError: (state) => {
      state.error = null;
    },
    
    // Set loading state
    setMenuLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
  },
  // Handle API-related state updates
  extraReducers: (builder) => {
    // Get all menus
    builder.addMatcher(
      menuApi.endpoints.getMenus.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenus.matchFulfilled,
      (state, { payload }) => {
        state.menus = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenus.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch menus';
      }
    );
    
    // Get menu by ID
    builder.addMatcher(
      menuApi.endpoints.getMenuById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuById.matchFulfilled,
      (state, { payload }) => {
        state.selectedMenu = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuById.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch menu';
      }
    );
    
    // Get menu by location
    builder.addMatcher(
      menuApi.endpoints.getMenuByLocation.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuByLocation.matchFulfilled,
      (state, { payload }) => {
        state.selectedMenu = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuByLocation.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch menu for location';
      }
    );
    
    // Create menu
    builder.addMatcher(
      menuApi.endpoints.createMenu.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.createMenu.matchFulfilled,
      (state, { payload }) => {
        state.menus.push(payload);
        state.selectedMenu = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.createMenu.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to create menu';
      }
    );
    
    // Update menu
    builder.addMatcher(
      menuApi.endpoints.updateMenu.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.updateMenu.matchFulfilled,
      (state, { payload }) => {
        // Update the menu in the menus array
        state.menus = state.menus.map((menu) =>
          menu.id === payload.id ? payload : menu
        );
        // Update selected menu if it's the one being updated
        if (state.selectedMenu?.id === payload.id) {
          state.selectedMenu = payload;
        }
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.updateMenu.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to update menu';
      }
    );
    
    // Delete menu
    builder.addMatcher(
      menuApi.endpoints.deleteMenu.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.deleteMenu.matchFulfilled,
      (state) => {
        // The actual removal happens via cache invalidation
        // Clear selected menu if it was deleted
        state.selectedMenu = null;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.deleteMenu.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to delete menu';
      }
    );
    
    // Get menu item overrides by menu
    builder.addMatcher(
      menuApi.endpoints.getMenuItemOverridesByMenu.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuItemOverridesByMenu.matchFulfilled,
      (state, { payload }) => {
        state.menuItemOverrides = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuItemOverridesByMenu.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch menu item overrides';
      }
    );
    
    // Create menu item override
    builder.addMatcher(
      menuApi.endpoints.createMenuItemOverride.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.createMenuItemOverride.matchFulfilled,
      (state, { payload }) => {
        state.menuItemOverrides.push(payload);
        state.selectedMenuItemOverride = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.createMenuItemOverride.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to create menu item override';
      }
    );
    
    // Update menu item override
    builder.addMatcher(
      menuApi.endpoints.updateMenuItemOverride.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.updateMenuItemOverride.matchFulfilled,
      (state, { payload }) => {
        // Update the override in the overrides array
        state.menuItemOverrides = state.menuItemOverrides.map((override) =>
          override.id === payload.id ? payload : override
        );
        // Update selected override if it's the one being updated
        if (state.selectedMenuItemOverride?.id === payload.id) {
          state.selectedMenuItemOverride = payload;
        }
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.updateMenuItemOverride.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to update menu item override';
      }
    );
    
    // Delete menu item override
    builder.addMatcher(
      menuApi.endpoints.deleteMenuItemOverride.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.deleteMenuItemOverride.matchFulfilled,
      (state) => {
        // The actual removal happens via cache invalidation
        // Clear selected override if it was deleted
        state.selectedMenuItemOverride = null;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.deleteMenuItemOverride.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to delete menu item override';
      }
    );
  },
});

// Export actions
export const {
  setMenus,
  setSelectedMenu,
  clearSelectedMenu,
  setMenuItemOverrides,
  setSelectedMenuItemOverride,
  clearSelectedMenuItemOverride,
  setMenuError,
  clearMenuError,
  setMenuLoading,
} = menuSlice.actions;

// Export selectors
export const selectMenus = (state: RootState) => state.menu.menus;
export const selectSelectedMenu = (state: RootState) => state.menu.selectedMenu;
export const selectMenuItemOverrides = (state: RootState) => state.menu.menuItemOverrides;
export const selectSelectedMenuItemOverride = (state: RootState) => state.menu.selectedMenuItemOverride;
export const selectMenuError = (state: RootState) => state.menu.error;
export const selectMenuLoading = (state: RootState) => state.menu.isLoading;

export default menuSlice.reducer; 