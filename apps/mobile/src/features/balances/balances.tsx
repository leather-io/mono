import { useRef, useState } from 'react';

import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { useTokenDetailsFlag } from '@/features/feature-flags';
import { TokenSheet, TokenSheetData } from '@/features/token/token-sheet';

import { AccountId, FungibleCryptoAsset, Money } from '@leather.io/models';
import { Box, SheetRef } from '@leather.io/ui/native';

import { AssetsBalance } from './assets/assets-balance';
import { AssetsBalanceByAccount } from './assets/assets-balance-by-account';

export interface OnOpenTokenProps {
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  quoteBalance: Money;
}

export function useTokenDetails() {
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);
  const tokenDetailsFlag = useTokenDetailsFlag();

  const tokenSheetRef = useRef<SheetRef>(null);

  function onOpenToken({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) {
    setSheetData({ asset, availableBalance, quoteBalance });
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  const onPressToken = tokenDetailsFlag ? onOpenToken : undefined;
  return {
    onPressToken,
    sheetData,
    tokenSheetRef,
  };
}

export function AllAccountBalancesWidget() {
  const { onPressToken, sheetData, tokenSheetRef } = useTokenDetails();

  return (
    <>
      <Box flex={1} height="100%">
        <BitcoinBalance onPress={onPressToken} />
        <StacksBalance onPress={onPressToken} />
        <AssetsBalance onPress={onPressToken} />
      </Box>
      <TokenSheet data={sheetData} sheetRef={tokenSheetRef} />
    </>
  );
}

export function AccountBalances({ fingerprint, accountIndex }: AccountId) {
  const { onPressToken, sheetData, tokenSheetRef } = useTokenDetails();

  return (
    <>
      <Box>
        <BitcoinBalanceByAccount
          onPress={onPressToken}
          fingerprint={fingerprint}
          accountIndex={accountIndex}
        />
        <StacksBalanceByAccount
          onPress={onPressToken}
          fingerprint={fingerprint}
          accountIndex={accountIndex}
        />
        <AssetsBalanceByAccount
          fingerprint={fingerprint}
          accountIndex={accountIndex}
          onPress={onPressToken}
        />
      </Box>
      <TokenSheet data={sheetData} sheetRef={tokenSheetRef} />
    </>
  );
}
