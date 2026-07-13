import { styled } from 'leather-styles/jsx';
import type { VaultAssetItem } from '~/features/multisig/assets/vault-asset-items';
import { formatCurrency } from '~/utils/currency-formatter';

import { AssetAvatarIcon, ListItemBox } from '@leather.io/ui';

interface VaultAssetRowProps {
  item: VaultAssetItem;
  onClick?(): void;
}

export function VaultAssetRow({ item, onClick }: VaultAssetRowProps) {
  return (
    <ListItemBox
      flush
      onClick={onClick}
      leading={<AssetAvatarIcon asset={item.asset} size="lg" />}
      title={
        <styled.span
          textStyle="label.02"
          color="ink.text-primary"
          display="block"
          minWidth={0}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {item.asset.name}
        </styled.span>
      }
      caption={item.asset.symbol}
      trailing={
        <styled.span textStyle="label.02" color="ink.text-primary" whiteSpace="nowrap">
          {formatCurrency(item.fiat)}
        </styled.span>
      }
      trailingCaption={
        <styled.span textStyle="caption.01" color="ink.text-subdued" whiteSpace="nowrap">
          {formatCurrency(item.crypto)}
        </styled.span>
      }
    />
  );
}
