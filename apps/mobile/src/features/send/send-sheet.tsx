import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { Send } from '@/features/send/send';
import { analytics } from '@/utils/analytics';
import { useGlobalSearchParams } from 'expo-router';
import { isString } from 'remeda';

import { useHaptics } from '@leather.io/ui/native';

export function SendSheet() {
  const { sendSheetRef } = useGlobalSheets();
  const triggerHaptics = useHaptics();
  const { accountId, asset } = useInitialSendParams();

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
      <Send accountId={accountId} asset={asset} />
    </FullHeightSheet>
  );
}

function useInitialSendParams() {
  const params = useGlobalSearchParams();
  const accountId = isString(params.accountId) ? params.accountId : undefined;
  // in the context of Send/Receive sheet, the asset is a SendableAsset which is a string and not a true asset object
  const asset = isString(params.asset) ? params.asset : undefined;
  console.log('--------------- asset', asset);
  return { accountId, asset };
}
