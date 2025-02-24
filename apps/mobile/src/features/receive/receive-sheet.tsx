import { SheetNavigationContainer } from '@/common/sheet-navigator/sheet-navigation-container';
import { useSheetNavigatorContext } from '@/common/sheet-navigator/sheet-navigator-provider';
import { FullHeightSheet } from '@/components/full-height-sheet/full-height-sheet';

import { ReceiveSheetNavigator } from './receive-sheet-navigator';

export function ReceiveSheet() {
  const { receiveSheetRef } = useSheetNavigatorContext();
  return (
    <FullHeightSheet sheetRef={receiveSheetRef}>
      <SheetNavigationContainer>
        <ReceiveSheetNavigator />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}
