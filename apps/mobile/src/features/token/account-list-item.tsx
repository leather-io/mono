import { Balance } from '@/components/balance/balance';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { Account } from '@/store/accounts/accounts';
import { WalletStore } from '@/store/wallets/utils';
import { useLingui } from '@lingui/react';

import { Cell, Text } from '@leather.io/ui/native';

import { AccountAvatar } from '../account/components/account-avatar';

interface AccountListItemProps {
  account: Account;
  wallet: WalletStore;
}

export function AccountListItem({ account, wallet }: AccountListItemProps) {
  const { i18n } = useLingui();
  const { value } = useBtcAccountBalance(account.fingerprint, account.accountIndex);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;

  return (
    <Cell.Root pressable={false}>
      <Cell.Icon>
        <AccountAvatar icon={account.icon} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary" numberOfLines={1} ellipsizeMode="tail">
          {i18n._({
            id: 'accounts.account.cell_caption',
            message: '{name}',
            values: { name: account.name || '' },
          })}
        </Cell.Label>
        <Cell.Label variant="secondary">
          <Text variant="caption01" lineHeight={16}>
            {/* Should perhaps refactor account to have a wallet name?  Avoids using the wallet store here */}
            {wallet.name}
          </Text>
        </Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">
          <Balance balance={availableBalance} variant="label02" isQuoteCurrency />
        </Cell.Label>
        <Cell.Label variant="secondary">
          <Balance
            balance={quoteBalance}
            variant="caption01"
            color="ink.text-subdued"
            isQuoteCurrency
          />
        </Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
