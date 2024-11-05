import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/components/network-badge';
import { useToastContext } from '@/components/toast/toast-context';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';

import { BtcAvatarIcon, SheetRef, StxAvatarIcon, Theme } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

import { ReceiveSheetNavigatorParamList } from '../receive-sheet-navigator';
import { ReceiveAssetItem } from './receive-asset-item';
import { ReceiveAssetSheet } from './receive-asset-sheet';

type SelectAssetScreenRouteProp = RouteProp<ReceiveSheetNavigatorParamList, 'receive-select-asset'>;

export function SelectAsset() {
  const { i18n } = useLingui();
  const route = useRoute<SelectAssetScreenRouteProp>();
  const theme = useTheme<Theme>();
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
        <ScrollView contentContainerStyle={{ gap: theme.spacing['5'] }}>
          <ReceiveAssetItem
            address={truncateMiddle(nativeSegwitPayerAddress)}
            addressType={t`Native Segwit`}
            assetName={t`Bitcoin`}
            assetSymbol="BTC"
            icon={<BtcAvatarIcon />}
            onCopy={() => onCopyAddress(nativeSegwitPayerAddress)}
            onPress={() => receiveSheetRef.current?.present()}
          />
          <ReceiveAssetItem
            address={truncateMiddle(taprootPayerAddress)}
            addressType={t`Taproot`}
            assetName={t`Bitcoin`}
            assetSymbol="BTC"
            icon={<BtcAvatarIcon />}
            onCopy={() => onCopyAddress(taprootPayerAddress)}
            onPress={() => receiveSheetRef.current?.present()}
          />
          <ReceiveAssetItem
            address={truncateMiddle(stxAddress)}
            assetName={t`Stacks`}
            assetSymbol="STX"
            icon={<StxAvatarIcon />}
            onCopy={() => onCopyAddress(stxAddress)}
            onPress={() => receiveSheetRef.current?.present()}
          />
        </ScrollView>
      </FullHeightSheetLayout>
      <ReceiveAssetSheet sheetRef={receiveSheetRef} />
    </>
  );
}
