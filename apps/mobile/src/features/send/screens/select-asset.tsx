import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { AssetPicker } from '@/features/send/components/asset-picker/asset-picker';
import { usePreloadBtcData } from '@/features/send/hooks/use-preload-btc-data';
import { usePreloadStxData } from '@/features/send/hooks/use-preload-stx-data';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { SendableAsset } from '@/features/send/types';
import { NetworkBadge } from '@/features/settings/network-badge';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

export function SelectAsset() {
  const { navigate } = useSendNavigation();
  const route = useSendRoute<'select-asset'>();
  const canGoBack = route.params?.previousRoute === 'select-account';
  const {
    state: { selectedAccount },
    selectAsset,
  } = useSendFlowContext();
  // Preload relevant data to ensure smooth transition animation to form screen
  usePreloadBtcData(selectedAccount);
  usePreloadStxData(selectedAccount);

  function handleSelectAsset(asset: SendableAsset, assetItemElementOffsetTop: number | null) {
    selectAsset(asset);
    if (selectedAccount) {
      navigate('form', {
        previousRoute: 'select-asset',
        assetItemElementInitialOffset: assetItemElementOffsetTop,
      });
    } else {
      navigate('select-account', {
        previousRoute: 'select-asset',
      });
    }
  }

  function handleBackButtonPress() {
    navigate('select-account');
  }

  return (
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
            values: { subtitle: selectedAccount?.name },
          })}
          leftElement={canGoBack ? <HeaderBackButton onPress={handleBackButtonPress} /> : null}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <AssetPicker account={selectedAccount} onSelectAsset={handleSelectAsset} />
    </FullHeightSheetLayout>
  );
}
