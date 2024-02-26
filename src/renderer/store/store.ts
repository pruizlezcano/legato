import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import projectReducer from './Slices/projectsSlice';
import settingsReducer from './Slices/settingsSlice';
import appStateReducer from './Slices/appStateSlice';

export const store = configureStore({
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),

  reducer: {
    projects: projectReducer,
    settings: settingsReducer,
    appState: appStateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
