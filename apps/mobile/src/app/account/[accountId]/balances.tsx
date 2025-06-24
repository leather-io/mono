import { Screen } from '@/components/screen/screen';
import { HeaderTitleWithSubtitle } from '@/components/screen/screen-header/components/header-title-with-subtitle';
import { AccountBalances } from '@/features/balances/balances';
import { AccountBalance } from '@/features/balances/total-balance';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { useLocalSearchParams } from 'expo-router';

import { Box, SkeletonLoader, Text } from '@leather.io/ui/native';

import { configureAccountParamsSchema } from './index';

export default function BalancesScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);

  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });

  const pageTitle = t({
    id: 'balances.header_title',
    message: 'All tokens',
  });
  const isLoading = totalBalance.state === 'loading';

  return (
    <Screen enableHeaderScrollAnimation>
      <Screen.Header
        centerElement={
          <HeaderTitleWithSubtitle
            title={
              <AccountBalance
                fingerprint={fingerprint}
                accountIndex={accountIndex}
                variant="heading05"
              />
            }
            subtitle={pageTitle}
          />
        }
      />
      <Screen.ScrollView refreshControl={<RefreshControl />}>
        <Screen.HeaderAnimationTarget>
          <Box px="5" pb="5" mb="3">
            <Text variant="label01">{pageTitle}</Text>
            {isLoading ? (
              <SkeletonLoader width={55} height={24} isLoading={isLoading} />
            ) : (
              <AccountBalance
                fingerprint={fingerprint}
                accountIndex={accountIndex}
                variant="heading03"
              />
            )}
          </Box>
        </Screen.HeaderAnimationTarget>
        <AccountBalances mode="full" fingerprint={fingerprint} accountIndex={accountIndex} />
      </Screen.ScrollView>
    </Screen>
  );
}
