import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '../store';

export interface Settings {
  projectsPath: string | null;
  theme: string;
  [key: string]: string | null;
}

const initialState: Settings = {
  projectsPath: null,
  theme: 'system',
};

const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    loadSettings(state, action: PayloadAction<Settings>) {
      state.projectsPath = action.payload.projectsPath;
      state.theme = action.payload.theme;
    },
    updateSettings(state, action: PayloadAction<Partial<Settings>>) {
      let update = false;
      Object.keys(action.payload).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(action.payload, key) &&
          action.payload[key] !== state[key as keyof typeof state]
        ) {
          state[key as keyof typeof state] = action.payload[key] as never;
          update = true;
        }
      });
      if (update)
        window.electron.ipcRenderer.sendMessage('save-settings', {
          projectsPath: state.projectsPath,
          theme: state.theme,
        });
    },
  },
});

export const { loadSettings, updateSettings } = settingSlice.actions;

export default settingSlice.reducer;

export const selectSettings = (state: RootState) => state.settings;
