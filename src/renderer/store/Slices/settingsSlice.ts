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
      const payload = JSON.parse(JSON.stringify(action.payload));
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
      if (action.payload.minimizeToTray === false && state.startMinimized) {
        state.startMinimized = false;
        update = true;
      }
      Object.keys(action.payload).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(action.payload, key) &&
          action.payload[key] !== state[key as keyof typeof state]
        ) {
          state[key as keyof typeof state] = action.payload[key] as never;
          update = true;
        }
      });
      if (update) {
        const serializableState = JSON.parse(
          JSON.stringify({
            projectsPath: state.projectsPath,
            theme: state.theme,
            pageSize: state.pageSize,
            displayedColumns: state.displayedColumns,
            sorting: state.sorting,
            scanSchedule: state.scanSchedule,
            minimizeToTray: state.minimizeToTray,
            startMinimized: state.startMinimized,
          }),
        );
        window.electron.ipcRenderer.sendMessage(
          'save-settings',
          serializableState,
        );
      }
    },
  },
});

export const { loadSettings, updateSettings } = settingSlice.actions;

export default settingSlice.reducer;

export const selectSettings = (state: RootState) => state.settings;
