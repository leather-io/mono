import { ReactNode } from 'react';

import { SupportedAsset } from '@/features/swap/swap-state/swap-state.types';
import { formatCurrency } from '@/utils/currency-formatter';

import { Money, isBtcAsset, isSip10Asset, isStxAsset } from '@leather.io/models';
import { BtcAvatarIcon, Cell, Sip10AvatarIcon, StxAvatarIcon } from '@leather.io/ui/native';

interface AssetListItemProps {
  name: string;
  symbol: string;
  icon: ReactNode;
  balance?: Money;
  quoteBalance?: Money;
  onPress?: () => void;
}

export function AssetSelectorItem({
  balance,
  icon,
  name,
  quoteBalance,
  onPress,
}: AssetListItemProps) {
  return (
    <Cell.Root pressable={!!onPress} onPress={onPress}>
      <Cell.Icon>{icon}</Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{name}</Cell.Label>
        {balance && (
          <Cell.Label variant="primary" color="ink.text-subdued">
            {formatCurrency(balance)}
          </Cell.Label>
        )}
      </Cell.Content>
      <Cell.Aside>
        {quoteBalance && <Cell.Label variant="primary">{formatCurrency(quoteBalance)}</Cell.Label>}
      </Cell.Aside>
    </Cell.Root>
  );
}

interface AssetAvatarProps {
  asset: SupportedAsset;
}

export function AssetAvatar({ asset }: AssetAvatarProps) {
  if (isBtcAsset(asset)) {
    return <BtcAvatarIcon indicator />;
  }

  if (isStxAsset(asset)) {
    return <StxAvatarIcon indicator />;
  }

  if (isSip10Asset(asset)) {
    return (
      <Sip10AvatarIcon
        name={asset.name}
        contractId={asset.contractId}
        imageCanonicalUri={asset.imageCanonicalUri}
        indicator
      />
    );
  }

  return null;
}
