import { RefObject, useImperativeHandle, useRef, useState } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';

import { Box, Sheet, SheetRef, Text } from '@leather.io/ui/native';

interface DescriptionSheetData {
  title: string;
  description: string;
}

export interface DescriptionSheetInstance {
  present(sheetData: DescriptionSheetData): void;
  dismiss(): void;
}

export type DescriptionSheetRef = RefObject<DescriptionSheetInstance | null>;

export function DescriptionSheet() {
  const { descriptionSheetRef } = useGlobalSheets();
  const [sheetData, setSheetData] = useState<DescriptionSheetData | null>(null);
  const ref: SheetRef = useRef(null);

  useImperativeHandle(descriptionSheetRef, () => ({
    present(newSheetData) {
      setSheetData(newSheetData);
      ref.current?.present();
    },
    dismiss() {
      ref.current?.dismiss();
    },
  }));

  if (!sheetData) {
    return null;
  }

  return (
    <Sheet ref={ref}>
      <Sheet.View gap="3">
        <Sheet.Header leftElement={<Sheet.Title>{sheetData.title}</Sheet.Title>} />
        <Box px="5">
          <Text variant="body01">{sheetData.description}</Text>
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
