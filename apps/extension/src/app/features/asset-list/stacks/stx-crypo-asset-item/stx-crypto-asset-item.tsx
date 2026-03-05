import { CoreAssetSelectors } from '@tests/selectors/mocked-tokens.selectors';
import { styled } from 'leather-styles/jsx';

import { stxAsset } from '@leather.io/constants';
import type { AddressQuotedStxBalance } from '@leather.io/services';
import { Caption, StacksFilledCircleIcon, StxAvatarIcon } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { CryptoAssetItemLayout } from '@app/components/crypto-asset-item/crypto-asset-item.layout';
import { DepositItem } from '@app/components/deposit-item/deposit-item';

import { useCryptoAssetBuy } from '../../utils';

const stxAssetId = serializeAssetId(getAssetId(stxAsset));

interface StxCryptoAssetItemProps {
  balance: AddressQuotedStxBalance;
  isLoading: boolean;
  isPrivate?: boolean;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
  showDepositButtons?: boolean;
}

export function StxCryptoAssetItem({
  balance,
  isLoading,
  isPrivate,
  onSelectAsset,
  showDepositButtons,
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

  const icon = <StxAvatarIcon size="xl" indicator={<StacksFilledCircleIcon variant="small" />} />;
  const dataTestId = CoreAssetSelectors.StxAsset;
  const titleLeft = 'Stacks';
  const captionLeft = 'STX';

  if (showDepositButtons && showBuyButton) {
    return (
      <DepositItem
        onBuy={onBuy}
        dataTestId={dataTestId}
        buttonDataTestId={CoreAssetSelectors.StxAssetBuyButton}
        titleLeft={titleLeft}
        icon={icon}
        captionLeft={captionLeft}
      />
    );
  }

  return (
    <CryptoAssetItemLayout
      availableBalance={totalBalance}
      captionLeft={captionLeft}
      captionRightBulletInfo={showLockedBalance && captionRightBulletInfo}
      fiatBalance={fiatTotalBalance}
      icon={icon}
      isLoading={isLoading}
      isPrivate={isPrivate}
      onSelectAsset={onSelectAsset ? () => onSelectAsset(stxAssetId) : undefined}
      titleLeft={titleLeft}
      titleRightBulletInfo={showLockedBalance && titleRightBulletInfo}
      dataTestId={dataTestId}
    />
  );
}
