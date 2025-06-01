import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { analytics } from '@/utils/analytics';
import { useGlobalSearchParams, useSegments } from 'expo-router';
import { isString } from 'remeda';

import { useHaptics } from '@leather.io/ui/native';

import { Receive } from './receive';

export function ReceiveSheet() {
  const { receiveSheetRef } = useGlobalSheets();
  const triggerHaptics = useHaptics();
  const { accountId } = useInitialReceiveParams();

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  function handleDismiss() {
    analytics.track('receive_sheet_dismissed');
  }

  return (
    <FullHeightSheet
      sheetRef={receiveSheetRef}
      onAnimate={handleAnimatedPositionChange}
      onDismiss={handleDismiss}
    >
      <SheetNavigationContainer base="receive">
        <Receive accountId={accountId} />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}

function useInitialReceiveParams() {
  const [rootSegment] = useSegments();
  const params = useGlobalSearchParams();
  const isAccountRoute = rootSegment === 'account';
  const accountId = isAccountRoute && isString(params.accountId) ? params.accountId : undefined;

  return { accountId };
}
