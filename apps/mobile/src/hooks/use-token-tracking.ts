import { useEffect } from 'react';

import {
  isSupportedFungibleAssetProtocol,
  isSupportedNonFungibleAssetProtocol,
} from '@/features/token/types';
import { analytics } from '@/utils/analytics';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { AccountId, type CryptoAssetProtocol } from '@leather.io/models';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

interface UseTokenTrackingProps {
  currentAccount: AccountId;
  assetId: SerializedCryptoAssetId;
  assetProtocol: CryptoAssetProtocol;
}
export function useTokenTracking({
  currentAccount,
  assetId,
  assetProtocol,
}: UseTokenTrackingProps) {
  const walletAccountId = makeAccountIdentifer(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );
  const isToken = isSupportedFungibleAssetProtocol(assetProtocol);
  const isCollectible = isSupportedNonFungibleAssetProtocol(assetProtocol);
  useEffect(() => {
    if (!assetId) return;
    if (isToken) {
      analytics.track('token_details_viewed', {
        assetId,
        protocol: assetProtocol,
        platform: 'mobile',
        walletAccountId,
      });
    } else if (isCollectible) {
      analytics.track('collectible_details_viewed', {
        assetId,
        protocol: assetProtocol,
        platform: 'mobile',
        walletAccountId,
      });
    }
  }, [assetId, assetProtocol, walletAccountId, isToken, isCollectible]);
}
