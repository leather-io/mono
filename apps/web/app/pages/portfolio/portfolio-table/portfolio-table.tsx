import { type ReactNode, useMemo, useState } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  RowData,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Box, styled } from 'leather-styles/jsx';
import { toFetchState } from '~/components/loading/fetch-state';
import { Table, rowPadding } from '~/components/table';
import { createMarketDataBatchQueryOptions } from '~/queries/market-data/market-data.query';
import { createPriceChangePercentageQueryOptions } from '~/queries/market-history/market-history.query';
import { useQuoteCurrency } from '~/store/quote-currency';
import { formatCurrency } from '~/utils/currency-formatter';

import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { usePortfolioEvents } from '../portfolio-events';
import { EmptyAmountPlaceholder } from '../portfolio.page';
import { PortfolioAsset, PortfolioTableRow } from '../portfolio.types';
import { PortfolioTableEmpty } from './portfolio-empty';
import { PortfolioTableLoading } from './portfolio-loading';
import {
  AssetCell,
  BalanceCell,
  HeaderCell,
  PriceChangeCell,
  TextCell,
} from './portfolio-table-cells';
import { getAriaSort, getJustifyContent } from './utils';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'center' | 'right';
    _rowData?: TData;
    _columnDef?: ColumnDef<TData, TValue>;
  }
}

type ColumnAlignment = 'left' | 'center' | 'right';

function HeaderCellText({ children }: { children: ReactNode }) {
  return (
    <styled.p textStyle="label.03" color="ink.text-subdued">
      {children}
    </styled.p>
  );
}

interface PortfolioTableProps {
  allAssets: PortfolioAsset[];
  isLoading: boolean;
}

export function PortfolioTable({ allAssets, isLoading }: PortfolioTableProps) {
  const { emitAssetHoverOn, emitAssetHoverOff, hoveredSymbol } = usePortfolioEvents();

  const { quoteCurrency } = useQuoteCurrency();
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
  const marketDataAssets = useMemo(
    () => portfolioAssets.map(({ asset }) => asset),
    [portfolioAssets]
  );
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
    : portfolioAssets.map(() => ({ state: 'loading' }) as const);

  const priceChangeStates = shouldFetchMarketData
    ? priceChangeQueries.map(result =>
        toFetchState({
          data: typeof result.data === 'number' ? result.data : null,
          isLoading: result.isPending,
          isError: result.isError,
          error: result.error,
        })
      )
    : portfolioAssets.map(() => ({ state: 'loading' }) as const);

  const rows: PortfolioTableRow[] = portfolioAssets.map((row, index) => {
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

  const tokenCount = rows.length;
  const hasData = tokenCount > 0;

  const columns = useMemo<ColumnDef<PortfolioTableRow>[]>(() => {
    return [
      {
        id: 'asset',
        enableSorting: false,
        meta: { align: 'left' },
        header: () => <HeaderCellText>Asset</HeaderCellText>,
        cell: info => {
          const { asset } = info.row.original;
          return <AssetCell asset={asset} />;
        },
      },
      {
        id: 'price',
        enableSorting: false,
        meta: { align: 'right' },
        header: () => <HeaderCellText>Price</HeaderCellText>,
        cell: info => {
          const { price, priceIsLoading } = info.row.original;
          if (priceIsLoading) return <TextCell>{`${EmptyAmountPlaceholder}`}</TextCell>;
          return <TextCell>{price ? formatCurrency(price) : `${EmptyAmountPlaceholder}`}</TextCell>;
        },
      },
      {
        id: 'allocation',
        enableSorting: false,
        meta: { align: 'right' },
        header: () => <HeaderCellText>Allocation</HeaderCellText>,
        cell: info => {
          const { allocation } = info.row.original;
          return <TextCell>{`${allocation.toFixed(2)}%`}</TextCell>;
        },
      },
      {
        id: 'priceChange',
        enableSorting: false,
        meta: { align: 'right' },
        header: () => <HeaderCellText>24h</HeaderCellText>,
        cell: info => {
          const { priceChange, priceChangeIsLoading } = info.row.original;
          return <PriceChangeCell priceChange={priceChange} isLoading={priceChangeIsLoading} />;
        },
      },
      {
        id: 'balance',
        accessorFn: row => Number(row.quote.availableBalance.amount),
        enableSortingRemoval: false,
        meta: { align: 'right' },
        header: () => <HeaderCellText>Balance</HeaderCellText>,
        cell: info => {
          const { crypto, quote } = info.row.original;
          const balance = formatCurrency(crypto.availableBalance, { showCurrency: false });
          const value = formatCurrency(quote.availableBalance);
          return <BalanceCell balance={balance} value={value} />;
        },
      },
    ];
  }, []);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'balance', desc: true }]);
  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    state: { sorting },
    onSortingChange: setSorting,
  });

  if (isLoading) {
    return <PortfolioTableLoading />;
  }

  if (!hasData) {
    return <PortfolioTableEmpty />;
  }

  return (
    <Box>
      <Table.Root width="100%" overflowX="auto">
        <Table.Table>
          <Table.Head>
            {table.getHeaderGroups().map(headerGroup => (
              <Table.Row key={headerGroup.id} className={rowPadding}>
                {headerGroup.headers.map(header => {
                  const sortState = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  const toggleSort = canSort ? header.column.getToggleSortingHandler() : undefined;
                  const alignment: ColumnAlignment = header.column.columnDef.meta?.align ?? 'left';
                  const justifyContent = getJustifyContent(alignment);
                  const ariaSort = getAriaSort(sortState);

                  return (
                    <Table.Header
                      key={header.id}
                      colSpan={header.colSpan}
                      px="space.04"
                      textAlign={alignment}
                      cursor={canSort ? 'pointer' : 'default'}
                      onClick={toggleSort}
                      onKeyDown={
                        toggleSort
                          ? event => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                toggleSort(event);
                              }
                            }
                          : undefined
                      }
                      aria-sort={ariaSort}
                      tabIndex={canSort ? 0 : undefined}
                      role={canSort ? 'button' : undefined}
                    >
                      <HeaderCell justifyContent={justifyContent} sortState={sortState}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </HeaderCell>
                    </Table.Header>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Head>
          <Table.Body>
            {table.getRowModel().rows.map(row => (
              <Table.Row
                key={row.id}
                className={rowPadding}
                onMouseEnter={() => emitAssetHoverOn(row.original.asset.symbol)}
                onMouseLeave={() => emitAssetHoverOff()}
                height="60px"
                bg={
                  hoveredSymbol === row.original.asset.symbol
                    ? 'ink.component-background-hover'
                    : 'transparent'
                }
                transition="background-color 150ms ease-out"
              >
                {row.getVisibleCells().map(cell => (
                  <styled.td
                    key={cell.id}
                    px="space.04"
                    py="space.03"
                    color="ink.text-primary"
                    textStyle="body.02"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </styled.td>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Table>
      </Table.Root>
    </Box>
  );
}
