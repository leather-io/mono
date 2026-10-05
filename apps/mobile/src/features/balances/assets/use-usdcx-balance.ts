import { useSip10Visibility } from '@/features/balances/assets/use-sip10-visibility';
import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';

export function useUsdcxBalance({ fingerprint, accountIndex }: AccountId) {
  const { networkPreference } = useSettings();
  const { isVisible } = useSip10Visibility();
  const assetId =
    networkPreference.chain.bitcoin.mode === 'mainnet'
      ? USDCX_ASSET_ID_MAINNET
      : USDCX_ASSET_ID_TESTNET;
  const balance = useSip10BalanceByAssetId(fingerprint, accountIndex, assetId);
  return { assetId, balance, isVisible: isVisible(assetId) };
}
