import { Balance } from '@/components/balance/balance';
import { AccountListItem } from '@/features/account/account-list/account-list-item';
import { useTokenDetailsFlag } from '@/features/feature-flags';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { WalletStore } from '@/store/wallets/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { t } from '@lingui/core/macro';
import { router } from 'expo-router';

import { Money } from '@leather.io/models';
import { ChevronRightIcon, Text } from '@leather.io/ui/native';
import { isDefined } from '@leather.io/utils';

import { AccountAvatar } from '../account/components/account-avatar';
import { BitcoinAccountListItem } from './bitcoin/bitcoin-token-details';
import { TokenDetailsCard } from './components/token-details-card';
import { useGetAccountTokenBalance } from './hooks/use-get-token-balance';
import { Sip10AccountListItem } from './stacks/sip10-token-details';
import { StacksAccountListItem } from './stacks/stacks-token-details';

interface AccountListProps {
  tokenId: string;
}

// AccountList should be a wrapper that gets its specific AccountListItem based on the tokenId context
// PETE this is the last hurrah before removing useGetAccountTokenBalance and the final refactor

export function AccountList({ tokenId }: AccountListProps) {
  const accounts = useAccounts('active');

  return (
    <TokenDetailsCard title={t`Accounts`}>
      {accounts.list.map(account => (
        <WalletLoader fingerprint={account.fingerprint} key={account.id}>
          {/* try achieve this with component composition */}
          {wallet => {
            switch (tokenId) {
              case 'BTC':
                return (
                  <BitcoinAccountListItem
                    account={account}
                    wallet={wallet}
                    accountIndex={account.accountIndex}
                    fingerprint={account.fingerprint}
                  />
                );
              case 'STX':
                return (
                  <StacksAccountListItem
                    account={account}
                    wallet={wallet}
                    accountIndex={account.accountIndex}
                    fingerprint={account.fingerprint}
                  />
                );
              default:
                return (
                  <Sip10AccountListItem
                    account={account}
                    wallet={wallet}
                    accountIndex={account.accountIndex}
                    fingerprint={account.fingerprint}
                    tokenId={tokenId}
                  />
                );
            }
          }}
        </WalletLoader>
      ))}
    </TokenDetailsCard>
  );
}

interface AccountListItemProps {
  account: Account;
  wallet: WalletStore;
  tokenId: string;
  availableBalance: Money;
  quoteBalance: Money;
}

export function TokenDetailsAccountListItem({
  account,
  wallet,
  availableBalance,
  quoteBalance,
  tokenId,
}: AccountListItemProps) {
  const tokenDetailsFlag = useTokenDetailsFlag();

  const onSelectAccount = () => {
    if (tokenDetailsFlag) {
      router.navigate({
        pathname: '/account/[accountId]/token/[tokenId]',
        params: { tokenId: tokenId, accountId: account.id },
      });
    }
  };

  // Hide if no balance
  // probably also hide BTC/STX if no balance
  if (!isDefined(availableBalance) && !isDefined(quoteBalance)) {
    return null;
  }
  return (
    <AccountListItem
      px="0"
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
