import { AccountStore } from '@/store/accounts/utils';
import { WalletStore } from '@/store/wallets/utils';
import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';

export interface MockedAccount extends AccountStore {
  type: WalletStore['type'];
  balance: Money;
  fingerprint: string;
  accountIndex: number;
}

interface MockedAccountData {
  accounts: MockedAccount[];
  balance: Money;
}

// FIXME: this is fake data for now - need to implement fetch of account?.type + balances
export const getMockAccounts = (accounts: AccountStore[]): MockedAccountData => {
  const mockAccounts = accounts.map((account, index) => {
    return {
      ...account,
      type: 'software',
      balance: {
        amount: new BigNumber(index + 10000000),
        symbol: 'USD',
        decimals: 2,
      },
    } as MockedAccount;
  });

  const totalBalance = mockAccounts
    .reduce((sum, account) => sum.plus(account.balance.amount), new BigNumber(0))
    .toNumber();

  return {
    accounts: mockAccounts,
    balance: {
      amount: new BigNumber(totalBalance),
      symbol: 'USD',
      decimals: 2,
    },
  };
};
