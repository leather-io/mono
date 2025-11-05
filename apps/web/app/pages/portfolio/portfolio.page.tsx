import { useMemo } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import { WhenClient } from '~/components/when-client';
import { toFetchState } from '~/components/loading/fetch-state';
import { useAccountActivity } from '~/queries/activity/account-activity.query';
import { useBtcAccountBalance } from '~/queries/balance/btc-balance.hooks';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { useStxAccountBalance } from '~/queries/balance/stx-balance.hooks';
import { createMarketDataBatchQueryOptions } from '~/queries/market-data/market-data.query';
import { createPriceChangePercentageQueryOptions } from '~/queries/market-history/market-history.query';
import { useQuoteCurrency } from '~/store/quote-currency';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { ActivityList } from './components/activity-list';
import { PortfolioChart, PortfolioChartPending } from './components/portfolio-chart';
import { PortfolioPageLayout } from './components/portfolio-page.layout';
import { PortfolioSummary } from './components/portfolio-summary';
import { PortfolioTable } from './portfolio-table/portfolio-table';
import { PortfolioAsset, PortfolioAssetWithAllocation, PortfolioTableRow } from './portfolio.types';

function sortAssetsByValue(a: PortfolioAsset, b: PortfolioAsset) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);
  if (bValue !== aValue) return bValue - aValue;
  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export const EmptyAmountPlaceholder = '-.--';

export function PortfolioPage() {
  const btcQuery = useBtcAccountBalance();
  const sip10Query = useSip10AccountBalance();
  const stxQuery = useStxAccountBalance();
  const activityQuery = useAccountActivity();
  const { quoteCurrency } = useQuoteCurrency();

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

  const isLoading = btcQuery.isLoading || sip10Query.isLoading || stxQuery.isLoading;


  const portfolioAssets = useMemo<PortfolioTableRow[]>(() => {
    if (!allAssets.length) return [];
    const totalValue = allAssets.reduce(
      (sum, asset) => sum + Number(asset.quote.availableBalance.amount),
      0
    );
    return allAssets.map(asset => ({
      ...asset,
      allocation:
        totalValue > 0 ? (Number(asset.quote.availableBalance.amount) / totalValue) * 100 : 0,
    }));
  }, [allAssets]);

  const hasTableData = portfolioAssets.length > 0;
  const marketDataAssets = useMemo(() => portfolioAssets.map(({ asset }) => asset), [portfolioAssets]);
  const shouldFetchMarketData = hasTableData && !isLoading;

  const marketDataQuery = useQuery({
    ...createMarketDataBatchQueryOptions(marketDataAssets, quoteCurrency),
    enabled: shouldFetchMarketData,
  });

  const priceChangeQueries = useQueries({
    queries: portfolioAssets.map(({ asset }) => ({
      ...createPriceChangePercentageQueryOptions(asset, '1d'),
      enabled: shouldFetchMarketData,
    })),
  });

  const marketDataStates = shouldFetchMarketData
    ? portfolioAssets.map(row => {
        const assetId = serializeAssetId(getAssetId(row.asset));
        const marketData =
          marketDataQuery.data && assetId in marketDataQuery.data
            ? marketDataQuery.data[assetId]
            : null;
        return toFetchState({
          data: marketData?.price ?? null,
          isLoading: marketDataQuery.isPending,
          isError: marketDataQuery.isError,
          error: marketDataQuery.error,
        });
      })
    : portfolioAssets.map(() => ({ state: 'loading' } as const));

  const priceChangeStates = shouldFetchMarketData
    ? priceChangeQueries.map(result =>
        toFetchState({
          data: typeof result.data === 'number' ? result.data : null,
          isLoading: result.isPending,
          isError: result.isError,
          error: result.error,
        })
      )
    : portfolioAssets.map(() => ({ state: 'loading' } as const));

  const tableRows: PortfolioTableRow[] = portfolioAssets.map((row, index) => {
    const priceState = marketDataStates[index];
    const price = priceState?.state === 'success' ? priceState.value : undefined;
    const priceIsLoading = priceState?.state === 'loading';

    const priceChangeState = priceChangeStates[index];
    const priceChange = priceChangeState?.state === 'success' ? priceChangeState.value : undefined;
    const priceChangeIsLoading = priceChangeState?.state === 'loading';

    return {
      ...row,
      price,
      priceIsLoading: Boolean(priceIsLoading),
      priceChange,
      priceChangeIsLoading: Boolean(priceChangeIsLoading),
    };
  });

  const tableIsLoading =
    isLoading ||
    (!shouldFetchMarketData && hasTableData) ||
    marketDataQuery.isPending ||
    priceChangeQueries.some(result => result.isPending);

  return (
    <PortfolioPageLayout
      overview={<PortfolioSummary />}
      assetCount={allAssets.length}
      assetList={<PortfolioTable rows={tableRows} isLoading={tableIsLoading} />}
      visualization={
        <WhenClient fallback={<PortfolioChartPending />}>
          <PortfolioChart assets={allAssets} />
        </WhenClient>
      }
      activityList={
        <ActivityList activity={activityQuery.data ?? []} isLoading={activityQuery.isLoading} />
      }
    />
  );
}
