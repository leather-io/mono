import { configureAccountParamsSchema } from '@/app/(tabs)/(index)/account/[accountId]';
import { configureTokenParamsSchema } from '@/app/(tabs)/(index)/token/[tokenId]';
import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { useTokenDetailsFlag } from '@/features/feature-flags';
import { analytics } from '@/utils/analytics';
import { router, useLocalSearchParams } from 'expo-router';

import { AccountId } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { AssetsBalance } from './assets/assets-balance';
import { AssetsBalanceByAccount } from './assets/assets-balance-by-account';

export function AllAccountBalancesWidget() {
  const tokenDetailsFlag = useTokenDetailsFlag();
  // const params = useLocalSearchParams();
  // const { tokenId } = configureTokenParamsSchema.parse(params);

  function onOpenToken(tokenId: string) {
    router.navigate({
      pathname: '/token/[tokenId]',
      params: { tokenId },
    });
    analytics.track('token_details_opened', { tokenId, source: 'all_account_balances' });
  }

  const onPressToken = tokenDetailsFlag ? onOpenToken : undefined;

  return (
    <>
      <Box flex={1} height="100%">
        <BitcoinBalance onPress={onPressToken} />
        <StacksBalance onPress={onPressToken} />
        <AssetsBalance onPress={onPressToken} />
      </Box>
    </>
  );
}

export function AccountBalances({ fingerprint, accountIndex }: AccountId) {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);

  const tokenDetailsFlag = useTokenDetailsFlag();

  function onOpenToken(tokenId: string) {
    router.navigate({
      pathname: '/account/[accountId]/token/[tokenId]',
      params: { tokenId, accountId },
    });
    analytics.track('token_details_opened', { tokenId, source: 'account_balances' });
  }

  const onPressToken = tokenDetailsFlag ? onOpenToken : undefined;

  return (
    <>
      <Box>
        <BitcoinBalanceByAccount
          onPress={onPressToken}
          fingerprint={fingerprint}
          accountIndex={accountIndex}
        />
        <StacksBalanceByAccount
          onPress={onPressToken}
          fingerprint={fingerprint}
          accountIndex={accountIndex}
        />
        <AssetsBalanceByAccount
          fingerprint={fingerprint}
          accountIndex={accountIndex}
          onPress={onPressToken}
        />
      </Box>
    </>
  );
}
