import { ReactNode } from 'react';

import { formatCurrency } from '@/utils/currency-formatter';

import {
  FungibleCryptoAsset,
  Money,
  isBtcAsset,
  isSip10Asset,
  isStxAsset,
} from '@leather.io/models';
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
        {balance && <Cell.Label variant="primary">{formatCurrency(balance)}</Cell.Label>}
      </Cell.Content>
      <Cell.Aside>
        {quoteBalance && <Cell.Label variant="primary">{formatCurrency(quoteBalance)}</Cell.Label>}
      </Cell.Aside>
    </Cell.Root>
  );
}

interface AssetAvatarProps {
  asset: FungibleCryptoAsset;
}

export function AssetAvatar({ asset }: AssetAvatarProps) {
  if (isBtcAsset(asset)) {
    return <BtcAvatarIcon />;
  }

  if (isStxAsset(asset)) {
    return <StxAvatarIcon />;
  }

  if (isSip10Asset(asset)) {
    return (
      <Sip10AvatarIcon
        name={asset.name}
        contractId={asset.contractId}
        imageCanonicalUri={asset.imageCanonicalUri}
      />
    );
  }

  return null;
}
