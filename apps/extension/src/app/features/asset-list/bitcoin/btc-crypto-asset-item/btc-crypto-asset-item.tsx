import { CoreAssetSelectors } from '@tests/selectors/mocked-tokens.selectors';

import { btcAsset } from '@leather.io/constants';
import type { AccountQuotedBtcBalance } from '@leather.io/services';
import { BitcoinFilledCircleIcon, BtcAvatarIcon } from '@leather.io/ui';
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
  onSelectAsset,
  isLoadingAdditionalData,
  showDepositButtons,
}: BtcCryptoAssetItemProps) {
  const isPrivate = useIsPrivateMode();
  const { onBuy, showBuyButton } = useCryptoAssetBuy(btcAsset);

  const icon = <BtcAvatarIcon size="xl" indicator={<BitcoinFilledCircleIcon variant="small" />} />;
  const dataTestId = CoreAssetSelectors.BtcAsset;
  const titleLeft = 'Bitcoin';
  const captionLeft = 'BTC';

  if (showDepositButtons && showBuyButton) {
    return (
      <DepositItem
        onBuy={onBuy}
        dataTestId={dataTestId}
        buttonDataTestId={CoreAssetSelectors.BtcAssetBuyButton}
        titleLeft={titleLeft}
        icon={icon}
        captionLeft={captionLeft}
      />
    );
  }

  return (
    <CryptoAssetItemLayout
      availableBalance={balance.btc.totalBalance}
      captionLeft={captionLeft}
      fiatBalance={formatCurrency(balance.quote.totalBalance)}
      icon={icon}
      isLoading={isLoading}
      isLoadingAdditionalData={isLoadingAdditionalData}
      isPrivate={isPrivate}
      onSelectAsset={onSelectAsset ? () => onSelectAsset(btcAssetId) : undefined}
      titleLeft={titleLeft}
      dataTestId={dataTestId}
    />
  );
}
