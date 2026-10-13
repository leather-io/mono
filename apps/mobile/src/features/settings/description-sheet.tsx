import { RefObject, useImperativeHandle, useRef, useState } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';

import { Box, BulletOperator, Sheet, SheetRef, Text } from '@leather.io/ui/native';

type DescriptionData =
  | {
      text: string;
      key: 'paragraph';
    }
  | {
      text: string;
      title?: string;
      key: 'bullet';
    };

interface DescriptionSheetData {
  title: string;
  data: DescriptionData[];
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

  return (
    <Sheet ref={ref}>
      {sheetData && (
        <Sheet.View gap="3">
          <Sheet.Header leftElement={<Sheet.Title>{sheetData.title}</Sheet.Title>} />
          <Box px="5" pb="5" gap="5">
            {sheetData.data.map(paragraph => {
              switch (paragraph.key) {
                case 'paragraph': {
                  return (
                    <Text key={paragraph.text} variant="body01">
                      {paragraph.text}
                    </Text>
                  );
                }
                case 'bullet': {
                  return (
                    <Box key={paragraph.text} flexDirection="row" gap="1">
                      <Box pt="2">
                        <BulletOperator borderRadius="round" />
                      </Box>
                      <Text variant="body01" style={{ flexShrink: 1 }}>
                        <Text fontWeight={900}>{paragraph.title} </Text>
                        {paragraph.text}
                      </Text>
                    </Box>
                  );
                }
                default:
                  return null;
              }
            })}
          </Box>
        </Sheet.View>
      )}
    </Sheet>
  );
}
