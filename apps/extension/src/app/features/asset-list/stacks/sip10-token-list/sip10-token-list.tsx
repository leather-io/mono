import { type Dispatch, type ReactNode, type SetStateAction, useEffect } from 'react';

import { Stack } from 'leather-styles/jsx';
import { partition } from 'remeda';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import type { AccountId } from '@leather.io/models';
import type { Sip10Balance } from '@leather.io/services';
import {
  type SerializedCryptoAssetId,
  isPinnedAsset,
  sortByPinnedAssetOrder,
} from '@leather.io/utils';

import { CryptoAssetItemPlaceholder } from '@app/components/crypto-asset-item/crypto-asset-item-placeholder';
import {
  useManagedSip10Tools,
  useSip10AccountBalance,
} from '@app/query/stacks/sip10/sip10-balance.hooks';

import type { AssetFilter, AssetRightElementVariant } from '../../token-list';
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
  usdcxItem?: ReactNode;
}

export function Sip10TokenAssetList({
  accountId,
  assetFilter = 'all',
  onSelectAsset,
  assetRightElementVariant,
  setHasManageableTokens,
  usdcxItem,
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

  const [pinnedSip10s, otherSip10s] = partition(
    sortByPinnedAssetOrder(
      (sip10s.value?.sip10s ?? []).filter(sip10 => !isUsdcxAssetId(sip10.asset.assetId))
    ),
    sip10 => isPinnedAsset(sip10.asset)
  );

  function renderSip10(sip10: Sip10Balance) {
    return (
      <Sip10TokenItem
        key={sip10.asset.assetId}
        assetRightElementVariant={assetRightElementVariant}
        balance={sip10}
        isEnabled={isEnabled(sip10)}
        onSelectAsset={onSelectAsset}
      />
    );
  }

  return (
    <Stack>
      {pinnedSip10s.map(renderSip10)}
      {sip10s.state === 'loading' && usdcxItem ? <CryptoAssetItemPlaceholder /> : usdcxItem}
      {otherSip10s.map(renderSip10)}
    </Stack>
  );
}
