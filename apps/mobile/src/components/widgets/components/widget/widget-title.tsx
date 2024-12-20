import { Money } from '@leather.io/models';
import { Box, ChevronRightIcon, Text } from '@leather.io/ui/native';

import { Balance } from '../../../balance/balance';

interface WidgetTitleProps {
  title: string;
  totalBalance?: Money;
}

export function WidgetTitle({ title, totalBalance }: WidgetTitleProps) {
  return (
    <>
      <Text variant="label01">{title}</Text>
      <ChevronRightIcon variant="small" color="ink.text-subdued" />
      {totalBalance && (
        <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
          <Balance balance={totalBalance} color="ink.text-subdued" />
        </Box>
      )}
    </>
  );
}
