import { Money } from '@leather.io/models';
import { Box, ChevronRightIcon, Text } from '@leather.io/ui/native';

import { Balance } from '../../../balance/balance';

interface WidgetTitleProps {
  title: string;
  totalBalance?: Money;
  testID?: string;
}

export function WidgetTitle({ title, totalBalance, testID }: WidgetTitleProps) {
  return (
    <>
      <Text variant="label01" testID={testID}>
        {title}
      </Text>
      <ChevronRightIcon variant="small" color="ink.text-subdued" />
      {totalBalance && (
        <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
          <Balance balance={totalBalance} color="ink.text-subdued" />
        </Box>
      )}
    </>
  );
}
