import { btcAsset } from '@leather.io/constants';
import { createMoney, getAssetId } from '@leather.io/utils';

import { type DisabledPairRule } from './swap-state.types';

export const BITCOIN_EXCLUSION_PAIR_RULES: DisabledPairRule[] = [
  { base: getAssetId(btcAsset), target: '*' },
  { base: '*', target: getAssetId(btcAsset) },
];

export const DEFAULT_SLIPPAGE_PERCENTAGE = 0.03;
export const MIN_SLIPPAGE_PERCENTAGE = 0.005;
export const MAX_SLIPPAGE_PERCENTAGE = 0.1;

export const PER_DEX_FEE_PERCENTAGE = 0.003;

export const STX_SAFETY_BUFFER = createMoney(500_000, 'STX');

export const PRICE_IMPACT_WARNING_THRESHOLD = 0.03;
export const PRICE_IMPACT_DANGER_THRESHOLD = 0.1;

export const DUMMY_P2TR_RECIPIENT =
  'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0';

export const SWAP_SUBMISSION_DISPLAY_DURATION_MS = 1800;
export const SWAP_SUCCESS_EXIT_TIMEOUT_MS = 1200;
export const SWAP_ACCIDENTAL_TAP_SUPPRESSION_MS = 500;
