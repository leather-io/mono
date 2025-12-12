import { useMemo } from 'react';

import { useActivity } from '~/queries/activity/activity.query';
import { useBtcAccountBalance } from '~/queries/balance/btc-balance.hooks';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { useStxAccountBalance } from '~/queries/balance/stx-balance.hooks';
import { useTotalPortfolioBalance } from '~/queries/balance/total-balance.hooks';
import { useLeatherConnect } from '~/store/addresses';

import { btcAsset, stxAsset } from '@leather.io/constants';

import { ActivityList } from './components/activity-list';
import { PortfolioChart, PortfolioChartPending } from './components/portfolio-chart';
import { PortfolioPageLayout } from './components/portfolio-page.layout';
import { PortfolioSummary } from './components/portfolio-summary';
import { WalletConnectionModal } from './components/wallet-connection-modal';
import { dummyPortfolioAssets, dummyTotalBalance } from './dummy-portfolio-data';
import { PortfolioAsset, PortfolioTable } from './portfolio-table/portfolio-table';

function sortAssetsByValue(a: PortfolioAsset, b: PortfolioAsset) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);
  if (bValue !== aValue) return bValue - aValue;
  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function PortfolioPageSkeleton() {
  return (
    <PortfolioPageLayout
      animation="fadein 300ms ease-out 250ms both"
      opacity={0}
      overview={<PortfolioSummary />}
      assetCount={0}
      assetList={<PortfolioTable assets={[]} isLoading={true} />}
      visualization={<PortfolioChartPending />}
      activityList={<ActivityList activity={[]} isLoading={true} />}
    />
  );
}

export function PortfolioPage() {
  const totalBalance = useTotalPortfolioBalance();
  const { status, stacksAccount, btcAccount } = useLeatherConnect();

  const btcQuery = useBtcAccountBalance();
  const sip10Query = useSip10AccountBalance();
  const stxQuery = useStxAccountBalance();
  const activityAccount = useMemo(
    () => ({
      ...btcAccount,
      stacks: stacksAccount ? { stxAddress: stacksAccount.address } : undefined,
    }),
    [btcAccount, stacksAccount]
  );
  const activityQuery = useActivity(activityAccount);

  const isConnected = status === 'connected';
  const allAssets = useMemo(() => {
    const assets: PortfolioAsset[] = [];

    if (btcQuery.data) {
      assets.push({
        asset: btcAsset,
        crypto: btcQuery.data.btc,
        quote: btcQuery.data.quote,
      });
    }

    if (stxQuery.data) {
      assets.push({
        asset: stxAsset,
        crypto: stxQuery.data.stx,
        quote: stxQuery.data.quote,
      });
    }

    const sip10Assets = sip10Query.data?.sip10s ?? [];
    assets.push(...sip10Assets);

    return assets.sort(sortAssetsByValue);
  }, [btcQuery.data, sip10Query.data, stxQuery.data]);

  if (status !== 'connected') {
    return (
      <>
        <PortfolioPageLayout
          dummyDataMode
          totalBalance={dummyTotalBalance}
          overview={<PortfolioSummary balance={dummyTotalBalance} />}
          assetCount={dummyPortfolioAssets.length}
          assetList={<PortfolioTable assets={dummyPortfolioAssets} isLoading={false} />}
          visualization={<PortfolioChart assets={dummyPortfolioAssets} />}
          activityList={<ActivityList activity={[]} isLoading={false} />}
        />
        <WalletConnectionModal isOpen={true} />
      </>
    );
  }

  const isLoading =
    isConnected && (btcQuery.isLoading || sip10Query.isLoading || stxQuery.isLoading);

  return (
    <PortfolioPageLayout
      isConnected={isConnected}
      totalBalance={totalBalance}
      overview={<PortfolioSummary balance={totalBalance} />}
      assetCount={allAssets.length}
      assetList={<PortfolioTable assets={allAssets} isLoading={isLoading} />}
      visualization={<PortfolioChart assets={allAssets} />}
      activityList={
        <ActivityList
          activity={isConnected ? (activityQuery.data ?? []) : []}
          isLoading={isConnected && activityQuery.isLoading}
        />
      }
    />
  );
}
