import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { SheetNavigationContainer } from '@/core/sheet-navigation-container';

import { Receive } from './receive';

export function ReceiveSheet() {
  const { receiveSheetRef } = useGlobalSheets();
  return (
    <FullHeightSheet sheetRef={receiveSheetRef}>
      <SheetNavigationContainer>
        <Receive />
      </SheetNavigationContainer>
    </FullHeightSheet>
  );
}
