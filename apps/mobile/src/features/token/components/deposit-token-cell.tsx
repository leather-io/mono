import { ReactNode } from 'react';

import { Loading } from '@/components/loading';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { Button, Cell } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { TokenBalance } from './token-balance';
import { TokenCell } from './token-cell';

interface DepositTokenCellProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  asset: FungibleCryptoAsset;
  availableBalance: Money | undefined;
  quoteBalance: Money | undefined;
  isBalanceLoading: boolean;
  isActivityLoading: boolean;
  hasActivity: boolean;
}
export function DepositTokenCell({
  ticker,
  icon,
  tokenName,
  asset,
  availableBalance,
  quoteBalance,
  isBalanceLoading,
  isActivityLoading,
  hasActivity,
}: DepositTokenCellProps) {
  const tokenProps = { ticker, icon, tokenName };
  const router = useRouter();
  const { rampSheetRef } = useGlobalSheets();

  function onPress() {
    router.navigate({
      pathname: '/(tabs)/(index)/[assetId]',
      params: { assetId: serializeAssetId(getAssetId(asset)) },
    });
  }

  function onBuy() {
    rampSheetRef.current?.present('buy', asset);
  }

  if (isBalanceLoading || isActivityLoading) return <Loading />;

  if (!hasActivity) {
    return (
      <TokenCell
        onPress={onPress}
        asideComponent={
          <Cell.Aside>
            <Button variant="outline" onPress={onBuy}>{t`Buy`}</Button>
          </Cell.Aside>
        }
        {...tokenProps}
      />
    );
  }

  return (
    <TokenBalance
      {...tokenProps}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={onPress}
    />
  );
}
