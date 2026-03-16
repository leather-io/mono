import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { Stack } from 'leather-styles/jsx';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import type { AccountId } from '@leather.io/models';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { type AssetFilter } from '@app/common/hooks/use-manage-tokens';
import {
  useManagedSip10Tools,
  useSip10AccountBalance,
} from '@app/query/stacks/sip10/sip10-balance.hooks';

import type { AssetRightElementVariant } from '../../token-list';
import { Sip10TokenItem } from './sip10-token-item';

function isUsdcxAssetId(assetId: string) {
  return assetId === USDCX_ASSET_ID_MAINNET || assetId === USDCX_ASSET_ID_TESTNET;
}

interface Sip10TokenAssetListProps {
  accountId: AccountId;
  assetFilter?: AssetFilter;
  assetRightElementVariant?: AssetRightElementVariant;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
  setHasManageableTokens?: Dispatch<SetStateAction<boolean>>;
}

export function Sip10TokenAssetList({
  accountId,
  assetFilter = 'all',
  onSelectAsset,
  assetRightElementVariant,
  setHasManageableTokens,
}: Sip10TokenAssetListProps) {
  const sip10s = useSip10AccountBalance(accountId, {
    includeHiddenAssets: assetFilter === 'all',
  });
  const { isEnabled } = useManagedSip10Tools(accountId);

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
          <Sip10TokenItem
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
