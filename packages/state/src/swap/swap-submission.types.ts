import type { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';

import type { SwapSubmissionResult } from './swap-state.types';

export interface SwapSubmissionQuoteSnapshot {
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
}

export interface SwapAttention {
  reason: Exclude<SwapSubmissionResult['status'], 'submitted'>;
  txid: string;
}

export type SwapSubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' | 'success' | 'failure'; quote: SwapSubmissionQuoteSnapshot }
  | { status: 'needs-attention'; quote: SwapSubmissionQuoteSnapshot; attention: SwapAttention };
