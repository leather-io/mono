import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { Stack } from 'leather-styles/jsx';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';

import { type AssetFilter } from '@app/common/hooks/use-manage-tokens';
import {
  useManagedSip10Tools,
  useSip10AccountBalance,
} from '@app/query/stacks/sip10/sip10-balance.hooks';

import type { AssetRightElementVariant } from '../../asset-list';
import { Sip10TokenAssetItem } from './sip10-token-asset-item';

function isUsdcxAssetId(assetId: string) {
  return assetId === USDCX_ASSET_ID_MAINNET || assetId === USDCX_ASSET_ID_TESTNET;
}

interface Sip10TokenAssetListProps {
  accountIndex: number;
  assetFilter?: AssetFilter;
  assetRightElementVariant?: AssetRightElementVariant;
  onSelectAsset?(symbol: string, contractId?: string): void;
  setHasManageableTokens?: Dispatch<SetStateAction<boolean>>;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
}

export function Sip10TokenAssetList({
  accountIndex,
  assetFilter = 'all',
  onSelectAsset,
  assetRightElementVariant,
  setHasManageableTokens,
  setIsLoading,
}: Sip10TokenAssetListProps) {
  const sip10s = useSip10AccountBalance(accountIndex, {
    includeHiddenAssets: assetFilter === 'all',
  });
  const { isEnabled } = useManagedSip10Tools(accountIndex);

  useEffect(() => {
    if (setIsLoading) {
      setIsLoading(sip10s.state !== 'success' && !sip10s.value);
    }
  }, [sip10s.state, sip10s.value, setIsLoading]);

  useEffect(() => {
    if (sip10s.value && sip10s.value.sip10s.length > 0 && setHasManageableTokens) {
      setHasManageableTokens(true);
    }
  }, [sip10s, setHasManageableTokens]);

  if (sip10s.state !== 'success' && !sip10s.value) return null;

  return (
    <Stack>
      {sip10s.value.sip10s
        .filter(sip10 => !isUsdcxAssetId(sip10.asset.assetId))
        .map(sip10 => (
          <Sip10TokenAssetItem
            key={sip10.asset.assetId}
            assetRightElementVariant={assetRightElementVariant}
            balance={sip10}
            isEnabled={isEnabled(sip10)}
            onSelectAsset={onSelectAsset}
          />
        ))}
    </Stack>
  );
}
