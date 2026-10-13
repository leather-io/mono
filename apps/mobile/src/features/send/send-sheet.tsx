import { RefObject, useImperativeHandle, useRef, useState } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { Send } from '@/features/send/send';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';

import { FungibleCryptoAsset } from '@leather.io/models';
import { SheetInstance, useHaptics } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

export interface SendSheetInstance {
  present(asset?: FungibleCryptoAsset): void;
  dismiss(): void;
}
export type SendSheetRef = RefObject<SendSheetInstance | null>;

export function SendSheet() {
  const { sendSheetRef } = useGlobalSheets();
  const ref = useRef<SheetInstance>(null);
  const triggerHaptics = useHaptics();
  const { currentAccount } = useSettings();
  const [asset, setAsset] = useState<FungibleCryptoAsset | undefined>(undefined);
  assertExistence(currentAccount, `"Send Sheet expects currentAccount to be set`);

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  function handleDismiss() {
    analytics.track('send_sheet_dismissed');
  }

  useImperativeHandle(sendSheetRef, () => ({
    present(asset) {
      analytics.track('send_sheet_opened', { asset: asset?.symbol });
      setAsset(asset);
      ref.current?.present();
    },
    dismiss() {
      ref.current?.dismiss();
    },
  }));

  return (
    <FullHeightSheet
      sheetRef={ref}
      onAnimate={handleAnimatedPositionChange}
      onDismiss={handleDismiss}
    >
      <SheetNavigationContainer base="send">
        <Send currentAccount={currentAccount} asset={asset} />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}
