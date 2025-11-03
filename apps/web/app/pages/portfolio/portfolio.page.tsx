import { useMemo } from 'react';

import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';

import { Sip10Balance } from '@leather.io/services';

import { AssetsList } from './components/assets-list';
import { PortfolioChart } from './components/portfolio-chart';
import { PortfolioPageLayout } from './components/portfolio-page.layout';
import { PortfolioSummary } from './components/portfolio-summary';

function sortAssetsByValue(a: Sip10Balance, b: Sip10Balance) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);
  if (bValue !== aValue) return bValue - aValue;
  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function PortfolioPage() {
  const sip10Query = useSip10AccountBalance();

  const sortedAssets = useMemo(() => {
    const sip10Assets = sip10Query.data?.sip10s ?? [];
    return [...sip10Assets].sort(sortAssetsByValue);
  }, [sip10Query.data]);

  return (
    <PortfolioPageLayout
      overview={<PortfolioSummary />}
      assetList={<AssetsList />}
      visualization={<PortfolioChart assets={sortedAssets} />}
    />
  );
}
