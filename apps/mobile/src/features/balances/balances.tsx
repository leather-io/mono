import { useState } from 'react';
import { createContext, useContext, useRef } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';
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
import { analytics } from '@/utils/analytics';
import { router } from 'expo-router';

import { AccountId } from '@leather.io/models';
import { HasChildren, SheetRef } from '@leather.io/ui/native';
import { Box } from '@leather.io/ui/native';

export interface BalanceViewProps {
  mode: ViewMode;
  onPress?: (tokenId: string) => void;
}

export function AllAccountBalances({ mode }: BalanceViewProps) {
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);
  const runesFlag = useRunesFlag();

  const tokenSheetRef = useRef<SheetRef>(null);

  function onOpenToken(tokenId: string) {
    setSheetData({ tokenId });
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  return (
    <>
      <Box flex={1} height="100%">
        <BitcoinBalance onPress={() => onOpenToken('BTC')} />
        <StacksBalance onPress={() => onOpenToken('STX')} />
        <Sip10Balance mode={mode} onPress={(tokenId: string) => onOpenToken(tokenId)} />
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
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  // > PETE - investigate passing the balance data needed from BitcoinBalanceByAccount etc.
  // > then i won't need to re-use the hook and can just pass on the data when the sheet is opened
  // > not sure if that's good though. Avoids using my other hook though

  return (
    <>
      <Box>
        <BitcoinBalanceByAccount
          onPress={() => onOpenToken({ tokenId: 'BTC', accountIndex, fingerprint })}
          fingerprint={fingerprint}
          accountIndex={accountIndex}
        />
        <StacksBalanceByAccount
          onPress={() => onOpenToken({ tokenId: 'STX', accountIndex, fingerprint })}
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
