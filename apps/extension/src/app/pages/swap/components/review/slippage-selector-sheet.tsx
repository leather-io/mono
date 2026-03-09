import { useState } from 'react';

import { HStack, Stack, styled } from 'leather-styles/jsx';

import { MAX_SLIPPAGE_PERCENTAGE, MIN_SLIPPAGE_PERCENTAGE } from '@leather.io/state/swap';
import { Button, NumericInput, Sheet, SheetHeader } from '@leather.io/ui';

import { formatPercentage } from '@app/common/currency-formatter';

interface SlippageSelectorSheetProps {
  isShowing: boolean;
  onClose(): void;
  slippage: number;
  onSave(value: number): void;
}

export function SlippageSelectorSheet({
  isShowing,
  onClose,
  slippage,
  onSave,
}: SlippageSelectorSheetProps) {
  const [editingValue, setEditingValue] = useState(slippage);

  function handleConfirm() {
    onSave(editingValue);
    onClose();
  }

  return (
    <Sheet isShowing={isShowing} onClose={onClose} header={<SheetHeader title="Edit slippage" />}>
      <Stack gap="space.05" pb="space.06" px="space.05">
        <styled.span textStyle="caption.01">
          Price moving against you past this percentage will cancel the swap.
        </styled.span>

        <styled.div alignSelf="center">
          <NumericInput
            min={MIN_SLIPPAGE_PERCENTAGE}
            max={MAX_SLIPPAGE_PERCENTAGE}
            step={0.001}
            longPressStep={0.01}
            value={editingValue}
            onChange={setEditingValue}
            formatter={value => formatPercentage(value, 1)}
          >
            <NumericInput.Decrement />
            <NumericInput.Display fontSize="24px" lineHeight="32px" />
            <NumericInput.Increment />
          </NumericInput>
        </styled.div>

        <HStack gap="space.04">
          <Button flexGrow={1} variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button flexGrow={1} onClick={handleConfirm}>
            Apply
          </Button>
        </HStack>
      </Stack>
    </Sheet>
  );
}
