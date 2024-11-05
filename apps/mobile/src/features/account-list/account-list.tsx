import { AvatarIcon } from '@/components/avatar-icon';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { defaultIconTestId } from '@/utils/testing-utils';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { AccountListItem } from './account-list-item';
import { AccountAddress } from './components/account-address';
import { AccountBalance } from './components/account-balance';

interface AccountListProps {
  accounts: Account[];
  onPress(account: Account): void;
  showWalletInfo?: boolean;
}
export function AccountList({ accounts, onPress, showWalletInfo }: AccountListProps) {
  const theme = useTheme<Theme>();

  return accounts.map(account => (
    <WalletLoader fingerprint={account.fingerprint} key={account.id}>
      {wallet => (
        <AccountListItem
          accountName={account.name}
          address={
            <AccountAddress accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
          }
          balance={
            <AccountBalance accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
          }
          icon={<AvatarIcon color={theme.colors['ink.background-primary']} icon={account.icon} />}
          iconTestID={defaultIconTestId(account.icon)}
          onPress={() => onPress(account)}
          testID={TestId.walletListAccountCard}
          walletName={showWalletInfo ? wallet.name : ' '}
        />
      )}
    </WalletLoader>
  ));
}
