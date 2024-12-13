import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { useToastContext } from '@/components/toast/toast-context';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { isFeatureEnabled } from '@/utils/feature-flag';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import * as Clipboard from 'expo-clipboard';

import { BtcAvatarIcon, SheetRef, StxAvatarIcon } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

import { CreateCurrentReceiveRoute, useReceiveSheetRoute } from '../utils';
import { ReceiveAssetItem } from './receive-asset-item';
import { ReceiveAssetSheet } from './receive-asset-sheet';

type CurrentRoute = CreateCurrentReceiveRoute<'receive-select-asset'>;

export function SelectAsset() {
  const { i18n } = useLingui();
  const route = useReceiveSheetRoute<CurrentRoute>();
  const { displayToast } = useToastContext();
  const receiveSheetRef = useRef<SheetRef>(null);

  const account = route.params.account;
  const { name } = account;

  const { nativeSegwitPayerAddress, taprootPayerAddress } =
    useBitcoinPayerAddressFromAccountIndex(account.fingerprint, account.accountIndex) ?? '';
  const stxAddress =
    useStacksSignerAddressFromAccountIndex(account.fingerprint, account.accountIndex) ?? '';

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
            rightElement={<NetworkBadge />}
          />
        }
      >
        <ScrollView>
          <ReceiveAssetItem
            address={truncateMiddle(nativeSegwitPayerAddress)}
            addressType={t({
              id: 'address_type.native_segwit',
              message: 'Native Segwit',
            })}
            assetName={t({
              id: 'asset_name.bitcoin',
              message: 'Bitcoin',
            })}
            assetSymbol="BTC"
            icon={<BtcAvatarIcon />}
            onCopy={() => onCopyAddress(nativeSegwitPayerAddress)}
            onPress={() =>
              isFeatureEnabled()
                ? receiveSheetRef.current?.present()
                : onCopyAddress(nativeSegwitPayerAddress)
            }
          />
          <ReceiveAssetItem
            address={truncateMiddle(taprootPayerAddress)}
            addressType={t({
              id: 'address_type.taproot',
              message: 'Taproot',
            })}
            assetName={t({
              id: 'asset_name.bitcoin',
              message: 'Bitcoin',
            })}
            assetSymbol="BTC"
            icon={<BtcAvatarIcon />}
            onCopy={() => onCopyAddress(taprootPayerAddress)}
            onPress={() =>
              isFeatureEnabled()
                ? receiveSheetRef.current?.present()
                : onCopyAddress(taprootPayerAddress)
            }
          />
          <ReceiveAssetItem
            address={truncateMiddle(stxAddress)}
            assetName={t({
              id: 'asset_name.stacks',
              message: 'Stacks',
            })}
            assetSymbol="STX"
            icon={<StxAvatarIcon />}
            onCopy={() => onCopyAddress(stxAddress)}
            onPress={() =>
              isFeatureEnabled() ? receiveSheetRef.current?.present() : onCopyAddress(stxAddress)
            }
          />
        </ScrollView>
      </FullHeightSheetLayout>
      {/* TODO: LEA-1633 implement receive sheet */}
      <ReceiveAssetSheet sheetRef={receiveSheetRef} />
    </>
  );
}
