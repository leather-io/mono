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
  onSelectAsset: _onSelectAsset,
  showDepositButtons,
}: StxCryptoAssetItemProps) {
  const { onBuy, showBuyButton } = useCryptoAssetBuy(stxAsset);

  const { lockedBalance, totalBalance } = balance.stx;
  const showLockedBalance = lockedBalance.amount.isGreaterThan(0) && !isPrivate;

  const fiatLockedBalance = formatCurrency(balance.quote.lockedBalance);

  const fiatTotalBalance = formatCurrency(balance.quote.totalBalance);

  const titleRightBulletInfo = <styled.span>{fiatLockedBalance} locked</styled.span>;
  const captionRightBulletInfo = (
    <Caption>{formatCurrency(lockedBalance, { showCurrency: false })} locked</Caption>
  );

  const icon = <StxAvatarIcon size="xl" indicator={<StacksFilledCircleIcon variant="small" />} />;
  const dataTestId = CoreAssetSelectors.StxAsset;
  const titleLeft = 'Stacks';
  const captionLeft = 'STX';
  const onSelectAsset = _onSelectAsset ? () => _onSelectAsset(stxAssetId) : undefined;

  if (showDepositButtons && showBuyButton) {
    return (
      <DepositItem
        onBuy={onBuy}
        dataTestId={dataTestId}
        buttonDataTestId={CoreAssetSelectors.StxAssetBuyButton}
        titleLeft={titleLeft}
        icon={icon}
        captionLeft={captionLeft}
        onSelectAsset={onSelectAsset}
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
      onSelectAsset={onSelectAsset}
      titleLeft={titleLeft}
      titleRightBulletInfo={showLockedBalance && titleRightBulletInfo}
      dataTestId={dataTestId}
    />
  );
}
