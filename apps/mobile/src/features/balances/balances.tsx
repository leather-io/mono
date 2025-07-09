import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { RunesBalance, RunesBalanceByAccount } from '@/features/balances/bitcoin/runes-balance';
import { Sip10Balance, Sip10BalanceByAccount } from '@/features/balances/stacks/sip10-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { useRunesFlag } from '@/features/feature-flags';
import { ViewMode } from '@/shared/types';
import { router } from 'expo-router';

import { AccountId } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

export interface BalanceViewProps {
  mode: ViewMode;
}

export function AllAccountBalances({ mode }: BalanceViewProps) {
  const runesFlag = useRunesFlag();
  return (
    <Box flex={1} height="100%">
      <BitcoinBalance
        onPress={() => {
          router.navigate({
            pathname: '/token/[tokenId]',
            params: {
              tokenId: 'BTC',
            },
          });
        }}
      />
      <StacksBalance />
      <Sip10Balance mode={mode} />
      {runesFlag && <RunesBalance mode={mode} />}
    </Box>
  );
}

export function AccountBalances({ mode, fingerprint, accountIndex }: AccountId & BalanceViewProps) {
  const runesFlag = useRunesFlag();
  return (
    <Box>
      <BitcoinBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
      <StacksBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
      <Sip10BalanceByAccount mode={mode} fingerprint={fingerprint} accountIndex={accountIndex} />
      {runesFlag && (
        <RunesBalanceByAccount mode={mode} fingerprint={fingerprint} accountIndex={accountIndex} />
      )}
    </Box>
  );
}
