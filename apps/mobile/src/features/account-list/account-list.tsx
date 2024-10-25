import { AvatarIcon } from '@/components/avatar-icon';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Theme } from '@leather.io/ui/native';

import { AccountListItem } from './account-list-item';

interface AccountListProps {
  accounts: Account[];
  navigateToPath: string;
  walletFingerprint: string;
  walletName?: string;
}
export function AccountList({
  accounts,
  navigateToPath,
  walletFingerprint,
  walletName,
}: AccountListProps) {
  const router = useRouter();
  const theme = useTheme<Theme>();

  return accounts.map(account => (
    <AccountListItem
      accountName={account.name}
      address={t`Address`}
      balance={t`$1234`}
      icon={<AvatarIcon color={theme.colors['ink.background-primary']} icon={account.icon} />}
      iconTestID={defaultIconTestId(account.icon)}
      key={account.id}
      onPress={() => {
        router.navigate({
          pathname: navigateToPath,
          params: { fingerprint: walletFingerprint, account: account.accountIndex },
        });
      }}
      testID={TestId.walletListAccountCard}
      walletName={walletName}
    />
  ));
}
