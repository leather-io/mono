import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TestId } from '@/shared/test-id';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { BitcoinAddress } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import {
  CreateCurrentReceiveRoute,
  useCopyAddress,
  useReceiveSheetNavigation,
  useReceiveSheetRoute,
} from '../utils';
import { getAssets } from './get-assets';
import { ReceiveAssetItem } from './receive-asset-item';

type CurrentRoute = CreateCurrentReceiveRoute<'receive-select-asset'>;

export interface SelectedAsset {
  assetSymbol: string;
  assetName: string;
  address: BitcoinAddress | string;
  addressType?: string;
  assetDescription: string;
}

export function SelectAsset() {
  const { i18n } = useLingui();
  const route = useReceiveSheetRoute<CurrentRoute>();
  const navigation = useReceiveSheetNavigation<CurrentRoute>();

  function onSelectAccount(asset: SelectedAsset) {
    navigation.navigate('receive-asset-details', { asset, accountName: account.name });
  }
  const account = route.params.account;
  const { name } = account;
  const { nativeSegwitPayerAddress, taprootPayerAddress } =
    useBitcoinPayerAddressFromAccountIndex(account.fingerprint, account.accountIndex) ?? '';
  const stxAddress =
    useStacksSignerAddressFromAccountIndex(account.fingerprint, account.accountIndex) ?? '';

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
        {assets.map(asset => (
          <ReceiveAssetItem
            key={asset.address}
            address={truncateMiddle(asset.address)}
            addressType={asset.addressType}
            assetName={asset.assetName}
            assetSymbol={asset.assetSymbol}
            icon={<TokenIcon ticker={asset.assetSymbol} />}
            onCopy={() => onCopyAddress(asset.address)}
            onPress={() => onSelectAccount(asset)}
          />
        ))}
      </FullHeightSheetLayout>
    </>
  );
}
