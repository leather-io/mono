import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { InscriptionAsset, OwnedUtxo } from '@leather.io/models';

import type { BitcoinSendFormValues } from '@shared/models/form.model';

interface BtcChooseFeeState {
  isSendingMax: boolean;
  utxos: OwnedUtxo[];
  values: BitcoinSendFormValues;
}

interface BtcConfirmationState {
  tx: string;
  recipient: string;
  fee: number;
  feeRowValue: string;
  time: string;
}

interface StxConfirmationState {
  tx: string;
  showFeeChangeWarning: boolean;
  decimals?: number;
  token?: string;
}

interface InscriptionFlowState {
  inscription: InscriptionAsset | null;
  recipient: string;
  utxo: unknown;
  fee: number;
  feeRowValue: string;
  time: string;
  signedTx: number[] | null;
  txid: string;
}

interface SendFormRouteState {
  amount: string;
  recipient: string;
}

interface BtcSentSummaryState {
  txId: string;
  txValue: string;
  txFiatValue: string;
  txFiatValueSymbol: string;
  symbol: string;
  txLink: { blockchain: string; txid: string };
  arrivesIn: string;
  sendingValue: string;
  recipient: string;
  totalSpend: string;
  feeRowValue: string;
}

interface SendNavigationState {
  btcChooseFee: BtcChooseFeeState | null;
  btcConfirmation: BtcConfirmationState | null;
  stxConfirmation: StxConfirmationState | null;
  inscriptionFlow: InscriptionFlowState | null;
  sendFormRouteState: SendFormRouteState | null;
  btcSentSummary: BtcSentSummaryState | null;
  error: unknown;
}

const initialState: SendNavigationState = {
  btcChooseFee: null,
  btcConfirmation: null,
  stxConfirmation: null,
  inscriptionFlow: null,
  sendFormRouteState: null,
  btcSentSummary: null,
  error: null,
};

export const sendNavigationSlice = createSlice({
  name: 'sendNavigation',
  initialState,
  reducers: {
    setBtcChooseFeeState(state, action: PayloadAction<BtcChooseFeeState>) {
      state.btcChooseFee = action.payload;
    },
    setBtcConfirmationState(state, action: PayloadAction<BtcConfirmationState>) {
      state.btcConfirmation = action.payload;
    },
    setStxConfirmationState(state, action: PayloadAction<StxConfirmationState>) {
      state.stxConfirmation = action.payload;
    },
    setInscriptionFlowState(state, action: PayloadAction<Partial<InscriptionFlowState>>) {
      state.inscriptionFlow = {
        inscription: null,
        recipient: '',
        utxo: null,
        fee: 0,
        feeRowValue: '',
        time: '',
        signedTx: null,
        txid: '',
        ...state.inscriptionFlow,
        ...action.payload,
      };
    },
    setSendFormRouteState(state, action: PayloadAction<SendFormRouteState>) {
      state.sendFormRouteState = action.payload;
    },
    setBtcSentSummaryState(state, action: PayloadAction<BtcSentSummaryState>) {
      state.btcSentSummary = action.payload;
    },
    setSendError(state, action: PayloadAction<unknown>) {
      state.error = action.payload;
    },
    resetSendNavigation() {
      return initialState;
    },
  },
});
