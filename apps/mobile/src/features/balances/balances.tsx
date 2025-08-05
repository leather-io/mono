import { useRef, useState } from 'react';

import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { RunesBalance, RunesBalanceByAccount } from '@/features/balances/bitcoin/runes-balance';
import { Sip10Balance, Sip10BalanceByAccount } from '@/features/balances/stacks/sip10-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { useRunesFlag, useTokenDetailsFlag } from '@/features/feature-flags';
import { TokenSheet, TokenSheetData } from '@/features/token/token-sheet';
import { ViewMode } from '@/shared/types';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

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
  const tokenDetailsFlag = useTokenDetailsFlag();

  const tokenSheetRef = useRef<SheetRef>(null);

  function onOpenToken({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) {
    setSheetData({ asset, availableBalance, quoteBalance });
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  const onPressToken = tokenDetailsFlag ? onOpenToken : undefined;

  return (
    <>
      <Box flex={1} height="100%">
        <BitcoinBalance onPress={onPressToken} />
        <StacksBalance onPress={onPressToken} />
        <Sip10Balance mode={mode} onPress={onPressToken} />
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
  const tokenDetailsFlag = useTokenDetailsFlag();

  function onOpenToken(data: TokenSheetData) {
    setSheetData(data);
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }
  const { nativeSegwitPayerAddress, taprootPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    fingerprint,
    accountIndex
  );
  const stxAddress = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);

  const onPressToken = tokenDetailsFlag ? onOpenToken : undefined;

  return (
    <>
      <Box>
        {(nativeSegwitPayerAddress || taprootPayerAddress) && (
          <BitcoinBalanceByAccount
            onPress={onPressToken}
            fingerprint={fingerprint}
            accountIndex={accountIndex}
          />
        )}
        {stxAddress && (
          <>
            <StacksBalanceByAccount
              onPress={onPressToken}
              fingerprint={fingerprint}
              accountIndex={accountIndex}
            />
            <Sip10BalanceByAccount
              mode={mode}
              fingerprint={fingerprint}
              accountIndex={accountIndex}
              onPress={onPressToken}
            />
          </>
        )}

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
