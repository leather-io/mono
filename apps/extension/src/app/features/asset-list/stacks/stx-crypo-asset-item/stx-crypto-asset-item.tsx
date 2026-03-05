import { styled } from 'leather-styles/jsx';

import { stxAsset } from '@leather.io/constants';
import type { AddressQuotedStxBalance } from '@leather.io/services';
import { Button, Caption, StacksFilledCircleIcon, StxAvatarIcon } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { CryptoAssetItemLayout } from '@app/components/crypto-asset-item/crypto-asset-item.layout';

import { useCryptoAssetBuy } from '../../utils';

const stxAssetId = serializeAssetId(getAssetId(stxAsset));

interface StxCryptoAssetItemProps {
  balance: AddressQuotedStxBalance;
  isLoading: boolean;
  isPrivate?: boolean;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
}

export function StxCryptoAssetItem({
  balance,
  isLoading,
  isPrivate,
  onSelectAsset,
}: StxCryptoAssetItemProps) {
  const { onBuy, showBuyButton } = useCryptoAssetBuy(stxAsset);

  const { lockedBalance, totalBalance } = balance.stx;
  const showLockedBalance = lockedBalance.amount.isGreaterThan(0) && !isPrivate;

  const fiatLockedBalance = formatCurrency(balance.quote.lockedBalance);

  const fiatTotalBalance = formatCurrency(balance.quote.totalBalance);

  const titleRightBulletInfo = (
    <styled.span>{formatCurrency(lockedBalance, { showCurrency: false })} locked</styled.span>
  );
  const captionRightBulletInfo = <Caption>{fiatLockedBalance} locked</Caption>;

  return (
    <CryptoAssetItemLayout
      availableBalance={totalBalance}
      captionLeft="STX"
      captionRightBulletInfo={showLockedBalance && captionRightBulletInfo}
      fiatBalance={fiatTotalBalance}
      icon={<StxAvatarIcon size="xl" indicator={<StacksFilledCircleIcon variant="small" />} />}
      isLoading={isLoading}
      isPrivate={isPrivate}
      onSelectAsset={!showBuyButton && onSelectAsset ? () => onSelectAsset(stxAssetId) : undefined}
      rightElement={
        showBuyButton ? (
          <Button variant="outline" size="sm" onClick={onBuy}>
            Buy
          </Button>
        ) : undefined
      }
      titleLeft="Stacks"
      titleRightBulletInfo={showLockedBalance && titleRightBulletInfo}
      dataTestId="STX"
    />
  );
}
