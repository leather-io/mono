import { SBTC_ASSET_ID_MAINNET, SBTC_ASSET_ID_TESTNET } from '@leather.io/constants';
import { CryptoAssetId } from '@leather.io/models';
import { BITCOIN_EXCLUSION_PAIR_RULES, DisabledPairRule } from '@leather.io/state/swap';

import { useFlags } from '@app/features/feature-flags';
import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

const btc: CryptoAssetId = { protocol: 'nativeBtc', id: 'BTC' };
const sbtcMainnet: CryptoAssetId = { protocol: 'sip10', id: SBTC_ASSET_ID_MAINNET };
const sbtcTestnet: CryptoAssetId = { protocol: 'sip10', id: SBTC_ASSET_ID_TESTNET };

export function useSwapDisabledPairs(): DisabledPairRule[] {
  const { swapSbtcBridging } = useFlags();
  const hasBitcoinPayer = Boolean(useCurrentAccountNativeSegwitPayer());

  const rules: DisabledPairRule[] = [];

  if (!swapSbtcBridging) {
    rules.push(
      { base: btc, target: '*' },
      { base: sbtcMainnet, target: btc },
      { base: sbtcTestnet, target: btc }
    );
  }

  if (!hasBitcoinPayer) {
    rules.push(...BITCOIN_EXCLUSION_PAIR_RULES);
  }

  return rules;
}
