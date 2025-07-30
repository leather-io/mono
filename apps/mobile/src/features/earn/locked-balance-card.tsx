import { Balance } from '@/components/balance/balance';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { Box, ItemLayout, Text } from '@leather.io/ui/native';

interface LockedBalanceCardProps {
  quoteLockedBalance: Money;
  stxLockedBalance: Money;
}

export function LockedBalanceCard({
  quoteLockedBalance,
  stxLockedBalance,
}: LockedBalanceCardProps) {
  return (
    <Box px="5" py="0" width="100%" height={90}>
      <Box
        flex={1}
        px="5"
        flexDirection="row"
        alignItems="center"
        height={90}
        justifyContent="space-between"
        backgroundColor="ink.background-primary"
        borderRadius="sm"
        borderColor="ink.border-transparent"
        borderWidth={1}
      >
        <ItemLayout
          titleLeft={
            <Box alignItems="flex-start">
              <Text variant="label03" mb="5" textAlign="left">
                {t({
                  id: 'earn.total_locked',
                  message: 'Total locked',
                })}
              </Text>
            </Box>
          }
          titleRight={
            <Box alignItems="flex-end">
              <Balance balance={quoteLockedBalance} variant="label01" />
              <Balance balance={stxLockedBalance} variant="caption01" />
            </Box>
          }
        />
      </Box>
    </Box>
  );
}
