import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '../store';

export interface Sorting {
  id: string;
  desc: boolean;
}

export interface Settings {
  projectsPath: string | null;
  theme: string;
  pageSize: number;
  displayedColumns: string[];
  sorting: Sorting;
  scanSchedule: string;
  minimizeToTray: boolean;
  startMinimized: boolean;
  [key: string]: any | null;
}

const initialState: Settings = {
  projectsPath: null,
  theme: 'system',
  pageSize: 10,
  displayedColumns: [
    'title',
    'bpm',
    'scale',
    'genre',
    'tags',
    'progress',
    'modified',
  ],
  sorting: { id: 'title', desc: true },
  scanSchedule: '0 0 * * *',
  minimizeToTray: false,
  startMinimized: false,
};

const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    loadSettings(state, action: PayloadAction<Settings>) {
      const { payload } = action;

      state.projectsPath = payload.projectsPath;
      state.theme = payload.theme;
      state.pageSize = payload.pageSize;
      state.displayedColumns = payload.displayedColumns;
      state.sorting = payload.sorting;
      state.scanSchedule = payload.scanSchedule;
      state.minimizeToTray = payload.minimizeToTray;
      state.startMinimized = payload.startMinimized;
    },

    updateSettings(state, action: PayloadAction<Partial<Settings>>) {
      let update = false;
      const { payload } = action;

      // Handle special case for startMinimized dependency on minimizeToTray
      if (payload.minimizeToTray === false && state.startMinimized) {
        state.startMinimized = false;
        update = true;
      }

      (Object.keys(payload) as Array<keyof typeof payload>).forEach((key) => {
        if (payload[key] === undefined) return;

        // Only update if value has changed
        if (JSON.stringify(payload[key]) !== JSON.stringify(state[key])) {
          state[key] = payload[key] as any;
          update = true;
        }
      });

      // Send updated settings to main process if anything changed
      if (update) {
        window.electron.ipcRenderer.sendMessage('save-settings', payload);
      }
    },
  },
});

export const { loadSettings, updateSettings } = settingSlice.actions;

export default settingSlice.reducer;

export const selectSettings = (state: RootState) => state.settings;
