import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

interface InitialState {
  loadingState: { value: 'loading'; key: string } | { value: 'idle' };
  hasSwitched: boolean;
}

const initialState: InitialState = {
  loadingState: { value: 'idle' },
  hasSwitched: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsLoading(state, action: PayloadAction<string>) {
      state.loadingState = { value: 'loading', key: action.payload };
    },
    setIsIdle(state) {
      state.loadingState = { value: 'idle' };
    },
    setHasSwitched(state, action: PayloadAction<boolean>) {
      state.hasSwitched = action.payload;
    },
  },
});
