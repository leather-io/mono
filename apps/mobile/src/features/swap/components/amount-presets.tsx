import { formatPercentage } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { Box, Button } from '@leather.io/ui/native';

interface AmountPresetsProps {
  disabled?: boolean;
}

export function AmountPresets({ disabled }: AmountPresetsProps) {
  return (
    <Box flexDirection="row" px="7" gap="3">
      <Button flex={1} variant="outline" size="sm" disabled={disabled}>
        {formatPercentage(0.25, 0)}
      </Button>
      <Button flex={1} variant="outline" size="sm" disabled={disabled}>
        {formatPercentage(0.5, 0)}
      </Button>
      <Button flex={1} variant="outline" size="sm" disabled={disabled}>
        {formatPercentage(0.75, 0)}
      </Button>
      <Button flex={1} variant="outline" size="sm" disabled={disabled}>
        {t`MAX`}
      </Button>
    </Box>
  );
}
