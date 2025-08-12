import { useMemo } from 'react';

import { useRunesTotalBalance } from '@/queries/balance/runes-balance.query';
import { useSip10TotalBalance } from '@/queries/balance/sip10-balance.query';

import { useRunesFlag } from '../../feature-flags';
import { OnOpenTokenProps } from '../balances';
import { ASSETS_BALANCES_WIDGET_LIMIT } from '../constants';
import { renderAsset } from './render-assets';

interface AssetsBalanceProps {
  onPress?: ({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
}
export function AssetsBalance({ onPress }: AssetsBalanceProps) {
  const sip10Data = useSip10TotalBalance();
  const runesData = useRunesTotalBalance();
  const runesFlag = useRunesFlag();

  const sip10Memo = useMemo(() => {
    if (sip10Data.state === 'success') return sip10Data.value.sip10s;
    return [];
  }, [sip10Data]);

  const runesMemo = useMemo(() => {
    if (runesData.state === 'success' && runesFlag) return runesData.value.runes;
    return [];
  }, [runesData, runesFlag]);

  const assetsMemo = useMemo(
    () => [...sip10Memo, ...runesMemo].slice(0, ASSETS_BALANCES_WIDGET_LIMIT),
    [sip10Memo, runesMemo]
  );

  return assetsMemo.map(item => renderAsset({ item, onPress }));
}
