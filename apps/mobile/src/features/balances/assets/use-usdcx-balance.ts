import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { serializeAssetId } from '@leather.io/utils';

export function useUsdcxBalance({ fingerprint, accountIndex }: AccountId) {
  const { networkPreference, assetVisibility } = useSettings();
  const assetId =
    networkPreference.chain.bitcoin.mode === 'mainnet'
      ? USDCX_ASSET_ID_MAINNET
      : USDCX_ASSET_ID_TESTNET;
  const balance = useSip10BalanceByAssetId(fingerprint, accountIndex, assetId);
  const isVisible = assetVisibility[serializeAssetId({ protocol: 'sip10', id: assetId })] !== false;
  return { assetId, balance, isVisible };
}
