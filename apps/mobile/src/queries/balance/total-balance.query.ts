import { AccountId } from '@/models/domain.model';
import {
  useBitcoinAccountTotalBitcoinBalance,
  useWalletTotalBitcoinBalance,
} from '@/queries/balance/bitcoin-balance.query';
import { useStxBalance } from '@/queries/balance/stx-balance.query';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';

import { Money } from '@leather.io/models';
import { sumMoney } from '@leather.io/utils';

import { useSip10AggregateAvailableBalance } from './sip10-balance.query';

interface TotalBalance {
  btcBalance: Money;
  btcBalanceUsd: Money;
  stxBalance: Money;
  stxBalanceUsd: Money;
  totalBalance: Money;
}

export function useTotalBalance(): TotalBalance {
  const stacksAddresses = useStacksSignerAddresses();
  const { availableBalance: stxBalance, fiatBalance: stxBalanceUsd } =
    useStxBalance(stacksAddresses);
  const { availableBalance: btcBalance, fiatBalance: btcBalanceUsd } =
    useWalletTotalBitcoinBalance();
  const sip10BalanceUsd = useSip10AggregateAvailableBalance(stacksAddresses);

  const totalBalance = sumMoney([btcBalanceUsd, stxBalanceUsd, sip10BalanceUsd]);
  return {
    btcBalance,
    btcBalanceUsd,
    stxBalance,
    stxBalanceUsd,
    totalBalance,
  };
}

export function useAccountTotalBalance(accountId: AccountId): TotalBalance {
  const { fingerprint, accountIndex } = accountId;
  const stacksAddress = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);
  if (!stacksAddress) {
    throw new Error('Stacks address not found');
  }
  const { availableBalance: stxBalance, fiatBalance: stxBalanceUsd } = useStxBalance([
    stacksAddress,
  ]);
  const { availableBalance: btcBalance, fiatBalance: btcBalanceUsd } =
    useBitcoinAccountTotalBitcoinBalance(accountId);
  const sip10BalanceUsd = useSip10AggregateAvailableBalance([stacksAddress]);
  const totalBalance = sumMoney([btcBalanceUsd, stxBalanceUsd, sip10BalanceUsd]);
  return {
    btcBalance,
    btcBalanceUsd,
    stxBalance,
    stxBalanceUsd,
    totalBalance,
  };
}
