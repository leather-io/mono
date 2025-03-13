import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { RunesBalance, RunesBalanceByAccount } from '@/features/balances/bitcoin/runes-balance';
import { Sip10Balance, Sip10BalanceByAccount } from '@/features/balances/stacks/sip10-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';

import { AccountId } from '@leather.io/models';

export interface HardCap {
  hardCap?: boolean;
}

// FIXME LEA-2310: introduce hardCap prop to balances pending sorting
export function AllAccountBalances({ hardCap }: HardCap) {
  return (
    <>
      <BitcoinBalance />
      <StacksBalance />
      <Sip10Balance hardCap={hardCap} />
      <RunesBalance hardCap={hardCap} />
    </>
  );
}

// FIXME LEA-2310: introduce hardCap prop to balances pending sorting
export function AccountBalances({ hardCap, fingerprint, accountIndex }: AccountId & HardCap) {
  return (
    <>
      <BitcoinBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
      <StacksBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
      <Sip10BalanceByAccount
        hardCap={hardCap}
        fingerprint={fingerprint}
        accountIndex={accountIndex}
      />
      <RunesBalanceByAccount
        hardCap={hardCap}
        fingerprint={fingerprint}
        accountIndex={accountIndex}
      />
    </>
  );
}
