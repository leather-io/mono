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
  const accounts = useAccounts();
  return (
    <TokenDetailsCard title={t({ id: 'token.details.accounts_title', message: 'Accounts' })}>
      {accounts.list
        .filter(account => account.status !== 'hidden')
        .map(account => (
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
      // FIXME: refactor this name to not be address - leftPrimary or something like  that
      // for some reason it says STX 74 not 74 STX?? investigate

      address={
        <Balance
          balance={quoteBalance}
          variant="caption01"
          color="ink.text-subdued"
          isQuoteCurrency
        />
      }
      balance={
        // FIXME: isQuoteCurrency is crashing for non BTC tokens
        <Balance balance={availableBalance} variant="label02" isQuoteCurrency={tokenId === 'BTC'} />
      }
      icon={<AccountAvatar icon={account.icon} />}
      chevron={<ChevronRightIcon width={16} height={16} />}
      onPress={onPress}
    />
  );
}
