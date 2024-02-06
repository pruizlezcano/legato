import { createSlice } from '@reduxjs/toolkit';

const appStateSlice = createSlice({
  name: 'appState',
  initialState: {
    showAudioPlayer: false,
  },
  reducers: {
    setShowAudioPlayer(state, action) {
      if (action.payload) {
        state.showAudioPlayer = action.payload;
      } else {
        state.showAudioPlayer = !state.showAudioPlayer;
      }
    },
  },
});

export const { setShowAudioPlayer } = appStateSlice.actions;

export default appStateSlice.reducer;

export const selectAppState = (state: any) => state.appState;
