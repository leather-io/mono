import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { useMemo } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import { toFetchState } from '~/components/loading/fetch-state';
import { createMarketDataBatchQueryOptions } from '~/queries/market-data/market-data.query';
import { createPriceChangePercentageQueryOptions } from '~/queries/market-history/market-history.query';
import { Page } from '~/layouts/page/page';
import { useQuoteCurrency } from '~/store/quote-currency';

import { PortfolioAsset, PortfolioTableRow } from '../portfolio-table/portfolio-table';

import { getAssetId, serializeAssetId } from '@leather.io/utils';

interface PortfolioPageLayoutProps {
  assets: PortfolioAsset[];
  isLoading: boolean;
  overview: React.ReactElement;
  // assetList: React.ReactElement;
  activityList: React.ReactElement;
  assetCount: number;
  renderAssetList: (props: { rows: PortfolioTableRow[]; isLoading: boolean }) => React.ReactElement;
  visualization: React.ReactElement;
}

export function PortfolioPageLayout({
  assets,
  isLoading,
  overview,
  // assetList,
  activityList,
  renderAssetList,
  visualization,
  assetCount,
}: PortfolioPageLayoutProps) {
  const { quoteCurrency } = useQuoteCurrency();

  const baseRows = useMemo(() => {
    if (!assets?.length) return [];
    const totalValue = assets.reduce(
      (sum, asset) => sum + Number(asset.quote.availableBalance.amount),
      0
    );
    return assets.map(asset => ({
      ...asset,
      allocation:
        totalValue > 0 ? (Number(asset.quote.availableBalance.amount) / totalValue) * 100 : 0,
    }));
  }, [assets]);

  const hasData = baseRows.length > 0;
  const marketDataAssets = useMemo(() => baseRows.map(({ asset }) => asset), [baseRows]);
  const shouldFetchMarketData = hasData && !isLoading;

  const marketDataQueryResult = useQuery({
    ...createMarketDataBatchQueryOptions(marketDataAssets, quoteCurrency),
    enabled: shouldFetchMarketData,
  });

  const priceChangeQueryResults = useQueries({
    queries: baseRows.map(({ asset }) => ({
      ...createPriceChangePercentageQueryOptions(asset, '1d'),
      enabled: shouldFetchMarketData,
    })),
  });

  const marketDataStates = shouldFetchMarketData
    ? baseRows.map(row => {
        const assetId = serializeAssetId(getAssetId(row.asset));
        const marketData =
          marketDataQueryResult.data && assetId in marketDataQueryResult.data
            ? marketDataQueryResult.data[assetId]
            : null;
        return toFetchState({
          data: marketData?.price ?? null,
          isLoading: marketDataQueryResult.isPending,
          isError: marketDataQueryResult.isError,
          error: marketDataQueryResult.error,
        });
      })
    : baseRows.map(() => ({ state: 'loading' } as const));

  const priceChangeStates = shouldFetchMarketData
    ? priceChangeQueryResults.map(result =>
        toFetchState({
          data: typeof result.data === 'number' ? result.data : null,
          isLoading: result.isPending,
          isError: result.isError,
          error: result.error,
        })
      )
    : baseRows.map(() => ({ state: 'loading' } as const));

  const tableRows: PortfolioTableRow[] = baseRows.map((row, index) => {
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

  const assetList = renderAssetList({ rows: tableRows, isLoading });

  return (
    <Page overflow="hidden">
      <Page.Header title="Portfolio" />
      <styled.h2 textStyle="heading.05" mt="space.05" mb="space.04">
        Overview
      </styled.h2>
      <styled.div borderTop="none">
        <Box borderRadius="sm" border="default" p="space.05">
          {overview}
          <Box mt="space.04" height="32px">
            {visualization}
          </Box>
        </Box>

        <Flex flexDirection="row" py="space.05" gap="space.05">
          <Stack height="70vh" minHeight={500} flexGrow={1}>
            <styled.h2 textStyle="heading.05" mt="space.05" mb="space.02">
              Tokens <styled.span color="ink.text-subdued">{assetCount}</styled.span>
            </styled.h2>
            <Stack overflow="scroll" flexGrow={1}>
              {assetList}
            </Stack>
          </Stack>
          <Stack height="70vh" minHeight={500} flexGrow={1}>
            <styled.h2 textStyle="heading.05" mt="space.05" mb="space.02">
              Recent activity
            </styled.h2>
            <Stack flexGrow={1} border="default" borderRadius="sm" height="100%">
              {activityList}
            </Stack>
          </Stack>
        </Flex>
      </styled.div>
    </Page>
  );
}
