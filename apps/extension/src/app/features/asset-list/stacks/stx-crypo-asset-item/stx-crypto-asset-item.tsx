import { styled } from 'leather-styles/jsx';

import { stxAsset } from '@leather.io/constants';
import type { TokenDetailsProps } from '@leather.io/features';
import type { AddressQuotedStxBalance } from '@leather.io/services';
import { Caption, StxAvatarIcon } from '@leather.io/ui';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { CryptoAssetItemLayout } from '@app/components/crypto-asset-item/crypto-asset-item.layout';

interface StxCryptoAssetItemProps {
  balance: AddressQuotedStxBalance;
  isLoading: boolean;
  isPrivate?: boolean;
  onSelectAsset?(symbol: string): void;
  onOpenToken?(details: TokenDetailsProps): void;
}

export function StxCryptoAssetItem({
  balance,
  isLoading,
  isPrivate,
  onSelectAsset,
  onOpenToken,
}: StxCryptoAssetItemProps) {
  const { lockedBalance, totalBalance } = balance.stx;
  const showLockedBalance = lockedBalance.amount.isGreaterThan(0) && !isPrivate;

  const fiatLockedBalance = formatCurrency(balance.quote.lockedBalance);

  const fiatTotalBalance = formatCurrency(balance.quote.totalBalance);

  const titleRightBulletInfo = (
    <styled.span>{formatCurrency(lockedBalance, { showCurrency: false })} locked</styled.span>
  );
  const captionRightBulletInfo = <Caption>{fiatLockedBalance} locked</Caption>;

  function handleSelectAsset(symbol: string) {
    if (onOpenToken) {
      onOpenToken({
        assetId: serializeAssetId(getAssetId(stxAsset)),
      });
      return;
    }
    onSelectAsset?.(symbol);
  }

  const onSelectAssetProp = onOpenToken || onSelectAsset ? handleSelectAsset : undefined;

  return (
    <CryptoAssetItemLayout
      availableBalance={totalBalance}
      captionLeft="STX"
      captionRightBulletInfo={showLockedBalance && captionRightBulletInfo}
      fiatBalance={fiatTotalBalance}
      icon={<StxAvatarIcon />}
      isLoading={isLoading}
      isPrivate={isPrivate}
      onSelectAsset={onSelectAssetProp}
      titleLeft="Stacks"
      titleRightBulletInfo={showLockedBalance && titleRightBulletInfo}
      dataTestId="STX"
    />
  );
}
