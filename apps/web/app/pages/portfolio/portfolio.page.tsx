import { useMemo } from 'react';

import { WhenClient } from '~/components/when-client';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { useStxAccountBalance } from '~/queries/balance/stx-balance.hooks';

import { stxAsset } from '@leather.io/constants';

import { PortfolioChart, PortfolioChartPending } from './components/portfolio-chart';
import { PortfolioPageLayout } from './components/portfolio-page.layout';
import { PortfolioSummary } from './components/portfolio-summary';
import { PortfolioAsset, PortfolioTable } from './portfolio-table/portfolio-table';

function sortAssetsByValue(a: PortfolioAsset, b: PortfolioAsset) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);
  if (bValue !== aValue) return bValue - aValue;
  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function PortfolioPage() {
  const sip10Query = useSip10AccountBalance();
  const stxQuery = useStxAccountBalance();

  const allAssets = useMemo(() => {
    const assets: PortfolioAsset[] = [];

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
  }, [sip10Query.data, stxQuery.data]);

  const isLoading = sip10Query.isLoading || stxQuery.isLoading;

  return (
    <PortfolioPageLayout
      overview={<PortfolioSummary />}
      assetList={<PortfolioTable assets={allAssets} isLoading={isLoading} />}
      visualization={
        <WhenClient fallback={<PortfolioChartPending />}>
          <PortfolioChart assets={allAssets} />
        </WhenClient>
      }
    />
  );
}
