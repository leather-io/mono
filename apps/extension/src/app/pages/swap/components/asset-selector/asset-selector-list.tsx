import { Virtuoso } from 'react-virtuoso';

import { AccountSwapAsset } from '@leather.io/services';
import { AssetAvatarIcon, BitcoinIcon, StacksIcon } from '@leather.io/ui';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { getFungibleAssetDisplayName } from '@app/pages/swap/swap-utils';

import { AssetSelectorItem } from './asset-selector-item';

interface AssetSelectorListProps {
  assets?: AccountSwapAsset[];
  type: 'base' | 'target';
  onSelectAsset(type: 'base' | 'target', asset: AccountSwapAsset): void;
}

export function AssetSelectorList({ assets = [], type, onSelectAsset }: AssetSelectorListProps) {
  function computeItemKey(_: number, item: AccountSwapAsset) {
    return serializeAssetId(getAssetId(item.asset));
  }

  function itemContent(_: number, item: AccountSwapAsset) {
    return (
      <AssetSelectorItem
        name={getFungibleAssetDisplayName(item.asset)}
        symbol={item.asset.symbol}
        balance={item.balance?.crypto.availableBalance}
        quoteBalance={item.balance?.quote.availableBalance}
        icon={<AssetAvatarIcon asset={item.asset} indicator={getAssetIndicator(item.asset)} />}
        onPress={() => onSelectAsset(type, item)}
      />
    );
  }

  return (
    <Virtuoso
      style={{ flex: 1, height: '100%' }}
      data={assets}
      computeItemKey={computeItemKey}
      itemContent={itemContent}
      overscan={10}
      defaultItemHeight={72}
    />
  );
}

function getAssetIndicator(asset: AccountSwapAsset['asset']) {
  switch (asset.protocol) {
    case 'nativeBtc':
      return <BitcoinIcon variant="small" />;
    case 'nativeStx':
    case 'sip10':
      return <StacksIcon variant="small" />;
    default:
      return undefined;
  }
}
