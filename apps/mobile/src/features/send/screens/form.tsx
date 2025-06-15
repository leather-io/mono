import { useRef, useState } from 'react';

import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { InlineAssetPicker } from '@/features/send/components/inline-asset-picker';
import { BtcForm } from '@/features/send/forms/btc/btc-form';
import { BtcDataLoader } from '@/features/send/forms/btc/btc-loader';
import { StxForm } from '@/features/send/forms/stx/stx-form';
import { StxDataLoader } from '@/features/send/forms/stx/stx-loader';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { SendableAsset } from '@/features/send/types';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

export function Form() {
  const { canGoBack, goBack } = useSendNavigation();
  const { params } = useSendRoute<'form'>();
  const {
    state: { selectedAsset, selectedAccount },
    selectAsset,
  } = useSendFlowContext();
  const { fiatCurrencyPreference } = useSettings();
  const assetPickerSheetRef = useRef<SheetRef>(null);
  const [shouldAnimateAssetItem, setShouldAnimateAssetItem] = useState(true);
  const assetItemElementInitialOffset = shouldAnimateAssetItem
    ? params?.assetItemElementInitialOffset
    : undefined;

  if (!selectedAsset || !selectedAccount) {
    return null;
  }

  function handleOpenAssetPicker() {
    analytics.track('send_inline_asset_picker_opened');
    assetPickerSheetRef.current?.present();
  }

  function handleInlineAssetSelection(asset: SendableAsset) {
    analytics.track('send_asset_selected', { asset });
    setShouldAnimateAssetItem(false);
    selectAsset(asset);
  }

  return (
    <>
      <FullHeightSheetLayout
        header={
          <FullHeightSheetHeader
            title={t({
              id: 'send_form.header_title',
              message: 'Send',
            })}
            subtitle={i18n._({
              id: 'select_asset.header_subtitle',
              message: '{subtitle}',
              values: { subtitle: selectedAccount.name },
            })}
            leftElement={canGoBack() ? <HeaderBackButton onPress={goBack} /> : null}
          />
        }
      >
        {/* TODO: Use pattern matching once we add support for remaining tokens */}
        {
          {
            stx: (
              <StxDataLoader account={selectedAccount}>
                {({ availableBalance, quoteBalance, marketData, nonce }) => {
                  return (
                    <StxForm
                      account={selectedAccount}
                      marketData={marketData}
                      availableBalance={availableBalance}
                      quoteBalance={quoteBalance}
                      quoteCurrency={fiatCurrencyPreference}
                      nonce={nonce}
                      onOpenAssetPicker={handleOpenAssetPicker}
                      assetItemAnimationOffsetTop={assetItemElementInitialOffset}
                    />
                  );
                }}
              </StxDataLoader>
            ),
            btc: (
              <BtcDataLoader account={selectedAccount}>
                {({ availableBalance, quoteBalance, feeRates, utxos, marketData }) => {
                  return (
                    <BtcForm
                      quoteCurrency={fiatCurrencyPreference}
                      marketData={marketData}
                      availableBalance={availableBalance}
                      quoteBalance={quoteBalance}
                      feeRates={feeRates}
                      utxos={utxos}
                      account={selectedAccount}
                      assetItemAnimationOffsetTop={assetItemElementInitialOffset}
                      onOpenAssetPicker={handleOpenAssetPicker}
                    />
                  );
                }}
              </BtcDataLoader>
            ),
          }[selectedAsset]
        }
      </FullHeightSheetLayout>

      <InlineAssetPicker
        sheetRef={assetPickerSheetRef}
        account={selectedAccount}
        onSelectAsset={handleInlineAssetSelection}
      />
    </>
  );
}
