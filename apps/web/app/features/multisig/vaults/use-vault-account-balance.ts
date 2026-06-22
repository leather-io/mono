import { useQueries, useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import type { Money, VaultAccount, VaultAccountSummary } from '@leather.io/models';
import {
  createBtcBalanceQueryConfig,
  createStxAccountBalanceQueryConfig,
} from '@leather.io/queries';
import { isDefined, sumMoney } from '@leather.io/utils';

import { getMultisigAccountAddresses } from './use-multisig-account-addresses';

interface VaultAccountBalance {
  crypto?: Money;
  fiat?: Money;
}

export function useVaultAccountBalance(
  account?: VaultAccount | VaultAccountSummary
): VaultAccountBalance {
  const settings = useUserSettings();
  const request = { account: getMultisigAccountAddresses(account) };
  const isBitcoin = account?.network.startsWith('btc') ?? false;

  const btcQuery = useQuery({
    ...createBtcBalanceQueryConfig(request, settings),
    enabled: isBitcoin,
  });
  const stxQuery = useQuery({
    ...createStxAccountBalanceQueryConfig(request, settings),
    enabled: !!account && !isBitcoin,
  });

  const data = isBitcoin ? btcQuery.data : stxQuery.data;
  if (!data) return {};
  return {
    crypto: 'btc' in data ? data.btc.totalBalance : data.stx.totalBalance,
    fiat: data.quote.totalBalance,
  };
}

export function useVaultAccountsBalance(accounts?: VaultAccountSummary[]): VaultAccountBalance {
  const settings = useUserSettings();
  const list = accounts ?? [];

  const results = useQueries({
    queries: list.map(account => {
      const request = { account: getMultisigAccountAddresses(account) };
      return account.network.startsWith('btc')
        ? createBtcBalanceQueryConfig(request, settings)
        : createStxAccountBalanceQueryConfig(request, settings);
    }),
  });

  const balances = results.map(result => result.data).filter(isDefined);
  if (list.length === 0 || balances.length !== list.length) return {};

  const cryptos = balances.map(data =>
    'btc' in data ? data.btc.totalBalance : data.stx.totalBalance
  );
  const fiats = balances.map(data => data.quote.totalBalance);
  return { crypto: sumMoney(cryptos), fiat: sumMoney(fiats) };
}
