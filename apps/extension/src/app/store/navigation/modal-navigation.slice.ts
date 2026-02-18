import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ModalNavigationState {
  backgroundLocationPathname: string | null;
  accountIndex: number | null;
  btcTx: unknown;
  fromOnboarding: boolean;
}

const initialState: ModalNavigationState = {
  backgroundLocationPathname: null,
  accountIndex: null,
  btcTx: null,
  fromOnboarding: false,
};

export const modalNavigationSlice = createSlice({
  name: 'modalNavigation',
  initialState,
  reducers: {
    setBackgroundLocationPathname(state, action: PayloadAction<string>) {
      state.backgroundLocationPathname = action.payload;
    },
    setAccountIndex(state, action: PayloadAction<number | null>) {
      state.accountIndex = action.payload;
    },
    setBtcTx(state, action: PayloadAction<unknown>) {
      state.btcTx = action.payload;
    },
    setFromOnboarding(state, action: PayloadAction<boolean>) {
      state.fromOnboarding = action.payload;
    },
    resetModalNavigation() {
      return initialState;
    },
  },
});
