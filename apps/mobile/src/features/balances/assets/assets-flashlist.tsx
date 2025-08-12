import { ReactNode, useMemo } from 'react';

import { BitcoinBalance } from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalance } from '@/features/balances/stacks/stacks-balance';
import { sortSip10Balances } from '@/features/balances/utils/sort-sip10-balances';
import { useRunesFlag } from '@/features/feature-flags';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { TokenSheet } from '@/features/token/token-sheet';
import { useRunesTotalBalance } from '@/queries/balance/runes-balance.query';
import { useSip10TotalBalance } from '@/queries/balance/sip10-balance.query';
import { FlashList } from '@shopify/flash-list';

import { RuneBalance, Sip10Balance } from '@leather.io/services';

import { useTokenDetails } from '../balances';
import { renderAsset } from './render-assets';

interface AssetsFlashListProps {
  sip10Data: ReturnType<typeof useSip10TotalBalance>;
  runesData: ReturnType<typeof useRunesTotalBalance>;
  header: ReactNode;
}

export function AssetsFlashList({ sip10Data, runesData, header }: AssetsFlashListProps) {
  const runesFlag = useRunesFlag();

  const sip10Memo = useMemo(() => {
    if (sip10Data.state === 'success') return sip10Data.value.sip10s.sort(sortSip10Balances);
    return [];
  }, [sip10Data]);

  const runesMemo = useMemo(() => {
    if (runesData.state === 'success' && runesFlag) return runesData.value.runes;
    return [];
  }, [runesData, runesFlag]);

  const allAssetsMemo = useMemo(() => [...sip10Memo, ...runesMemo], [sip10Memo, runesMemo]);

  const { onPressToken, sheetData, tokenSheetRef } = useTokenDetails();
  return (
    <>
      <FlashList<Sip10Balance | RuneBalance>
        data={allAssetsMemo}
        renderItem={({ item }) => renderAsset({ item, onPress: onPressToken })}
        getItemType={item => {
          return item.asset.protocol;
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl />}
        ListHeaderComponent={
          <>
            {header}
            <BitcoinBalance onPress={onPressToken} />
            <StacksBalance onPress={onPressToken} />
          </>
        }
      />
      <TokenSheet data={sheetData} sheetRef={tokenSheetRef} />
    </>
  );
}
