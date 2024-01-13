import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import projectReducer from './Slices/projectsSlice';
import settingsReducer from './Slices/settingsSlice';

export default configureStore({
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),

  reducer: {
    projects: projectReducer,
    settings: settingsReducer,
  },
});
