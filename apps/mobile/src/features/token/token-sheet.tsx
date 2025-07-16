import { RefObject } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { analytics } from '@/utils/analytics';

import { SheetRef, useHaptics } from '@leather.io/ui/native';

import { Token } from './token';

export interface TokenSheetData {
  tokenId: string;
  accountIndex?: number;
  fingerprint?: string;
}

interface TokenSheetProps {
  data: TokenSheetData | null;
  sheetRef: RefObject<SheetRef | null>;
}

export function TokenSheet({ data, sheetRef }: TokenSheetProps) {
  const triggerHaptics = useHaptics();

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  function handleDismiss() {
    analytics.track('send_sheet_dismissed');
  }

  return (
    <FullHeightSheet
      sheetRef={sheetRef}
      onAnimate={handleAnimatedPositionChange}
      onDismiss={handleDismiss}
    >
      <Token
        tokenId={data?.tokenId}
        accountIndex={data?.accountIndex}
        fingerprint={data?.fingerprint}
      />
    </FullHeightSheet>
  );
}
