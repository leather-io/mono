import { btcAsset } from '@leather.io/constants';
import type { AccountQuotedBtcBalance } from '@leather.io/services';
import { BitcoinFilledCircleIcon, BtcAvatarIcon } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { CryptoAssetItemLayout } from '@app/components/crypto-asset-item/crypto-asset-item.layout';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

const btcAssetId = serializeAssetId(getAssetId(btcAsset));

interface BtcCryptoAssetItemProps {
  balance: AccountQuotedBtcBalance;
  isLoading: boolean;
  isLoadingAdditionalData?: boolean;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
}
export function BtcCryptoAssetItem({
  balance,
  isLoading,
  onSelectAsset,
  isLoadingAdditionalData,
}: BtcCryptoAssetItemProps) {
  const isPrivate = useIsPrivateMode();

  return (
    <CryptoAssetItemLayout
      availableBalance={balance.btc.totalBalance}
      captionLeft="BTC"
      fiatBalance={formatCurrency(balance.quote.totalBalance)}
      icon={<BtcAvatarIcon size="xl" indicator={<BitcoinFilledCircleIcon variant="small" />} />}
      isLoading={isLoading}
      isLoadingAdditionalData={isLoadingAdditionalData}
      isPrivate={isPrivate}
      onSelectAsset={onSelectAsset ? () => onSelectAsset(btcAssetId) : undefined}
      titleLeft="Bitcoin"
      dataTestId="BTC"
    />
  );
}
