import { AccountAvatar } from '@/features/account/components/account-avatar';
import { AccountBalance } from '@/features/balances/total-balance';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { defaultIconTestId } from '@/utils/testing-utils';

import { AccountAddress } from '../components/account-address';
import { AccountListItem } from './account-list-item';

interface AccountListProps {
  accounts: Account[];
  onPress(account: Account): void;
  showWalletInfo?: boolean;
}
export function AccountList({ accounts, onPress, showWalletInfo }: AccountListProps) {
  return accounts.map(account => (
    <WalletLoader fingerprint={account.fingerprint} key={account.id}>
      {wallet => (
        <AccountListItem
          accountName={account.name}
          address={
            <AccountAddress accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
          }
          balance={
            <AccountBalance
              accountIndex={account.accountIndex}
              fingerprint={account.fingerprint}
              variant="label02"
            />
          }
          icon={<AccountAvatar icon={account.icon} />}
          iconTestID={defaultIconTestId(account.icon)}
          onPress={() => onPress(account)}
          testID={TestId.walletListAccountCard}
          walletName={showWalletInfo ? wallet.name : undefined}
          px="5"
          py="3"
        />
      )}
    </WalletLoader>
  ));
}
