import { RefObject } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { analytics } from '@/utils/analytics';

import { Money } from '@leather.io/models';
import { SheetRef, useHaptics } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { Token } from './token';

export interface TokenSheetData {
  tokenId: string;
  accountIndex?: number;
  fingerprint?: string;
  availableBalance: Money;
  quoteBalance: Money;
}

interface TokenSheetProps {
  data: TokenSheetData | null;
  sheetRef: RefObject<SheetRef | null>;
}

// >>> PETE - start cleaning up this PR
// >>  next up is to filter account activity by accountID
// >> check if we have balances split by tap and segwit

// > add a feature flag for the new token sheet

// This will take a few days to complete.

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
        availableBalance={data?.availableBalance ?? createMoney(0, 'BTC')}
        quoteBalance={data?.quoteBalance ?? createMoney(0, 'BTC')}
      />
    </FullHeightSheet>
  );
}
