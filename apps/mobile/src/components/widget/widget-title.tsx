import { TokenBalance } from '@/features/balances/token-balance';

import { Box, ChevronRightIcon, Text } from '@leather.io/ui/native';

import { Balance } from '../balance/balance';

interface WidgetTitleProps {
  title: string;
  totalBalance?: TokenBalance;
  isLoading?: boolean;
}

export function WidgetTitle({ title, totalBalance, isLoading }: WidgetTitleProps) {
  return (
    <>
      <Text variant="label01">{title}</Text>
      <ChevronRightIcon variant="small" color="ink.text-subdued" />
      {totalBalance && (
        <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
          <Balance balance={totalBalance} isLoading={isLoading} color="ink.text-subdued" />
        </Box>
      )}
    </>
  );
}
