import { useMemo } from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { formatCurrency } from '~/utils/currency-formatter';

import { Sip10Balance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui';

import { Table, rowPadding, theadBorderBottom } from '~/components/table';

import { usePortfolioEvents } from '../portfolio-events';

interface AssetRow {
  asset: Sip10Balance;
}

function sortAssetsByValue(a: Sip10Balance, b: Sip10Balance) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);

  if (bValue !== aValue) return bValue - aValue;

  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function AssetsList(props: BoxProps) {
  const { emitAssetHoverOn, emitAssetHoverOff, hoveredSymbol } = usePortfolioEvents();
  const sip10Query = useSip10AccountBalance();

  const assets = useMemo(() => {
    const sip10Assets = sip10Query.data?.sip10s ?? [];
    return [...sip10Assets].sort(sortAssetsByValue);
  }, [sip10Query.data]);

  const data = useMemo<AssetRow[]>(() => assets.map(asset => ({ asset })), [assets]);

  const columns = useMemo<ColumnDef<AssetRow>[]>(() => {
    return [
      {
        id: 'asset',
        header: () => (
          <styled.p textStyle="label.03" color="ink.text-subdued">
            Asset
          </styled.p>
        ),
        cell: info => {
          const { asset } = info.row.original;
          const name = asset.asset.name;
          const symbol = asset.asset.symbol;

          return (
            <Flex alignItems="center" gap="space.04">
              <Box>
                <Sip10AvatarIcon
                  contractId={asset.asset.contractId}
                  imageCanonicalUri={asset.asset.imageCanonicalUri}
                  name={asset.asset.name}
                />
              </Box>
              <Box>
                <styled.p textStyle="body.02" fontWeight="medium">
                  {name}
                </styled.p>
                <styled.p textStyle="caption.01" color="ink.text-subdued">
                  {symbol}
                </styled.p>
              </Box>
            </Flex>
          );
        },
        meta: { align: 'left' },
      },
      {
        id: 'value',
        header: () => (
          <styled.p textStyle="label.03" color="ink.text-subdued" textAlign="right">
            Value
          </styled.p>
        ),
        cell: info => {
          const { asset } = info.row.original;
          const balance = formatCurrency(asset.crypto.availableBalance, { showCurrency: false });
          const value = formatCurrency(asset.quote.availableBalance);

          return (
            <Flex alignItems="flex-end" flexDir="column" gap="space.01">
              <styled.p textStyle="body.02">{value}</styled.p>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {balance}
              </styled.span>
            </Flex>
          );
        },
        meta: { align: 'right' },
      },
    ];
  }, []);

  const isLoading = sip10Query.isPending;
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box {...props}>
      {isLoading ? (
        <Box p="space.06" textAlign="center">
          <styled.p textStyle="body.02" color="ink.text-subdued">
            Loading assets...
          </styled.p>
        </Box>
      ) : data.length > 0 ? (
        <Table.Root width="100%" overflowX="auto">
          <Table.Table>
            <Table.Head className={theadBorderBottom}>
              {table.getHeaderGroups().map(headerGroup => (
                <Table.Row key={headerGroup.id} className={rowPadding}>
                  {headerGroup.headers.map(header => (
                    <Table.Header
                      key={header.id}
                      colSpan={header.colSpan}
                      px="space.04"
                      textAlign={header.column.columnDef.meta?.align}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Header>
                  ))}
                </Table.Row>
              ))}
            </Table.Head>
            <Table.Body>
              {table.getRowModel().rows.map(row => (
                <Table.Row
                  key={row.id}
                  className={rowPadding}
                  onMouseEnter={() => emitAssetHoverOn(row.original.asset.asset.symbol)}
                  onMouseLeave={() => emitAssetHoverOff()}
                  opacity={
                    !hoveredSymbol || hoveredSymbol === row.original.asset.asset.symbol ? 1 : 0.6
                  }
                  height="60px"
                >
                  {row.getVisibleCells().map(cell => (
                    <styled.td
                      key={cell.id}
                      px="space.04"
                      py="space.03"
                      textAlign={cell.column.columnDef.meta?.align}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </styled.td>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Table>
        </Table.Root>
      ) : (
        <Box textAlign="center">
          <styled.p textStyle="body.02" color="ink.text-subdued">
            No assets to display
          </styled.p>
        </Box>
      )}
    </Box>
  );
}
