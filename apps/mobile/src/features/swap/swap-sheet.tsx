import { RefObject, useImperativeHandle, useRef, useState } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { Swap } from '@/features/swap/swap';
import { SupportedAsset } from '@/features/swap/swap-state/swap-state.types';
import { analytics } from '@/utils/analytics';

import { SheetInstance, useHaptics } from '@leather.io/ui/native';

interface SwapSheetPresentParams {
  baseAsset?: SupportedAsset;
  targetAsset?: SupportedAsset;
}

export interface SwapSheetInstance {
  present(args?: SwapSheetPresentParams): void;
  dismiss(): void;
}
export type SwapSheetRef = RefObject<SwapSheetInstance | null>;

export function SwapSheet() {
  const { swapSheetRef } = useGlobalSheets();
  const ref = useRef<SheetInstance>(null);
  const triggerHaptics = useHaptics();
  const [baseAsset, setBaseAsset] = useState<SupportedAsset | undefined>(undefined);
  const [targetAsset, setTargetAsset] = useState<SupportedAsset | undefined>(undefined);

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  function handleDismiss() {
    analytics.track('swap_sheet_dismissed');
  }

  useImperativeHandle(swapSheetRef, () => ({
    present({ baseAsset, targetAsset } = {}) {
      analytics.track('swap_sheet_opened', { asset: baseAsset?.symbol });
      setBaseAsset(baseAsset);
      setTargetAsset(targetAsset);
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
      <SheetNavigationContainer base="swap">
        <Swap baseAsset={baseAsset} targetAsset={targetAsset} />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}
