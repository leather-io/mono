import { useMemo, useState } from 'react';

import {
  ColumnDef,
  RowData,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Flex, styled } from 'leather-styles/jsx';
import { Table, rowPadding } from '~/components/table';
import { formatCurrency } from '~/utils/currency-formatter';

import { BtcAsset, CryptoAssetBalance, Sip10Asset, StxAsset } from '@leather.io/models';

import { usePortfolioEvents } from '../portfolio-events';
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
export interface PortfolioAsset {
  asset: BtcAsset | Sip10Asset | StxAsset;
  crypto: CryptoAssetBalance;
  quote: CryptoAssetBalance;
}
type ColumnAlignment = 'left' | 'center' | 'right';

interface AssetRow extends PortfolioAsset {
  allocation: number;
}

interface PortfolioTableProps {
  assets: PortfolioAsset[];
  isLoading: boolean;
}
export function PortfolioTable({ assets, isLoading }: PortfolioTableProps) {
  const { emitAssetHoverOn, emitAssetHoverOff, hoveredSymbol } = usePortfolioEvents();

  const data = useMemo<AssetRow[]>(() => {
    if (!assets?.length) return [];
    const totalValue = assets.reduce(
      (sum, asset) => sum + Number(asset.quote.availableBalance.amount),
      0
    );
    return assets.map(asset => ({
      ...asset,
      allocation:
        totalValue > 0 ? (Number(asset.quote.availableBalance.amount) / totalValue) * 100 : 0,
      priceChange: 0,
    }));
  }, [assets]);

  const hasData = data.length > 0;

  const columns = useMemo<ColumnDef<AssetRow>[]>(() => {
    return [
      {
        id: 'asset',
        enableSorting: false,
        meta: { align: 'left' },
        header: () => (
          <styled.p textStyle="label.03" color="ink.text-subdued">
            Asset
          </styled.p>
        ),
        cell: info => {
          const { asset } = info.row.original;

          return <AssetCell asset={asset} />;
        },
      },
      {
        id: 'price',
        enableSorting: false,
        meta: { align: 'left' },
        header: () => (
          <styled.p textStyle="label.03" color="ink.text-subdued">
            Price
          </styled.p>
        ),
        cell: () => {
          return <TextCell>$0.00</TextCell>;
        },
      },
      {
        id: 'allocation',
        enableSorting: false,
        meta: { align: 'left' },
        header: () => (
          <styled.p textStyle="label.03" color="ink.text-subdued">
            Allocation
          </styled.p>
        ),
        cell: info => {
          const { allocation } = info.row.original;
          return <TextCell>{`${allocation.toFixed(2)}%`}</TextCell>;
        },
      },
      {
        id: 'priceChange',
        enableSorting: false,
        meta: { align: 'left' },
        header: () => (
          <styled.p textStyle="label.03" color="ink.text-subdued">
            24h
          </styled.p>
        ),
        cell: () => {
          return <PriceChangeCell priceChange={0} />;
        },
      },
      {
        id: 'balance',
        accessorFn: row => Number(row.quote.availableBalance.amount),
        enableSortingRemoval: false,
        meta: { align: 'right' },
        header: () => (
          <styled.p textStyle="label.03" color="ink.text-subdued" textAlign="right">
            Balance
          </styled.p>
        ),
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
    data,
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
    <>
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
    </>
  );
}
