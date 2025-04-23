import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { authApi } from './api/authApi';
import { usersApi } from './api/usersApi';
import { brandsApi } from './api/brandsApi';
import { locationsApi } from './api/locationsApi';
import { menuApi } from './api/menuApi';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import brandReducer from './slices/brandSlice';
import locationReducer from './slices/locationSlice';
import menuReducer from './slices/menuSlice';
import menuTemplateReducer from './slices/menuTemplateSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    brand: brandReducer,
    location: locationReducer,
    menu: menuReducer,
    menuTemplate: menuTemplateReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [brandsApi.reducerPath]: brandsApi.reducer,
    [locationsApi.reducerPath]: locationsApi.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      usersApi.middleware,
      brandsApi.middleware,
      locationsApi.middleware,
      menuApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 