import { RefObject } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { Send } from '@/features/send/send';
import { analytics } from '@/utils/analytics';
import { useGlobalSearchParams, useSegments } from 'expo-router';
import { isString } from 'remeda';

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
  //   const { tokenSheetRef } = useGlobalSheets();
  const triggerHaptics = useHaptics();
  //   const { accountId } = useInitialTokenParams();
  //   console.log('accountId', accountId);
  console.log('tokenId', data?.tokenId);

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
      <Token tokenId={data?.tokenId} />
    </FullHeightSheet>
  );
}

// function useInitialTokenParams() {
//   const [rootSegment] = useSegments();
//   const params = useGlobalSearchParams();
//   const isAccountRoute = rootSegment === 'account';
//   const accountId = isAccountRoute && isString(params.accountId) ? params.accountId : undefined;
//   //   const isTokenRoute = rootSegment === 'token';
//   // //   const tokenId = isTokenRoute && isString(params.tokenId) ? params.tokenId : undefined;
//   //   const accountId = isTokenRoute && isString(params.accountId) ? params.accountId : undefined;

//   return { accountId };
// }
