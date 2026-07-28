import { SBTC_ASSET_ID_MAINNET, SBTC_ASSET_ID_TESTNET } from '@leather.io/constants';
import { CryptoAssetId } from '@leather.io/models';
import { DisabledPairRule } from '@leather.io/state/swap';

import { useFlags } from '@app/features/feature-flags';

const btc: CryptoAssetId = { protocol: 'nativeBtc', id: 'BTC' };
const sbtcMainnet: CryptoAssetId = { protocol: 'sip10', id: SBTC_ASSET_ID_MAINNET };
const sbtcTestnet: CryptoAssetId = { protocol: 'sip10', id: SBTC_ASSET_ID_TESTNET };

export function useSwapDisabledPairs(): DisabledPairRule[] {
  const { swapSbtcBridging } = useFlags();

  if (swapSbtcBridging) return [];

  return [
    { base: btc, target: '*' },
    { base: sbtcMainnet, target: btc },
    { base: sbtcTestnet, target: btc },
  ];
}
