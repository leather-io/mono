import { useSheetNavigatorContext } from '@/common/sheet-navigator/sheet-navigator-provider';
import { FullHeightSheet } from '@/components/full-height-sheet/full-height-sheet';
import { Send } from '@/features/send/send';

import { useHaptics } from '@leather.io/ui/native';

export function SendSheet() {
  const { sendSheetRef } = useSheetNavigatorContext();
  const triggerHaptics = useHaptics();

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  return (
    <FullHeightSheet sheetRef={sendSheetRef} onAnimate={handleAnimatedPositionChange}>
      <Send />
    </FullHeightSheet>
  );
}
