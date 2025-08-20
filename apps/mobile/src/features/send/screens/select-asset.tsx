import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { AssetPicker } from '@/features/send/components/asset-picker/asset-picker';
import { usePreloadBtcData } from '@/features/send/hooks/use-preload-btc-data';
import { usePreloadStxData } from '@/features/send/hooks/use-preload-stx-data';
import { useSendNavigation } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';

import { FungibleCryptoAsset } from '@leather.io/models';

export function SelectAsset() {
  const { navigate } = useSendNavigation();
  const {
    selectAsset,
    state: { currentAccount },
  } = useSendFlowContext();
  const { fingerprint, accountIndex } = currentAccount;
  // Preload relevant data to ensure smooth transition animation to form screen
  usePreloadBtcData(currentAccount);
  usePreloadStxData(currentAccount);

  function handleSelectAsset(asset: FungibleCryptoAsset, assetItemElementOffsetTop: number | null) {
    analytics.track('send_asset_selected', { asset: asset.symbol });
    selectAsset(asset);
    navigate('form', {
      previousRoute: 'select-asset',
      assetItemElementInitialOffset: assetItemElementOffsetTop,
    });
  }

  return (
    <FullHeightSheetLayout
      header={<FullHeightSheetHeader title={t`Select asset`} subtitle={t`Send`} />}
    >
      <AssetPicker
        fingerprint={fingerprint}
        accountIndex={accountIndex}
        onSelectAsset={handleSelectAsset}
      />
    </FullHeightSheetLayout>
  );
}
