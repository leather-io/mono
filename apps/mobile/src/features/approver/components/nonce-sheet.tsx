import { useState } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { t } from '@lingui/core/macro';

import { Box, Button, Numpad, type SheetRef, Text } from '@leather.io/ui/native';

interface NonceSheetProps {
  sheetRef: SheetRef;
  nonce: string;
  onChangeNonce(nonce: string): void;
}
export function NonceSheet({ sheetRef, nonce, onChangeNonce }: NonceSheetProps) {
  const [value, setValue] = useState(nonce);

  return (
    <SheetLayout sheetRef={sheetRef} title={t`Edit nonce`}>
      <Box gap="5">
        <Box gap="1">
          <Text variant="caption01" color="ink.text-secondary">{t`Custom nonce`}</Text>
          <Text variant="heading04">{value}</Text>
        </Box>
        <Numpad mode="numeric" value={value} onChange={setValue} />
        <Button
          onPress={() => {
            onChangeNonce(value);
            sheetRef.current?.close();
          }}
        >{t`Apply`}</Button>
      </Box>
    </SheetLayout>
  );
}
