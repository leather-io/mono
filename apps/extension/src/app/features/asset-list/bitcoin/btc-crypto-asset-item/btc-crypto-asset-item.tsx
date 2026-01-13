import { btcAsset } from '@leather.io/constants';
import type { TokenDetailsProps } from '@leather.io/features';
import type { AccountQuotedBtcBalance } from '@leather.io/services';
import { BtcAvatarIcon } from '@leather.io/ui';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { CryptoAssetItemLayout } from '@app/components/crypto-asset-item/crypto-asset-item.layout';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

interface BtcCryptoAssetItemProps {
  balance: AccountQuotedBtcBalance;
  isLoading: boolean;
  isLoadingAdditionalData?: boolean;
  onSelectAsset?(symbol: string): void;
  onOpenToken?(details: TokenDetailsProps): void;
}
export function BtcCryptoAssetItem({
  balance,
  isLoading,
  onSelectAsset,
  onOpenToken,
  isLoadingAdditionalData,
}: BtcCryptoAssetItemProps) {
  const isPrivate = useIsPrivateMode();

  function handleSelectAsset(symbol: string) {
    if (onOpenToken) {
      onOpenToken({
        assetId: serializeAssetId(getAssetId(btcAsset)),
      });
      return;
    }
    onSelectAsset?.(symbol);
  }

  const onSelectAssetProp = onOpenToken || onSelectAsset ? handleSelectAsset : undefined;

  return (
    <CryptoAssetItemLayout
      availableBalance={balance.btc.totalBalance}
      captionLeft="BTC"
      fiatBalance={formatCurrency(balance.quote.totalBalance)}
      icon={<BtcAvatarIcon />}
      isLoading={isLoading}
      isLoadingAdditionalData={isLoadingAdditionalData}
      isPrivate={isPrivate}
      onSelectAsset={onSelectAssetProp}
      titleLeft="Bitcoin"
      dataTestId="BTC"
    />
  );
}
