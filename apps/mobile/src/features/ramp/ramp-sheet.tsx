import { RefObject, useImperativeHandle, useRef, useState } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { SheetNavigationContainer } from '@/core/sheet-navigation-container';

import { type OnramperMode } from '@leather.io/features';
import type { FungibleCryptoAsset } from '@leather.io/models';
import { SheetInstance } from '@leather.io/ui/native';

import { Ramp } from './ramp';

export interface RampSheetInstance {
  present(mode: OnramperMode, asset?: FungibleCryptoAsset): void;
  dismiss(): void;
}
export type RampSheetRef = RefObject<RampSheetInstance | null>;

export function RampSheet() {
  const { rampSheetRef } = useGlobalSheets();
  const ref = useRef<SheetInstance>(null);
  const [mode, setMode] = useState<null | OnramperMode>(null);
  const [asset, setAsset] = useState<null | FungibleCryptoAsset>(null);

  useImperativeHandle(rampSheetRef, () => ({
    present(mode: OnramperMode) {
      ref.current?.present();
      setMode(mode);
    },
    dismiss() {
      ref.current?.dismiss();
    },
  }));

  return (
    <FullHeightSheet
      onDismiss={() => {
        setMode(null);
        setAsset(null);
      }}
      sheetRef={ref}
    >
      <SheetNavigationContainer base="ramp">
        {mode && <Ramp mode={mode} asset={asset} />}
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}
