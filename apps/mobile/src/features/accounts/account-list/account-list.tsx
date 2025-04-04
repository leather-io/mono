import { AccountAvatar } from '@/features/accounts/components/account-avatar';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { WalletLoader } from '@/store/wallets/wallets.read';

import { AccountAddress } from '../components/account-address';
import { AccountBalance } from '../components/account-balance';
import { AccountListItem } from './account-list-item';

interface AccountListProps {
  accounts: Account[];
  onPress(account: Account): void;
  showWalletInfo?: boolean;
}
export function AccountList({ accounts, onPress, showWalletInfo }: AccountListProps) {
  return accounts.map((account, index) => (
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
          onPress={() => onPress(account)}
          testID={`${TestId.walletListAccountCard}-${index}`}
          walletName={showWalletInfo ? wallet.name : undefined}
          px="5"
          py="3"
        />
      )}
    </WalletLoader>
  ));
}
