import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { AssetPicker } from '@/features/send/components/asset-picker/asset-picker';
import { usePreloadBtcData } from '@/features/send/hooks/use-preload-btc-data';
import { usePreloadStxData } from '@/features/send/hooks/use-preload-stx-data';
import { useSendNavigation } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { SendableAsset } from '@/features/send/types';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';

export function SelectAsset() {
  const { navigate } = useSendNavigation();
  const {
    state: { selectedAccount },
    selectAsset,
  } = useSendFlowContext();
  // Preload relevant data to ensure smooth transition animation to form screen
  usePreloadBtcData(selectedAccount);
  usePreloadStxData(selectedAccount);

  function handleSelectAsset(asset: SendableAsset, assetItemElementOffsetTop: number | null) {
    analytics.track('send_asset_selected', { asset });
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

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'select_asset.header_title',
            message: 'Select asset',
          })}
          subtitle={t({
            id: 'send.select_asset.header_subtitle',
            message: 'Send',
          })}
        />
      }
    >
      <AssetPicker account={selectedAccount} onSelectAsset={handleSelectAsset} />
    </FullHeightSheetLayout>
  );
}
