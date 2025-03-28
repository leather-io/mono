import { FullHeightSheet } from '@/components/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { SheetNavigationContainer } from '@/core/sheet-navigation-container';

import { ReceiveSheetNavigator } from './receive-sheet-navigator';

export function ReceiveSheet() {
  const { receiveSheetRef } = useGlobalSheets();
  return (
    <FullHeightSheet sheetRef={receiveSheetRef}>
      <SheetNavigationContainer>
        <ReceiveSheetNavigator />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}
