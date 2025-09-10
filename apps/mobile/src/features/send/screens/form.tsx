import { useRef, useState } from 'react';

import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { InlineAssetPicker } from '@/features/send/components/inline-asset-picker';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { useAccounts } from '@/store/accounts/accounts.read';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';

import { FungibleCryptoAsset } from '@leather.io/models';
import { SheetInstance } from '@leather.io/ui/native';

import { FormLayout } from './form.layout';

export function Form() {
  const { canGoBack, goBack } = useSendNavigation();
  const { params } = useSendRoute<'form'>();
  const {
    state: { selectedAsset, currentAccount },
    selectAsset,
  } = useSendFlowContext();
  const { fromAccountIndex } = useAccounts();
  const assetPickerSheetRef = useRef<SheetInstance>(null);
  const [shouldAnimateAssetItem, setShouldAnimateAssetItem] = useState(true);
  const assetItemElementInitialOffset = shouldAnimateAssetItem
    ? params?.assetItemElementInitialOffset
    : undefined;

  if (!selectedAsset) {
    return null;
  }

  function handleOpenAssetPicker() {
    analytics.track('send_inline_asset_picker_opened');
    assetPickerSheetRef.current?.present();
  }

  function handleInlineAssetSelection(asset: FungibleCryptoAsset) {
    analytics.track('send_asset_selected', { asset: asset.symbol });
    setShouldAnimateAssetItem(false);
    selectAsset(asset);
  }

  const account = fromAccountIndex(currentAccount.fingerprint, currentAccount.accountIndex)[0];

  return (
    <>
      <FullHeightSheetLayout
        header={
          <FullHeightSheetHeader
            title={t`Send`}
            subtitle={account?.name}
            leftElement={canGoBack() ? <HeaderBackButton onPress={goBack} /> : null}
          />
        }
      >
        <FormLayout
          currentAccount={currentAccount}
          selectedAsset={selectedAsset}
          handleOpenAssetPicker={handleOpenAssetPicker}
          assetItemElementInitialOffset={assetItemElementInitialOffset}
        />
      </FullHeightSheetLayout>

      <InlineAssetPicker
        sheetRef={assetPickerSheetRef}
        fingerprint={currentAccount.fingerprint}
        accountIndex={currentAccount.accountIndex}
        onSelectAsset={handleInlineAssetSelection}
      />
    </>
  );
}
