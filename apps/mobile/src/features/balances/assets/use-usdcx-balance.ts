import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';
import { isAllowedByDefaultAssetVisibility } from '@/store/settings/token-preset';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import { type AccountId } from '@leather.io/models';
import { serializeAssetId } from '@leather.io/utils';

function useUsdcxVisibility() {
  const { networkPreference, assetVisibility, defaultAssetVisibility } = useSettings();
  const isMainnet = networkPreference.chain.bitcoin.mode === 'mainnet';
  const assetId = isMainnet ? USDCX_ASSET_ID_MAINNET : USDCX_ASSET_ID_TESTNET;
  const serializedAssetId = serializeAssetId({ protocol: 'sip10', id: assetId });
  const isVisible =
    assetVisibility[serializedAssetId] ??
    isAllowedByDefaultAssetVisibility(defaultAssetVisibility, serializedAssetId);
  return { assetId, isMainnet, isVisible };
}

export function useUsdcxBalance({ fingerprint, accountIndex }: AccountId) {
  const { assetId, isMainnet, isVisible } = useUsdcxVisibility();
  const balance = useSip10BalanceByAssetId(fingerprint, accountIndex, assetId);
  return { assetId, balance, isMainnet, isVisible };
}
