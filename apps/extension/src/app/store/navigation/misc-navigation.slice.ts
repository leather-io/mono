import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { NetworkConfiguration } from '@leather.io/models';

interface ErrorState {
  message: string;
  title: string;
}

interface RpcSignPsbtSummaryState {
  fee: string;
  sendingValue: string;
  totalSpend: string;
  txFiatValue: string;
  txFiatValueSymbol: string;
  txId: string;
  txLink: { blockchain: string; txid: string };
  txValue: string;
}

interface NetworkEditState {
  isEditNetworkMode: boolean;
  network: NetworkConfiguration;
}

interface MiscNavigationState {
  errorState: ErrorState | null;
  unlockReturnPath: string | null;
  networkEditState: NetworkEditState | null;
  rpcSignPsbtSummary: RpcSignPsbtSummaryState | null;
}

const initialState: MiscNavigationState = {
  errorState: null,
  unlockReturnPath: null,
  networkEditState: null,
  rpcSignPsbtSummary: null,
};

export const miscNavigationSlice = createSlice({
  name: 'miscNavigation',
  initialState,
  reducers: {
    setErrorState(state, action: PayloadAction<ErrorState>) {
      state.errorState = action.payload;
    },
    setUnlockReturnPath(state, action: PayloadAction<string>) {
      state.unlockReturnPath = action.payload;
    },
    setNetworkEditState(state, action: PayloadAction<NetworkEditState>) {
      state.networkEditState = action.payload;
    },
    setRpcSignPsbtSummary(state, action: PayloadAction<RpcSignPsbtSummaryState>) {
      state.rpcSignPsbtSummary = action.payload;
    },
    resetMiscNavigation() {
      return initialState;
    },
  },
});
