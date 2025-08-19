import { useMemo } from 'react';

import { useRunesAccountBalance } from '@/queries/balance/runes-balance.query';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';

import { AccountId, CryptoAssetProtocol } from '@leather.io/models';

import { useRunesFlag } from '../../feature-flags';
import { ASSETS_BALANCES_WIDGET_LIMIT } from '../constants';
import { renderAsset } from './render-assets';

interface AssetsBalanceProps {
  onPress?: (assetProtocol: CryptoAssetProtocol, tokenId: string) => void;
}
export function AssetsBalanceByAccount({
  onPress,
  fingerprint,
  accountIndex,
}: AssetsBalanceProps & AccountId) {
  const sip10Data = useSip10AccountBalance(fingerprint, accountIndex);
  const runesData = useRunesAccountBalance(fingerprint, accountIndex);
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
