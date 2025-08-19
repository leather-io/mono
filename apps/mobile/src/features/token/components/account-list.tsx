import { Balance } from '@/components/balance/balance';
import { AccountListItem } from '@/features/account/account-list/account-list-item';
import { useTokenDetailsFlag } from '@/features/feature-flags';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { WalletStore } from '@/store/wallets/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { t } from '@lingui/core/macro';
import { router } from 'expo-router';

import { CryptoAssetProtocol, Money } from '@leather.io/models';
import { Box, ChevronRightIcon, Text } from '@leather.io/ui/native';
import { isDefined } from '@leather.io/utils';

import { AccountAvatar } from '../../account/components/account-avatar';
import { TokenDetailsCard } from './token-details-card';

interface AccountListProps {
  listItem: (account: Account, wallet: WalletStore) => React.ReactNode;
}

export function AccountList({ listItem }: AccountListProps) {
  const accounts = useAccounts('active');

  return (
    <TokenDetailsCard title={t`Accounts`}>
      <Box mx="-5">
        {accounts.list.map(account => (
          <WalletLoader fingerprint={account.fingerprint} key={account.id}>
            {wallet => listItem(account, wallet)}
          </WalletLoader>
        ))}
      </Box>
    </TokenDetailsCard>
  );
}

interface AccountListItemProps {
  account: Account;
  assetProtocol: CryptoAssetProtocol;
  availableBalance: Money;
  quoteBalance: Money;
  tokenId: string;
  wallet: WalletStore;
}

export function TokenDetailsAccountListItem({
  account,
  assetProtocol,
  availableBalance,
  quoteBalance,
  tokenId,
  wallet,
}: AccountListItemProps) {
  const tokenDetailsFlag = useTokenDetailsFlag();

  function onSelectAccount() {
    if (tokenDetailsFlag) {
      router.navigate({
        pathname: '/account/[accountId]/token/[assetProtocol]/[tokenId]',
        params: {
          tokenId: tokenId,
          accountId: account.id,
          assetProtocol,
        },
      });
    }
  }

  // Hide if no balance
  if (!isDefined(availableBalance) && !isDefined(quoteBalance)) {
    return null;
  }
  return (
    <AccountListItem
      accountName={account.name}
      walletName={
        <Text variant="caption01" lineHeight={16}>
          {wallet.name}
        </Text>
      }
      secondaryAside={
        <Balance
          balance={quoteBalance}
          formattingOptions={{ preset: 'shorthand-balance' }}
          variant="caption01"
          color="ink.text-subdued"
        />
      }
      balance={
        <Balance
          formattingOptions={{ preset: 'shorthand-balance' }}
          balance={availableBalance}
          variant="label02"
        />
      }
      icon={<AccountAvatar icon={account.icon} />}
      chevron={<ChevronRightIcon width={16} height={16} />}
      onPress={onSelectAccount}
    />
  );
}
