import { SheetNavigationContainer } from '@/common/sheet-navigator/sheet-navigation-container';
import { useSheetNavigatorContext } from '@/common/sheet-navigator/sheet-navigator-provider';
import { FullHeightSheet } from '@/components/full-height-sheet/full-height-sheet';

import { SendSheetNavigator } from './send-sheet-navigator';

export function SendSheet() {
  const { sendSheetRef } = useSheetNavigatorContext();
  return (
    <FullHeightSheet sheetRef={sendSheetRef}>
      <SheetNavigationContainer>
        <SendSheetNavigator />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}
