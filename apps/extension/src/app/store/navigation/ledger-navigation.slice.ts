import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { SupportedBlockchains } from '@leather.io/models';

import type { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import type { SignedMessageType } from '@shared/signature/signature-types';

interface LedgerNavigationState {
  tx: string | null;
  inputsToSign: BitcoinInputSigningConfig[] | null;
  chain: SupportedBlockchains | null;
  description: string | null;
  latestLedgerError: string | null;
  error: string | null;
  hasApprovedOperation: boolean;
  immediatelyAttemptConnection: boolean;
  fromLocationPathname: string | null;
  wentBack: boolean;
  messageType: SignedMessageType | null;
  message: string | null;
  domain: number[] | null;
  jwtAccountIndex: number | null;
}

const initialState: LedgerNavigationState = {
  tx: null,
  inputsToSign: null,
  chain: null,
  description: null,
  latestLedgerError: null,
  error: null,
  hasApprovedOperation: false,
  immediatelyAttemptConnection: false,
  fromLocationPathname: null,
  wentBack: false,
  messageType: null,
  message: null,
  domain: null,
  jwtAccountIndex: null,
};

export const ledgerNavigationSlice = createSlice({
  name: 'ledgerNavigation',
  initialState,
  reducers: {
    setLedgerTxSigningState(
      state,
      action: PayloadAction<{
        tx: string;
        inputsToSign?: BitcoinInputSigningConfig[];
        fromLocationPathname?: string;
      }>
    ) {
      state.tx = action.payload.tx;
      state.inputsToSign = action.payload.inputsToSign ?? null;
      state.fromLocationPathname = action.payload.fromLocationPathname ?? null;
      state.wentBack = false;
    },
    setLedgerMessageSigningState(
      state,
      action: PayloadAction<{
        messageType: SignedMessageType;
        message: string;
        domain?: number[];
      }>
    ) {
      state.messageType = action.payload.messageType;
      state.message = action.payload.message;
      state.domain = action.payload.domain ?? null;
    },
    setLedgerConnectionState(state, action: PayloadAction<{ chain: SupportedBlockchains }>) {
      state.chain = action.payload.chain;
    },
    setLedgerErrorState(
      state,
      action: PayloadAction<{
        chain: SupportedBlockchains;
        latestLedgerError?: string;
      }>
    ) {
      state.chain = action.payload.chain;
      state.latestLedgerError = action.payload.latestLedgerError ?? null;
    },
    setLedgerBroadcastError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setLedgerDescription(state, action: PayloadAction<string | undefined>) {
      state.description = action.payload ?? null;
    },
    setLedgerApprovedOperation(state, action: PayloadAction<boolean>) {
      state.hasApprovedOperation = action.payload;
    },
    setImmediatelyAttemptConnection(state, action: PayloadAction<boolean>) {
      state.immediatelyAttemptConnection = action.payload;
    },
    setLedgerWentBack(state) {
      state.wentBack = true;
    },
    setJwtAccountIndex(state, action: PayloadAction<number>) {
      state.jwtAccountIndex = action.payload;
    },
    resetLedgerNavigation() {
      return initialState;
    },
  },
});
