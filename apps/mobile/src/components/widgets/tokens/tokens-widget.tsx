import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { Sip10Balance, Sip10BalanceByAccount } from '@/features/balances/stacks/sip10-balance';
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
      <Sip10Balance />
      {/* TODO: 
      - need to limit to 5 items here, maybe use a size? or else limit to 3 SIP10s for now
      - RunesBalance 
      */}
    </>
  );
}

export function AccountBalances({ fingerprint, accountIndex }: AccountId) {
  return (
    <>
      <BitcoinBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
      <StacksBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
      <Sip10BalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
    </>
  );
}
