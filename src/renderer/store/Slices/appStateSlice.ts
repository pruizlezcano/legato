import { createSlice } from '@reduxjs/toolkit';

const appStateSlice = createSlice({
  name: 'appState',
  initialState: {
    showAudioPlayer: false,
    filter: '',
    scanInProgress: false,
    showSettings: false,
  },
  reducers: {
    setShowAudioPlayer(state, action) {
      state.showAudioPlayer = action.payload;
    },
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setScanInProgress(state, action) {
      state.scanInProgress = action.payload;
    },
    setShowSettings(state, action) {
      state.showSettings = action.payload;
    },
  },
});

export const {
  setShowAudioPlayer,
  setFilter,
  setScanInProgress,
  setShowSettings,
} = appStateSlice.actions;

export default appStateSlice.reducer;

export const selectAppState = (state: any) => state.appState;
