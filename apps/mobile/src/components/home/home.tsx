import { AccountWidget } from '@/components/widgets/account/account-widget';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

import { Earn } from './earn';
import { HomeLayout } from './home.layout';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  return (
    <HomeLayout>
      <AccountWidget accounts={accounts.list} wallets={wallets.list} />
      <Earn />
    </HomeLayout>
  );
}
