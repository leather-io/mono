import { useSwapSbtcBridgingFlag } from '@/features/feature-flags';

import { SBTC_ASSET_ID_MAINNET, SBTC_ASSET_ID_TESTNET } from '@leather.io/constants';
import { CryptoAssetId } from '@leather.io/models';
import { DisabledPairRule } from '@leather.io/state/swap';

const btc: CryptoAssetId = { protocol: 'nativeBtc', id: 'BTC' };
const sbtcMainnet: CryptoAssetId = { protocol: 'sip10', id: SBTC_ASSET_ID_MAINNET };
const sbtcTestnet: CryptoAssetId = { protocol: 'sip10', id: SBTC_ASSET_ID_TESTNET };

export function useSwapDisabledPairs(): DisabledPairRule[] {
  const sbtcBridgingEnabled = useSwapSbtcBridgingFlag();

  if (sbtcBridgingEnabled) return [];

  return [
    { base: btc, target: '*' },
    { base: sbtcMainnet, target: btc },
    { base: sbtcTestnet, target: btc },
  ];
}
