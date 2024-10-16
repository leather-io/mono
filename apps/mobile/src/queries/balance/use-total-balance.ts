import { AccountId } from '@/models/domain.model';
import {
  useBitcoinAccountTotalBitcoinBalance,
  useWalletTotalBitcoinBalance,
} from '@/queries/balance/bitcoin-balance.query';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

import { Money } from '@leather.io/models';
import { sumMoney } from '@leather.io/utils';

interface TotalBalance {
  btcBalance: Money;
  btcBalanceUsd: Money;
  stxBalance: Money;
  stxBalanceUsd: Money;
  totalBalance: Money;
}

export function useGetStacksAddresses(accountId?: AccountId) {
  const signers = useStacksSigners();

  if (!accountId) {
    return signers.list.map(signer => signer.address);
  }

  const { fingerprint } = accountId;
  return signers.list
    .filter(signer => signer.descriptor.includes(fingerprint))
    .map(signer => signer.address);
}

export function useWalletTotalBalance(): TotalBalance {
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
