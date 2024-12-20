import { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { useToastContext } from '@/components/toast/toast-context';
import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TestId } from '@/shared/test-id';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import * as Clipboard from 'expo-clipboard';

import { truncateMiddle } from '@leather.io/utils';

import {
  CreateCurrentReceiveRoute,
  useReceiveSheetNavigation,
  useReceiveSheetRoute,
} from '../utils';
import { getAssets } from './get-assets';
import { ReceiveAssetItem } from './receive-asset-item';
import { ReceiveAssetSheet } from './receive-asset-sheet';

type CurrentRoute = CreateCurrentReceiveRoute<'receive-select-asset'>;

export interface SelectedAsset {
  assetSymbol: string;
  assetName: string;
  address: string;
  addressType: string | undefined;
  assetDescription: string;
}

export function SelectAsset() {
  const { i18n } = useLingui();
  const route = useReceiveSheetRoute<CurrentRoute>();
  const { displayToast } = useToastContext();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);

  const account = route.params.account;
  const { name } = account;
  const navigation = useReceiveSheetNavigation();
  const { nativeSegwitPayerAddress, taprootPayerAddress } =
    useBitcoinPayerAddressFromAccountIndex(account.fingerprint, account.accountIndex) ?? '';
  const stxAddress =
    useStacksSignerAddressFromAccountIndex(account.fingerprint, account.accountIndex) ?? '';

  const assets = getAssets({ nativeSegwitPayerAddress, taprootPayerAddress, stxAddress });

  async function onCopyAddress(address: string) {
    await Clipboard.setStringAsync(address);
    return displayToast({
      type: 'success',
      title: t({
        id: 'receive.select_asset.toast_title',
        message: 'Address copied',
      }),
    });
  }

  if (selectedAsset) {
    return (
      <ReceiveAssetSheet
        accountName={name}
        selectedAsset={selectedAsset}
        onCopy={() => onCopyAddress(selectedAsset.address)}
        onGoBack={() => setSelectedAsset(null)}
      />
    );
  }
  return (
    <>
      <FullHeightSheetLayout
        header={
          <FullHeightSheetHeader
            title={t({
              id: 'select_asset.header_title',
              message: 'Select asset',
            })}
            subtitle={i18n._({
              id: 'select_asset.header_subtitle',
              message: '{subtitle}',
              values: { subtitle: name },
            })}
            leftElement={
              <HeaderBackButton onPress={navigation.goBack} testID={TestId.backButton} />
            }
            rightElement={<NetworkBadge />}
          />
        }
      >
        <ScrollView scrollEnabled={assets.length > 9}>
          {assets.map(asset => (
            <ReceiveAssetItem
              key={asset.address}
              address={truncateMiddle(asset.address)}
              addressType={asset.addressType}
              assetName={asset.assetName}
              assetSymbol={asset.assetSymbol}
              icon={<TokenIcon ticker={asset.assetSymbol} />}
              onCopy={() => onCopyAddress(asset.address)}
              onPress={() => setSelectedAsset(asset as SelectedAsset)}
            />
          ))}
        </ScrollView>
      </FullHeightSheetLayout>
    </>
  );
}
