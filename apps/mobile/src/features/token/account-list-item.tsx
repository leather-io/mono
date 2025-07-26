import { Balance } from '@/components/balance/balance';
import { AccountListItem as AccountListItemComponent } from '@/features/account/account-list/account-list-item';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { WalletStore } from '@/store/wallets/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';

import { ChevronRightIcon, Text } from '@leather.io/ui/native';

import { AccountAvatar } from '../account/components/account-avatar';
import { TokenDetailsCard } from './components/token-details-card';
import { useGetAccountTokenBalance } from './hooks/use-get-token-balance';

export function AccountList({
  tokenId,
  selectAccount,
}: {
  tokenId: string;
  selectAccount: (account: Account) => void;
}) {
  const accounts = useAccounts('active');

  return (
    <TokenDetailsCard title={t({ id: 'token.details.accounts_title', message: 'Accounts' })}>
      {accounts.list.map(account => (
        <WalletLoader fingerprint={account.fingerprint} key={account.id}>
          {wallet => (
            <AccountListItem
              key={account.id}
              account={account}
              wallet={wallet}
              tokenId={tokenId}
              onPress={() => selectAccount(account)}
            />
          )}
        </WalletLoader>
      ))}
    </TokenDetailsCard>
  );
}

interface AccountListItemProps {
  account: Account;
  wallet: WalletStore;
  tokenId: string;
  onPress: () => void;
}

export function AccountListItem({ account, wallet, tokenId, onPress }: AccountListItemProps) {
  const tokenBalance = useGetAccountTokenBalance({ tokenId, account });
  const availableBalance = tokenBalance?.availableBalance;
  const quoteBalance = tokenBalance?.quoteBalance;

  return (
    <AccountListItemComponent
      px="0"
      accountName={account.name}
      walletName={
        <Text variant="caption01" lineHeight={16}>
          {/* Should perhaps refactor account to have a wallet name?  Avoids using the wallet store here */}
          {wallet.name}
        </Text>
      }
      // FIXME LEA-3015: refactor address prop to not be address - leftPrimary or something like  that
      address={
        <Balance
          balance={quoteBalance}
          formattingOptions={{ preset: 'shorthand-balance' }}
          variant="caption01"
          color="ink.text-subdued"
          isQuoteCurrency={tokenId === 'BTC'}
        />
      }
      balance={
        // FIXME LEA-3015: isQuoteCurrency is crashing for non BTC tokens
        // need to update balance to show ticker beside non BTC tokens IF not activity list
        <Balance
          formattingOptions={{ preset: 'shorthand-balance' }}
          balance={availableBalance}
          variant="label02"
          isQuoteCurrency={tokenId === 'BTC'}
        />
      }
      icon={<AccountAvatar icon={account.icon} />}
      chevron={<ChevronRightIcon width={16} height={16} />}
      onPress={onPress}
    />
  );
}
