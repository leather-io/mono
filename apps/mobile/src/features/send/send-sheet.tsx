import { FullHeightSheet } from '@/components/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { Send } from '@/features/send/send';

import { useHaptics } from '@leather.io/ui/native';

export function SendSheet() {
  const { sendSheetRef } = useGlobalSheets();
  const triggerHaptics = useHaptics();

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  return (
    <FullHeightSheet<{ accountId: string }>
      sheetRef={sendSheetRef}
      onAnimate={handleAnimatedPositionChange}
    >
      {data => <Send accountId={data?.data?.accountId} />}
    </FullHeightSheet>
  );
}
