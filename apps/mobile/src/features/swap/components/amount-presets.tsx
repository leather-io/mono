import { PresetPercentage } from '@/features/swap/swap-state/swap-state.types';
import { formatPercentage } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { Box, Button } from '@leather.io/ui/native';

interface AmountPresetsProps {
  onSelectPercentage: (percentage: PresetPercentage) => void;
}

export function AmountPresets({ onSelectPercentage }: AmountPresetsProps) {
  return (
    <Box flexDirection="row" px="7" gap="3">
      <Button flex={1} variant="outline" size="sm" onPress={() => onSelectPercentage(0.25)}>
        {formatPercentage(0.25, 0)}
      </Button>
      <Button flex={1} variant="outline" size="sm" onPress={() => onSelectPercentage(0.5)}>
        {formatPercentage(0.5, 0)}
      </Button>
      <Button flex={1} variant="outline" size="sm" onPress={() => onSelectPercentage(0.75)}>
        {formatPercentage(0.75, 0)}
      </Button>
      <Button flex={1} variant="outline" size="sm" onPress={() => onSelectPercentage(1)}>
        {t`MAX`}
      </Button>
    </Box>
  );
}
