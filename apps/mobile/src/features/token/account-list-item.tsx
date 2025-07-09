import { Balance } from '@/components/balance/balance';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useLingui } from '@lingui/react';

import { Cell, Text } from '@leather.io/ui/native';

import { AccountAvatar } from '../account/components/account-avatar';

interface AccountListItemProps {
  account: Account;
}

export function AccountListItem({ account }: AccountListItemProps) {
  const { i18n } = useLingui();
  const { state, value } = useBtcAccountBalance(account.fingerprint, account.accountIndex);

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
            {/* this should be the wallet name. maybe that should be added to account to make it easier?  */}
            {account.name}
          </Text>
        </Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">
          <Balance balance={availableBalance} variant="label02" isQuoteCurrency={true} />
        </Cell.Label>
        <Cell.Label variant="secondary">
          <Balance
            balance={quoteBalance}
            variant="caption01"
            color="ink.text-subdued"
            isQuoteCurrency={true}
          />
        </Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
