import { useWindowDimensions } from 'react-native';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet';
import { useSendSheetContext } from '@/features/send/send-sheet-context';

import { Box } from '@leather.io/ui/native';

import { SendSheetNavigator } from './send-sheet-navigator';

export function SendSheet() {
  const { height } = useWindowDimensions();
  const { sendSheetRef } = useSendSheetContext();
  return (
    <FullHeightSheet sheetRef={sendSheetRef}>
      <Box flex={1} height={height}>
        <SendSheetNavigator />
      </Box>
    </FullHeightSheet>
  );
}
