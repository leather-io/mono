import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { TokenIcon } from '@/features/balances/token-icon';
import { useReceiveFlowContext } from '@/features/receive/receive-flow-provider';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TestId } from '@/shared/test-id';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/macro';

import { assertExistence, truncateMiddle } from '@leather.io/utils';

import { ReceiveAssetItem } from '../components/receive-asset-item';
import { getAssets } from '../get-assets';
import { useCopyAddress, useReceiveNavigation, useReceiveRoute } from '../navigation';

export interface SelectedAsset {
  symbol: string;
  name: string;
  address: string;
  addressType?: string;
  description: string;
}

export function SelectAsset() {
  const { navigate, goBack } = useReceiveNavigation();
  const route = useReceiveRoute<'select-asset'>();
  const {
    selectAsset,
    state: { selectedAccount },
  } = useReceiveFlowContext();
  const canGoBack = route.params?.previousRoute === 'select-account';

  assertExistence(selectedAccount, "'Select asset' screen expects `selectedAccount` to exist.");

  function onSelectAsset(asset: SelectedAsset) {
    selectAsset(asset);
    if (selectedAccount) {
      navigate('asset-details', { asset, accountName: selectedAccount?.name });
    }
  }

  const { nativeSegwitPayerAddress, taprootPayerAddress } =
    useBitcoinPayerAddressFromAccountIndex(
      selectedAccount.fingerprint,
      selectedAccount.accountIndex
    ) ?? '';
  const stxAddress =
    useStacksSignerAddressFromAccountIndex(
      selectedAccount.fingerprint,
      selectedAccount.accountIndex
    ) ?? '';

  const assets = getAssets({ nativeSegwitPayerAddress, taprootPayerAddress, stxAddress });
  const onCopyAddress = useCopyAddress();

  return (
    <>
      <FullHeightSheetLayout
        header={
          <FullHeightSheetHeader
            title={t({
              id: 'select_asset.header_title',
              message: 'Select asset',
            })}
            subtitle={t({
              id: 'receive.select_asset.header_subtitle',
              message: 'Receive',
            })}
            leftElement={
              canGoBack ? <HeaderBackButton onPress={goBack} testID={TestId.backButton} /> : null
            }
            rightElement={<NetworkBadge />}
          />
        }
      >
        {assets.map(asset => (
          <ReceiveAssetItem
            key={asset.address}
            address={truncateMiddle(asset.address)}
            addressType={asset.addressType}
            name={asset.name}
            symbol={asset.symbol}
            icon={<TokenIcon ticker={asset.symbol} />}
            onCopy={() => onCopyAddress(asset.address)}
            onPress={() => onSelectAsset(asset)}
          />
        ))}
      </FullHeightSheetLayout>
    </>
  );
}
