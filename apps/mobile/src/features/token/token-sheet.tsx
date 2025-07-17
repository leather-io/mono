import { RefObject } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { analytics } from '@/utils/analytics';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { SheetRef, useHaptics } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { Token } from './token';

export interface TokenSheetData {
  accountIndex?: number;
  fingerprint?: string;
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  quoteBalance: Money;
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
      {/* TODO LEA-3015: improve this / add fallback defensiveness */}
      {data && (
        <Token
          asset={data.asset}
          accountIndex={data.accountIndex}
          fingerprint={data.fingerprint}
          availableBalance={data.availableBalance}
          quoteBalance={data.quoteBalance}
        />
      )}
    </FullHeightSheet>
  );
}
