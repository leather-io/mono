import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { analytics } from '@/utils/analytics';
import { useGlobalSearchParams } from 'expo-router';
import { isString } from 'remeda';

import { useHaptics } from '@leather.io/ui/native';

import { Receive } from './receive';

export function ReceiveSheet() {
  const { receiveSheetRef } = useGlobalSheets();
  const triggerHaptics = useHaptics();
  const { accountId, asset } = useInitialReceiveParams();

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
        <Receive accountId={accountId} asset={asset} />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}

function useInitialReceiveParams() {
  const params = useGlobalSearchParams();
  const accountId = isString(params.accountId) ? params.accountId : undefined;
  console.log('------------ receive params', params);
  const asset = isString(params.asset) ? params.asset : undefined;
  console.log('------------ receive asset', asset);
  return { accountId, asset };
}
