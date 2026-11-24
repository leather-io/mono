import { CoreAssetSelectors } from '@tests/selectors/mocked-tokens.selectors';

import { stxAsset } from '@leather.io/constants';
import type { AddressQuotedStxBalance } from '@leather.io/services';
import { StacksFilledCircleIcon, StxAvatarIcon } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { LockedBalanceBadge } from '@app/components/balance/locked-balance-badge';
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

  const fiatTotalBalance = formatCurrency(balance.quote.totalBalance);

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
      captionRightBadge={showLockedBalance && <LockedBalanceBadge balance={lockedBalance} />}
      fiatBalance={fiatTotalBalance}
      icon={icon}
      isLoading={isLoading}
      isPrivate={isPrivate}
      onSelectAsset={onSelectAsset}
      titleLeft={titleLeft}
      dataTestId={dataTestId}
    />
  );
}
