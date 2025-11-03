import { useMemo } from 'react';

import { styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';

import { Sip10Balance } from '@leather.io/services';

import { AssetsList } from './components/assets-list';
import { PortfolioChart } from './components/portfolio-chart';
import { PortfolioPageHeading } from './components/portfolio-page-heading';
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
    <Page>
      <Page.Header title="Portfolio" />

      <PortfolioPageHeading />

      <PortfolioSummary mb="space.06" />

      <PortfolioChart assets={sortedAssets} mb="space.07" />

      <styled.h2 textStyle="heading.05" mb="space.05">
        Your assets
      </styled.h2>

      <AssetsList mb="space.07" />
    </Page>
  );
}
