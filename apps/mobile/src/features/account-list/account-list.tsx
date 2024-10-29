import { AvatarIcon } from '@/components/avatar-icon';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { AccountListItem } from './account-list-item';

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
          address={t`Address`}
          balance={t`$1234`}
          icon={<AvatarIcon color={theme.colors['ink.background-primary']} icon={account.icon} />}
          iconTestID={defaultIconTestId(account.icon)}
          onPress={() => onPress(account)}
          testID={TestId.walletListAccountCard}
          walletName={showWalletInfo ? wallet.name : undefined}
        />
      )}
    </WalletLoader>
  ));
}
