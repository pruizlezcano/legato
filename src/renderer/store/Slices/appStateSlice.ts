import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '../store';

interface AppState {
  /** Should show the audio player component */
  showAudioPlayer: boolean;
  /** The filter string for the projects table */
  filter: string;
  /** Is a scan in progress */
  scanInProgress: boolean;
  /** Should show the settings view */
  showSettings: boolean;
  /** The currently playing track */
  nowPlaying: string;
  /** The app version */
  appVersion: string;
}

const initialState: AppState = {
  showAudioPlayer: false,
  filter: '',
  scanInProgress: false,
  showSettings: false,
  nowPlaying: '',
  appVersion: '',
};

const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setShowAudioPlayer(state, action: PayloadAction<boolean>) {
      state.showAudioPlayer = action.payload;
    },
    setFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload;
    },
    setScanInProgress(state, action: PayloadAction<boolean>) {
      state.scanInProgress = action.payload;
    },
    setShowSettings(state, action: PayloadAction<boolean>) {
      state.showSettings = action.payload;
    },
    setNowPlaying(state, action: PayloadAction<string>) {
      state.nowPlaying = action.payload;
    },
    setAppVersion(state, action: PayloadAction<string>) {
      state.appVersion = action.payload;
    },
  },
});

export const {
  setShowAudioPlayer,
  setFilter,
  setScanInProgress,
  setShowSettings,
  setNowPlaying,
  setAppVersion,
} = appStateSlice.actions;

export default appStateSlice.reducer;

export const selectAppState = (state: RootState) => state.appState;
