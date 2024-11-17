import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { AccountId } from '@/models/domain.model';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';

import { Widget } from '../components/widget';

export function TokensWidget({ children }: HasChildren) {
  return (
    <Widget>
      <Widget.Header>
        <Widget.Title title={t({ id: 'tokens.header_title', message: 'My tokens' })} />
      </Widget.Header>
      <Widget.Body>{children}</Widget.Body>
    </Widget>
  );
}

export function AllAccountBalances() {
  return (
    <>
      <BitcoinBalance />
      <StacksBalance />
    </>
  );
}

export function AccountBalances({ fingerprint, accountIndex }: AccountId) {
  return (
    <>
      <BitcoinBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
      <StacksBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
    </>
  );
}
