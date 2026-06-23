import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import type { Money, VaultAccount, VaultAccountSummary } from '@leather.io/models';
import {
  createBtcBalanceQueryConfig,
  createStxAccountBalanceQueryConfig,
} from '@leather.io/queries';

import { useMultisigAccountAddresses } from './use-multisig-account-addresses';

interface VaultAccountBalance {
  crypto?: Money;
  fiat?: Money;
}

export function useVaultAccountBalance(
  account?: VaultAccount | VaultAccountSummary
): VaultAccountBalance {
  const settings = useUserSettings();
  const accountAddresses = useMultisigAccountAddresses(account);
  const request = { account: accountAddresses };
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

export function useVaultAccountsBalance(): VaultAccountBalance {
  return {};
}
