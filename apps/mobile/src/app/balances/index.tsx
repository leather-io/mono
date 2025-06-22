import { Screen } from '@/components/screen/screen';
import { AllAccountBalances } from '@/features/balances/balances';
import { TotalBalance } from '@/features/balances/total-balance';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export default function BalancesScreen() {
  const pageTitle = t({
    id: 'balances.header_title',
    message: 'All tokens',
  });

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView refreshControl={<RefreshControl />}>
        <Box px="5" pb="5" mb="3">
          <Text variant="label01">{pageTitle}</Text>
          <TotalBalance variant="heading03" />
        </Box>
        <AllAccountBalances mode="full" />
      </Screen.ScrollView>
    </Screen>
  );
}
