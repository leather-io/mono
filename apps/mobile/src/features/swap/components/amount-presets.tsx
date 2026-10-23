import { useState } from 'react';

import { formatPercentage } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { PresetPercentage } from '@leather.io/state/swap';
import { Box, Button } from '@leather.io/ui/native';

interface AmountPresetsProps {
  onSelectPercentage(percentage: PresetPercentage): void;
}

const compactRowWidth = 360;

export function AmountPresets({ onSelectPercentage }: AmountPresetsProps) {
  const [isCompact, setIsCompact] = useState(false);

  return (
    <Box
      flexDirection="row"
      px={isCompact ? '5' : '7'}
      gap={isCompact ? '2' : '3'}
      onLayout={e => setIsCompact(e.nativeEvent.layout.width < compactRowWidth)}
    >
      <PresetButton onPress={() => onSelectPercentage(0.25)}>
        {formatPercentage(0.25, 0)}
      </PresetButton>
      <PresetButton onPress={() => onSelectPercentage(0.5)}>
        {formatPercentage(0.5, 0)}
      </PresetButton>
      <PresetButton onPress={() => onSelectPercentage(0.75)}>
        {formatPercentage(0.75, 0)}
      </PresetButton>
      <PresetButton onPress={() => onSelectPercentage(1)}>{t`MAX`}</PresetButton>
    </Box>
  );
}

interface PresetButtonProps {
  children: string;
  onPress(): void;
}

function PresetButton({ children, onPress }: PresetButtonProps) {
  return (
    <Button
      flex={1}
      px="2"
      variant="outline"
      size="sm"
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}
