import { configureAccountParamsSchema } from '@/app/(tabs)/(index)/account/[accountId]';
import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { useTokenDetailsFlag } from '@/features/feature-flags';
import { analytics } from '@/utils/analytics';
import { router, useLocalSearchParams } from 'expo-router';

import { AccountId, CryptoAssetProtocol } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { TokenDetailsProps } from '../token/types';
import { AssetsBalance } from './assets/assets-balance';
import { AssetsBalanceByAccount } from './assets/assets-balance-by-account';

export function AllAccountBalancesWidget() {
  const tokenDetailsFlag = useTokenDetailsFlag();

  function onOpenToken(tokenDetails: TokenDetailsProps) {
    router.navigate({
      pathname: '/token/[assetProtocol]/[tokenId]',
      params: { assetProtocol: tokenDetails.assetProtocol, tokenId: tokenDetails.tokenId },
    });
    analytics.track('token_details_opened', {
      tokenId: tokenDetails.tokenId,
      source: 'all_account_balances',
    });
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

  function onOpenToken(tokenDetails: TokenDetailsProps) {
    router.navigate({
      pathname: '/account/[accountId]/token/[assetProtocol]/[tokenId]',
      params: {
        tokenId: tokenDetails.tokenId,
        accountId,
        assetProtocol: tokenDetails.assetProtocol,
      },
    });
    analytics.track('token_details_opened', {
      tokenId: tokenDetails.tokenId,
      source: 'account_balances',
    });
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
