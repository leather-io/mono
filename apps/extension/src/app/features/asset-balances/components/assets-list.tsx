import { useMemo } from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { CryptoAssetProtocols } from '@leather.io/models';
import { RuneBalance, Sip10Balance } from '@leather.io/services';
import { sortSip10Balances } from '@leather.io/features';

import { LoadingRectangle } from '@app/components/loading-rectangle';
import type { useRunesAccountBalance } from '@app/query/bitcoin/runes/runes-balance.query';
import type { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';

import { RunesTokenBalance } from './runes-token-balance';
import { Sip10TokenBalance } from './sip10-token-balance';

type Sip10BalanceState = ReturnType<typeof useSip10AccountBalance>;
type RunesBalanceState = ReturnType<typeof useRunesAccountBalance>;

interface AssetsListProps {
  sip10Data: Sip10BalanceState;
  runesData: RunesBalanceState;
}

type TokenBalanceItem = Sip10Balance | RuneBalance;

function isSip10Balance(item: TokenBalanceItem): item is Sip10Balance {
  return item.asset.protocol === CryptoAssetProtocols.sip10;
}

function isRuneBalance(item: TokenBalanceItem): item is RuneBalance {
  return item.asset.protocol === CryptoAssetProtocols.rune;
}

export function AssetsList({ sip10Data, runesData }: AssetsListProps) {
  const isLoading = sip10Data.state === 'loading' || runesData.state === 'loading';

  const sip10Balances = useMemo(() => {
    if (sip10Data.state !== 'success') return [];
    return [...sip10Data.value.sip10s].sort(sortSip10Balances);
  }, [sip10Data]);

  const runesBalances = useMemo(() => {
    if (runesData.state !== 'success') return [];
    return runesData.value.runes;
  }, [runesData]);

  const assets: TokenBalanceItem[] = [...sip10Balances, ...runesBalances];

  if (isLoading) {
    return (
      <Stack gap="space.02">
        <LoadingRectangle width="100%" height="64px" />
        <LoadingRectangle width="100%" height="64px" />
        <LoadingRectangle width="100%" height="64px" />
      </Stack>
    );
  }

  if (!assets.length) {
    return (
      <Stack gap="space.02" alignItems="center" py="space.08">
        <styled.span color="ink.text-subdued" textStyle="caption.02">
          No additional assets yet.
        </styled.span>
      </Stack>
    );
  }

  return (
    <Stack gap="space.03">
      {assets.map(asset => {
        if (isSip10Balance(asset)) {
          return <Sip10TokenBalance key={asset.asset.contractId} item={asset} />;
        }
        if (isRuneBalance(asset)) {
          return <RunesTokenBalance key={asset.asset.symbol} item={asset} />;
        }
        return null;
      })}
    </Stack>
  );
}
