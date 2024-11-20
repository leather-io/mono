import { useGetStacksAddresses } from '@/features/balances/stacks/use-get-stacks-addresses';
import { AccountId } from '@/models/domain.model';
import {
  useBitcoinAccountTotalBitcoinBalance,
  useWalletTotalBitcoinBalance,
} from '@/queries/balance/bitcoin-balance.query';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';

import { Money } from '@leather.io/models';
import { sumMoney } from '@leather.io/utils';

interface TotalBalance {
  btcBalance: Money;
  btcBalanceUsd: Money;
  stxBalance: Money;
  stxBalanceUsd: Money;
  totalBalance: Money;
}

export function useTotalBalance(): TotalBalance {
  const stacksAddresses = useGetStacksAddresses();
  const { availableBalance: stxBalance, fiatBalance: stxBalanceUsd } =
    useStxBalance(stacksAddresses);
  const { availableBalance: btcBalance, fiatBalance: btcBalanceUsd } =
    useWalletTotalBitcoinBalance();

  const totalBalance = sumMoney([btcBalanceUsd, stxBalanceUsd]);
  return {
    btcBalance,
    btcBalanceUsd,
    stxBalance,
    stxBalanceUsd,
    totalBalance,
  };
}

export function useAccountTotalBalance(accountId: AccountId): TotalBalance {
  const stacksAddresses = useGetStacksAddresses(accountId);
  console.log('useAccountTotalBalance', accountId, 'stacksAddresses', stacksAddresses);
  const { availableBalance: stxBalance, fiatBalance: stxBalanceUsd } =
    useStxBalance(stacksAddresses);
  const { availableBalance: btcBalance, fiatBalance: btcBalanceUsd } =
    useBitcoinAccountTotalBitcoinBalance(accountId);

  const totalBalance = sumMoney([btcBalanceUsd, stxBalanceUsd]);
  return {
    btcBalance,
    btcBalanceUsd,
    stxBalance,
    stxBalanceUsd,
    totalBalance,
  };
}
