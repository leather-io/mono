import type { Sip10Balance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { getSafeImageCanonicalUri } from '@app/common/stacks-utils';
import { CryptoAssetItem } from '@app/components/crypto-asset-item/crypto-asset-item';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

import type { AssetRightElementVariant } from '../../token-list';

interface Sip10TokenItemProps {
  balance: Sip10Balance;
  isEnabled: boolean;
  assetRightElementVariant?: AssetRightElementVariant;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
}
export function Sip10TokenItem({
  balance,
  isEnabled,
  onSelectAsset,
  assetRightElementVariant,
}: Sip10TokenItemProps) {
  const isPrivate = useIsPrivateMode();

  const { contractId, assetId, imageCanonicalUri, name, symbol } = balance.asset;

  const safeImageCanonicalUri = getSafeImageCanonicalUri(imageCanonicalUri, name);

  const icon = (
    <Sip10AvatarIcon
      indicator="stacksIcon"
      contractId={contractId}
      imageCanonicalUri={safeImageCanonicalUri}
      name={name}
      size="xl"
    />
  );

  const captionLeft = symbol;
  const titleLeft = name;

  return (
    <CryptoAssetItem
      isToggleMode={assetRightElementVariant === 'toggle'}
      toggleProps={{
        captionLeft,
        icon,
        titleLeft,
        assetId,
        isCheckedByDefault: isEnabled,
      }}
      itemProps={{
        contractId,
        availableBalance: balance.crypto.availableBalance,
        captionLeft,
        icon,
        isPrivate,
        titleLeft,
        fiatBalance: formatCurrency(balance.quote.availableBalance),
        dataTestId: assetId,
        onSelectAsset: onSelectAsset
          ? () => onSelectAsset(serializeAssetId(getAssetId(balance.asset)))
          : undefined,
      }}
    />
  );
}
