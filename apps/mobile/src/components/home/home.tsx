import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import {
  CollectiblesWidget,
  mockCollectibles,
  serializeCollectibles,
} from '@/components/widgets/collectibles';
import { TokensWidget, getMockTokens } from '@/components/widgets/tokens';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

import { HomeLayout } from './home.layout';

const mockTotalBalance = {
  totalUsdBalance: '$126.74',
  totalBtcBalance: '0.00215005',
  totalStxBalance: '0.0024',
};

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();
  // const fingerPrintAccounts = useAccountsByFingerprint(fingerprint);

  // useTotalBalance probably needs to go to mono app

  const btcAddress = useCurrentAccountNativeSegwitAddressIndexZero();
  const { totalUsdBalance, isLoading, isLoadingAdditionalData } = useTotalBalance({
    btcAddress,
    stxAddress: account?.address || '',
  });

  const addresses = wallets.list.map(wallet => {
    console.log('wallet', wallet.fingerprint);
    const fingerprint = wallet.fingerprint;

    const accounts = useAccountsByFingerprint(fingerprint);

    return accounts.list.map(account => {
      const bitcoinAccounts = useBitcoinAccounts().accountIndexByPaymentType(
        wallet.fingerprint,
        account.accountIndex
      );
      const stacksAccounts = useStacksSigners().fromAccountIndex(
        wallet.fingerprint,
        account.accountIndex
      );
      return {
        bitcoinAccounts,
        stacksAccounts,
      };
    });
  });

  console.log('------- addresses -----', addresses);
  // console.log('accounts', accounts);

  return (
    <HomeLayout>
      <AccountsWidget accounts={accounts.list} wallets={wallets.list} />
      <TokensWidget tokens={getMockTokens()} totalBalance={mockTotalBalance.totalUsdBalance} />
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance.totalUsdBalance}
      />
    </HomeLayout>
  );
}
