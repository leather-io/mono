import { Account } from '@/store/accounts/accounts';

import { AccountActions } from './components/account-actions';
import { AccountStacking } from './components/account-stacking';
import { AccountTotalBalance } from './components/account-total-balance';

interface AccountDetailsProps {
  account: Account;
}

export function AccountDetails({ account }: AccountDetailsProps) {
  return (
    <>
      <AccountTotalBalance account={account} />
      <AccountStacking account={account} />
      <AccountActions />
    </>
  );
}
