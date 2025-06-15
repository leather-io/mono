import { Screen } from '@/components/screen/screen';
import { AllAccountBalances } from '@/features/balances/balances';
import { TotalBalance } from '@/features/balances/total-balance';
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
      <Screen.ScrollView>
        {/* TODO: This was previously called "ReverisbleHeader. The behavior wasn't clear. Clarify out and replicate. */}
        <Box px="5" pb="5" mb="3">
          <Text variant="label01">{pageTitle}</Text>
          <TotalBalance variant="heading03" />
        </Box>
        <AllAccountBalances mode="full" />
      </Screen.ScrollView>
    </Screen>
  );
}
