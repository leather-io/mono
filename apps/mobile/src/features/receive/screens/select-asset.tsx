import { useEffect } from 'react';

import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { useReceiveFlowContext } from '@/features/receive/receive-flow-provider';
import { useCopyAddress } from '@/hooks/use-copy-address';
import { TestId } from '@/shared/test-id';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';
import { isDefined } from 'remeda';

import { assertExistence } from '@leather.io/utils';

import { ReceiveAssetItem } from '../components/receive-asset-item';
import { AssetType, getAssets } from '../get-assets';
import { useReceiveNavigation, useReceiveRoute } from '../navigation';
import { useSelectAssets } from '../use-select-assets';

export interface SelectedAsset {
  symbol: string;
  name: string;
  address: string;
  addressType?: string;
  description: string;
}

interface SelectAssetProps {
  assetType?: AssetType;
  tokenId?: string;
}
export function SelectAsset({ assetType, tokenId }: SelectAssetProps) {
  const { navigate, goBack } = useReceiveNavigation();
  const route = useReceiveRoute<'select-asset'>();
  const {
    selectAsset,
    state: { selectedAccount },
  } = useReceiveFlowContext();
  const canGoBack = route.params?.previousRoute === 'select-account';

  assertExistence(selectedAccount, "'Select asset' screen expects `selectedAccount` to exist.");

  const selectedAssets = useSelectAssets({ selectedAccount, tokenId, assetType });
  useEffect(() => {
    // BTC users need to choose taproot or native segwit address
    if (isDefined(selectedAssets) && selectedAssets.length === 1) {
      navigate('asset-details', { asset: selectedAssets[0]!, accountName: selectedAccount?.name });
    }
  }, []);

  function onSelectAsset(asset: SelectedAsset) {
    selectAsset(asset);
    if (selectedAccount) {
      navigate('asset-details', {
        asset,
        accountName: selectedAccount?.name,
        previousRoute: 'select-asset',
      });
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
  const filteredAssets = selectedAssets ? selectedAssets : assets;
  const onCopyAddress = useCopyAddress();

  function handleCopyAddress(asset: SelectedAsset) {
    analytics.track('receive_address_copied', { asset: asset.name, location: 'list_item' });
    void onCopyAddress(asset.address);
  }

  return (
    <>
      <FullHeightSheetLayout
        header={
          <FullHeightSheetHeader
            title={t`Select asset`}
            subtitle={t`Receive`}
            leftElement={
              canGoBack ? <HeaderBackButton onPress={goBack} testID={TestId.backButton} /> : null
            }
          />
        }
      >
        {filteredAssets.map(asset => (
          <ReceiveAssetItem
            key={asset.address}
            asset={asset}
            onCopyAddress={handleCopyAddress}
            onPress={() => onSelectAsset(asset)}
          />
        ))}
      </FullHeightSheetLayout>
    </>
  );
}
