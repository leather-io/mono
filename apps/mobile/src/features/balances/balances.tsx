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

import { AccountId, FungibleCryptoAsset, Money } from '@leather.io/models';
import { Box, SheetRef } from '@leather.io/ui/native';

export interface BalanceViewProps {
  mode: ViewMode;
  onPress?: ({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
}

export interface OnOpenTokenProps {
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  quoteBalance: Money;
}

export function AllAccountBalances({ mode }: BalanceViewProps) {
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);
  const runesFlag = useRunesFlag();

  const tokenSheetRef = useRef<SheetRef>(null);

  function onOpenToken({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) {
    setSheetData({ asset, availableBalance, quoteBalance });
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  return (
    <>
      <Box flex={1} height="100%">
        <BitcoinBalance
          onPress={({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) =>
            onOpenToken({ asset, availableBalance, quoteBalance })
          }
        />
        <StacksBalance
          onPress={({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) =>
            onOpenToken({ asset, availableBalance, quoteBalance })
          }
        />
        <Sip10Balance
          mode={mode}
          onPress={({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) =>
            onOpenToken({ asset, availableBalance, quoteBalance })
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
          onPress={({ asset, availableBalance, quoteBalance }) =>
            onOpenToken({
              asset,
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
          onPress={({ asset, availableBalance, quoteBalance }) =>
            onOpenToken({ asset, accountIndex, fingerprint, availableBalance, quoteBalance })
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
