import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  MenuTemplateState, 
  MenuTemplate, 
  TemplateItem,
} from '../types/menu';
import { menuApi } from '../api/menuApi';
import { RootState } from '../store';

// Initial state for menu templates
const initialState: MenuTemplateState = {
  templates: [],
  selectedTemplate: null,
  templateItems: [],
  selectedTemplateItem: null,
  isLoading: false,
  error: null,
};

const menuTemplateSlice = createSlice({
  name: 'menuTemplate',
  initialState,
  reducers: {
    // Set the list of templates
    setTemplates: (state, { payload }: PayloadAction<MenuTemplate[]>) => {
      state.templates = payload;
    },
    
    // Set a selected template for viewing/editing
    setSelectedTemplate: (state, { payload }: PayloadAction<MenuTemplate>) => {
      state.selectedTemplate = payload;
    },
    
    // Clear the selected template
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
    
    // Set the list of template items
    setTemplateItems: (state, { payload }: PayloadAction<TemplateItem[]>) => {
      state.templateItems = payload;
    },
    
    // Set a selected template item for viewing/editing
    setSelectedTemplateItem: (state, { payload }: PayloadAction<TemplateItem>) => {
      state.selectedTemplateItem = payload;
    },
    
    // Clear the selected template item
    clearSelectedTemplateItem: (state) => {
      state.selectedTemplateItem = null;
    },
    
    // Set error state
    setTemplateError: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
    },
    
    // Clear error state
    clearTemplateError: (state) => {
      state.error = null;
    },
    
    // Set loading state
    setTemplateLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
  },
  // Handle API-related state updates
  extraReducers: (builder) => {
    // Get all menu templates
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplates.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplates.matchFulfilled,
      (state, { payload }) => {
        state.templates = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplates.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch menu templates';
      }
    );
    
    // Get menu templates by brand
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplatesByBrand.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplatesByBrand.matchFulfilled,
      (state, { payload }) => {
        state.templates = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplatesByBrand.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch brand menu templates';
      }
    );
    
    // Get menu template by ID
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplateById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplateById.matchFulfilled,
      (state, { payload }) => {
        state.selectedTemplate = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getMenuTemplateById.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch menu template';
      }
    );
    
    // Create menu template
    builder.addMatcher(
      menuApi.endpoints.createMenuTemplate.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.createMenuTemplate.matchFulfilled,
      (state, { payload }) => {
        state.templates.push(payload);
        state.selectedTemplate = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.createMenuTemplate.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to create menu template';
      }
    );
    
    // Update menu template
    builder.addMatcher(
      menuApi.endpoints.updateMenuTemplate.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.updateMenuTemplate.matchFulfilled,
      (state, { payload }) => {
        // Update the template in the templates array
        state.templates = state.templates.map((template) =>
          template.id === payload.id ? payload : template
        );
        // Update selected template if it's the one being updated
        if (state.selectedTemplate?.id === payload.id) {
          state.selectedTemplate = payload;
        }
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.updateMenuTemplate.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to update menu template';
      }
    );
    
    // Delete menu template
    builder.addMatcher(
      menuApi.endpoints.deleteMenuTemplate.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.deleteMenuTemplate.matchFulfilled,
      (state) => {
        // The actual removal happens via cache invalidation
        // Clear selected template if it was deleted
        state.selectedTemplate = null;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.deleteMenuTemplate.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to delete menu template';
      }
    );
    
    // Get template items
    builder.addMatcher(
      menuApi.endpoints.getTemplateItems.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getTemplateItems.matchFulfilled,
      (state, { payload }) => {
        state.templateItems = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getTemplateItems.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch template items';
      }
    );
    
    // Get template items by template
    builder.addMatcher(
      menuApi.endpoints.getTemplateItemsByTemplate.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getTemplateItemsByTemplate.matchFulfilled,
      (state, { payload }) => {
        state.templateItems = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getTemplateItemsByTemplate.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch template items';
      }
    );
    
    // Get template item by ID
    builder.addMatcher(
      menuApi.endpoints.getTemplateItemById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getTemplateItemById.matchFulfilled,
      (state, { payload }) => {
        state.selectedTemplateItem = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.getTemplateItemById.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to fetch template item';
      }
    );
    
    // Create template item
    builder.addMatcher(
      menuApi.endpoints.createTemplateItem.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.createTemplateItem.matchFulfilled,
      (state, { payload }) => {
        state.templateItems.push(payload);
        state.selectedTemplateItem = payload;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.createTemplateItem.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to create template item';
      }
    );
    
    // Update template item
    builder.addMatcher(
      menuApi.endpoints.updateTemplateItem.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.updateTemplateItem.matchFulfilled,
      (state, { payload }) => {
        // Update the item in the items array
        state.templateItems = state.templateItems.map((item) =>
          item.id === payload.id ? payload : item
        );
        // Update selected item if it's the one being updated
        if (state.selectedTemplateItem?.id === payload.id) {
          state.selectedTemplateItem = payload;
        }
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.updateTemplateItem.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to update template item';
      }
    );
    
    // Delete template item
    builder.addMatcher(
      menuApi.endpoints.deleteTemplateItem.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.deleteTemplateItem.matchFulfilled,
      (state) => {
        // The actual removal happens via cache invalidation
        // Clear selected item if it was deleted
        state.selectedTemplateItem = null;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      menuApi.endpoints.deleteTemplateItem.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Failed to delete template item';
      }
    );
  },
});

// Export actions
export const {
  setTemplates,
  setSelectedTemplate,
  clearSelectedTemplate,
  setTemplateItems,
  setSelectedTemplateItem,
  clearSelectedTemplateItem,
  setTemplateError,
  clearTemplateError,
  setTemplateLoading,
} = menuTemplateSlice.actions;

// Export selectors
export const selectTemplates = (state: RootState) => state.menuTemplate.templates;
export const selectSelectedTemplate = (state: RootState) => state.menuTemplate.selectedTemplate;
export const selectTemplateItems = (state: RootState) => state.menuTemplate.templateItems;
export const selectSelectedTemplateItem = (state: RootState) => state.menuTemplate.selectedTemplateItem;
export const selectTemplateError = (state: RootState) => state.menuTemplate.error;
export const selectTemplateLoading = (state: RootState) => state.menuTemplate.isLoading;

export default menuTemplateSlice.reducer; 