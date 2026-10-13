import { useState } from 'react';

import { formatPercentage } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { MAX_SLIPPAGE_PERCENTAGE, MIN_SLIPPAGE_PERCENTAGE } from '@leather.io/state/swap';
import { Box, Button, NumericInput, Sheet, type SheetRef, Text } from '@leather.io/ui/native';

interface SlippageSelectorSheetProps {
  value: number;
  onSave(value: number): void;
  ref: SheetRef;
}

export function SlippageSelectorSheet({ ref, value, onSave }: SlippageSelectorSheetProps) {
  const [editingValue, setEditingValue] = useState(value);

  function handleConfirm() {
    onSave(editingValue);
    ref.current?.dismiss();
  }

  return (
    <Sheet ref={ref}>
      <Sheet.View>
        <Sheet.Header leftElement={<Sheet.Title>{t`Edit Slippage`}</Sheet.Title>}></Sheet.Header>
        <Box px="5" mt="-2" gap="6">
          <Text variant="body02">{t`Price moving against you past this percentage will cancel the swap.`}</Text>

          <Box alignSelf="center" pb="1">
            <NumericInput
              min={MIN_SLIPPAGE_PERCENTAGE}
              max={MAX_SLIPPAGE_PERCENTAGE}
              step={0.001}
              longPressStep={0.01}
              value={editingValue}
              onChange={setEditingValue}
              formatter={value => formatPercentage(value, 1)}
            >
              <NumericInput.Decrement label={t`Decrease slippage`} />
              <NumericInput.Display width={128} fontSize={24} lineHeight={32} px="5" py="3" />
              <NumericInput.Increment label={t`Increase slippage`} />
            </NumericInput>
          </Box>

          <Button onPress={handleConfirm}>{t`Update slippage`}</Button>
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
