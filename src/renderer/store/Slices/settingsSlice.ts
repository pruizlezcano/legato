import { createSlice } from '@reduxjs/toolkit';

const settingSlice = createSlice({
  name: 'settings',
  initialState: {
    projectsPath: null,
    theme: 'system',
  },
  reducers: {
    loadSettings(state, action) {
      state.projectsPath = action.payload.projectsPath;
      state.theme = action.payload.theme;
    },
    updateSettings(state, action) {
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

export const selectSettings = (state: any) => state.settings;
