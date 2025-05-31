import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { Send } from '@/features/send/send';
import { analytics } from '@/utils/analytics';
import { useGlobalSearchParams, useSegments } from 'expo-router';
import { isString } from 'remeda';

import { useHaptics } from '@leather.io/ui/native';

export function SendSheet() {
  const { sendSheetRef } = useGlobalSheets();
  const triggerHaptics = useHaptics();
  const { accountId } = useInitialSendParams();

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
      sheetRef={sendSheetRef}
      onAnimate={handleAnimatedPositionChange}
      onDismiss={handleDismiss}
    >
      <Send accountId={accountId} />
    </FullHeightSheet>
  );
}

function useInitialSendParams() {
  const [rootSegment] = useSegments();
  const params = useGlobalSearchParams();
  const isAccountRoute = rootSegment === 'account';
  const accountId = isAccountRoute && isString(params.accountId) ? params.accountId : undefined;

  return { accountId };
}
