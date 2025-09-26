import { RefObject, useImperativeHandle, useRef, useState } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';

import { SheetInstance, useHaptics } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

import { Receive } from './receive';
import { ReceiveType } from './receive-flow-provider';
import { useSelectAssets } from './use-select-assets';

export interface ReceiveSheetInstance {
  present(receiveType: ReceiveType): void;
  dismiss(): void;
}
export type ReceiveSheetRef = RefObject<ReceiveSheetInstance | null>;

export function ReceiveSheet() {
  const { receiveSheetRef } = useGlobalSheets();
  const ref = useRef<SheetInstance>(null);
  const [receiveType, setReceiveType] = useState<ReceiveType>('all');
  const triggerHaptics = useHaptics();
  const { currentAccount } = useSettings();
  assertExistence(currentAccount, `"Receive Sheet expects currentAccount to be set`);

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  function handleDismiss() {
    analytics.track('receive_sheet_dismissed');
  }

  useImperativeHandle(receiveSheetRef, () => ({
    present(receiveType) {
      analytics.track('receive_sheet_opened', { type: receiveType });
      setReceiveType(receiveType);
      ref.current?.present();
    },
    dismiss() {
      ref.current?.dismiss();
    },
  }));
  const selectedAssets = useSelectAssets({ currentAccount, receiveType });
  const selectedAsset = selectedAssets.length === 1 ? selectedAssets[0] : undefined;

  return (
    <FullHeightSheet
      sheetRef={ref}
      onAnimate={handleAnimatedPositionChange}
      onDismiss={handleDismiss}
    >
      <SheetNavigationContainer base="receive">
        <Receive
          currentAccount={currentAccount}
          receiveType={receiveType}
          selectedAsset={selectedAsset}
        />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}
