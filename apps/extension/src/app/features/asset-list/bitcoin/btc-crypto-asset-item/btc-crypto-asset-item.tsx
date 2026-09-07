import { CoreAssetSelectors } from '@tests/selectors/mocked-tokens.selectors';
import { styled } from 'leather-styles/jsx';

import { btcAsset } from '@leather.io/constants';
import type { AccountQuotedBtcBalance } from '@leather.io/services';
import { BitcoinFilledCircleIcon, BtcAvatarIcon, Caption } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { CryptoAssetItemLayout } from '@app/components/crypto-asset-item/crypto-asset-item.layout';
import { DepositItem } from '@app/components/deposit-item/deposit-item';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

import { useCryptoAssetBuy } from '../../utils';

const btcAssetId = serializeAssetId(getAssetId(btcAsset));

interface BtcCryptoAssetItemProps {
  balance: AccountQuotedBtcBalance;
  isLoading: boolean;
  isLoadingAdditionalData?: boolean;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
  showDepositButtons?: boolean;
}
export function BtcCryptoAssetItem({
  balance,
  isLoading,
  onSelectAsset: _onSelectAsset,
  isLoadingAdditionalData,
  showDepositButtons,
}: BtcCryptoAssetItemProps) {
  const isPrivate = useIsPrivateMode();
  const { onBuy, showBuyButton } = useCryptoAssetBuy(btcAsset);

  const { lockedBalance, totalBalance } = balance.btc;
  const showLockedBalance = lockedBalance.amount.isGreaterThan(0) && !isPrivate;
  const titleRightBulletInfo = (
    <styled.span>{formatCurrency(balance.quote.lockedBalance)} locked</styled.span>
  );
  const captionRightBulletInfo = (
    <Caption>{formatCurrency(lockedBalance, { showCurrency: false })} locked</Caption>
  );

  const icon = <BtcAvatarIcon size="xl" indicator={<BitcoinFilledCircleIcon variant="small" />} />;
  const dataTestId = CoreAssetSelectors.BtcAsset;
  const titleLeft = 'Bitcoin';
  const captionLeft = 'BTC';
  const onSelectAsset = _onSelectAsset ? () => _onSelectAsset(btcAssetId) : undefined;

  if (showDepositButtons && showBuyButton) {
    return (
      <DepositItem
        onBuy={onBuy}
        dataTestId={dataTestId}
        buttonDataTestId={CoreAssetSelectors.BtcAssetBuyButton}
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
      fiatBalance={formatCurrency(balance.quote.totalBalance)}
      icon={icon}
      isLoading={isLoading}
      isLoadingAdditionalData={isLoadingAdditionalData}
      isPrivate={isPrivate}
      onSelectAsset={onSelectAsset}
      titleLeft={titleLeft}
      titleRightBulletInfo={showLockedBalance && titleRightBulletInfo}
      dataTestId={dataTestId}
    />
  );
}
