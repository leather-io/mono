import { CoreAssetSelectors } from '@tests/selectors/mocked-tokens.selectors';

import { STACKS_BRIDGE_URL } from '@leather.io/constants';
import type { Sip10Balance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { getSafeImageCanonicalUri } from '@app/common/stacks-utils';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { DepositItem } from '@app/components/deposit-item/deposit-item';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

import type { AssetRightElementVariant } from '../../token-list';
import { Sip10TokenItem } from '../sip10-token-list/sip10-token-item';

interface UsdcxCryptoAssetItemProps {
  balance: Sip10Balance;
  assetRightElementVariant?: AssetRightElementVariant;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
  showDepositButtons?: boolean;
}

export function UsdcxCryptoAssetItem({
  balance,
  assetRightElementVariant,
  onSelectAsset,
  showDepositButtons,
}: UsdcxCryptoAssetItemProps) {
  const { isMainnet } = useCurrentNetworkState();
  const hasNoBalance = balance.crypto.totalBalance.amount.isZero();

  if (showDepositButtons && hasNoBalance && isMainnet) {
    const { contractId, assetId, imageCanonicalUri, name, symbol } = balance.asset;
    return (
      <DepositItem
        buttonLabel="Bridge"
        onBuy={() => openInNewTab(STACKS_BRIDGE_URL)}
        dataTestId={assetId}
        buttonDataTestId={CoreAssetSelectors.UsdcxAssetBridgeButton}
        titleLeft={name}
        captionLeft={symbol}
        icon={
          <Sip10AvatarIcon
            indicator="stacksIcon"
            contractId={contractId}
            imageCanonicalUri={getSafeImageCanonicalUri(imageCanonicalUri, name) ?? ''}
            name={name}
            size="xl"
          />
        }
        onSelectAsset={
          onSelectAsset
            ? () => onSelectAsset(serializeAssetId(getAssetId(balance.asset)))
            : undefined
        }
      />
    );
  }

  return (
    <Sip10TokenItem
      balance={balance}
      isEnabled={true}
      onSelectAsset={onSelectAsset}
      assetRightElementVariant={assetRightElementVariant}
    />
  );
}
