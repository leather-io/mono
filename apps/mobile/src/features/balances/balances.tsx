import { useRef, useState } from 'react';

import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { RunesBalance, RunesBalanceByAccount } from '@/features/balances/bitcoin/runes-balance';
import { Sip10Balance, Sip10BalanceByAccount } from '@/features/balances/stacks/sip10-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { useRunesFlag } from '@/features/feature-flags';
import { TokenSheet, TokenSheetData } from '@/features/token/token-sheet';
import { ViewMode } from '@/shared/types';

import { AccountId, Money } from '@leather.io/models';
import { Box, SheetRef } from '@leather.io/ui/native';

export interface BalanceViewProps {
  mode: ViewMode;
  onPress?: ({ tokenId, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
}

export interface OnOpenTokenProps {
  tokenId: string;
  availableBalance: Money;
  quoteBalance: Money;
}

export function AllAccountBalances({ mode }: BalanceViewProps) {
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);
  const runesFlag = useRunesFlag();

  const tokenSheetRef = useRef<SheetRef>(null);

  function onOpenToken({ tokenId, availableBalance, quoteBalance }: OnOpenTokenProps) {
    console.log('onOpenToken', tokenId, availableBalance, quoteBalance);
    setSheetData({ tokenId, availableBalance, quoteBalance });
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  return (
    <>
      <Box flex={1} height="100%">
        <BitcoinBalance
          onPress={({ tokenId, availableBalance, quoteBalance }: OnOpenTokenProps) =>
            onOpenToken({ tokenId, availableBalance, quoteBalance })
          }
        />
        <StacksBalance
          onPress={({ tokenId, availableBalance, quoteBalance }: OnOpenTokenProps) =>
            onOpenToken({ tokenId, availableBalance, quoteBalance })
          }
        />
        <Sip10Balance
          mode={mode}
          onPress={({ tokenId, availableBalance, quoteBalance }: OnOpenTokenProps) =>
            onOpenToken({ tokenId, availableBalance, quoteBalance })
          }
        />
        {runesFlag && <RunesBalance mode={mode} />}
      </Box>
      <TokenSheet data={sheetData} sheetRef={tokenSheetRef} />
    </>
  );
}

export function AccountBalances({ mode, fingerprint, accountIndex }: AccountId & BalanceViewProps) {
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);
  const runesFlag = useRunesFlag();

  const tokenSheetRef = useRef<SheetRef>(null);

  function onOpenToken(data: TokenSheetData) {
    setSheetData(data);
    console.log('onOpenToken', data);
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  // > FIXME LEA-3015: investigate passing the balance data needed from BitcoinBalanceByAccount etc.

  return (
    <>
      <Box>
        <BitcoinBalanceByAccount
          onPress={({ tokenId, availableBalance, quoteBalance }) =>
            onOpenToken({
              tokenId,
              accountIndex,
              fingerprint,
              availableBalance,
              quoteBalance,
            })
          }
          fingerprint={fingerprint}
          accountIndex={accountIndex}
        />
        <StacksBalanceByAccount
          onPress={({ tokenId, availableBalance, quoteBalance }) =>
            onOpenToken({ tokenId, accountIndex, fingerprint, availableBalance, quoteBalance })
          }
          fingerprint={fingerprint}
          accountIndex={accountIndex}
        />
        <Sip10BalanceByAccount mode={mode} fingerprint={fingerprint} accountIndex={accountIndex} />
        {runesFlag && (
          <RunesBalanceByAccount
            mode={mode}
            fingerprint={fingerprint}
            accountIndex={accountIndex}
          />
        )}
      </Box>
      <TokenSheet data={sheetData} sheetRef={tokenSheetRef} />
    </>
  );
}
