import { Screen } from '@/components/screen/screen';
import { HeaderTitleWithSubtitle } from '@/components/screen/screen-header/components/header-title-with-subtitle';
import { AssetsFlashList } from '@/features/balances/assets/assets-flashlist';
import { AccountBalance } from '@/features/balances/total-balance';
import { useTokenDetailsFlag } from '@/features/feature-flags';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { useRunesAccountBalance } from '@/queries/balance/runes-balance.query';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';
import { router, useLocalSearchParams } from 'expo-router';

import { Box, SkeletonLoader, Text } from '@leather.io/ui/native';

import { configureAccountParamsSchema } from './index';

export default function BalancesScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const sip10Data = useSip10AccountBalance(fingerprint, accountIndex);
  const runesData = useRunesAccountBalance(fingerprint, accountIndex);

  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });

  const tokenDetailsFlag = useTokenDetailsFlag();

  function onOpenToken(tokenId: string) {
    router.navigate({
      pathname: '/account/[accountId]/token/[tokenId]',
      params: { accountId, tokenId },
    });
    analytics.track('token_details_opened', { tokenId, source: 'all_account_balances' });
  }
  const onPressToken = tokenDetailsFlag ? onOpenToken : undefined;

  const pageTitle = t`All tokens`;
  const isLoading = totalBalance.state === 'loading';

  return (
    <Screen>
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
      <AssetsFlashList
        header={
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
        }
        onPressToken={onPressToken}
        sip10Data={sip10Data}
        runesData={runesData}
      />
    </Screen>
  );
}
