import { useMemo, useState } from 'react';

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Flex, type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { theadBorderBottom } from '~/components/table';

import { Button } from '@leather.io/ui';

interface EarnProvider {
  provider: string;
  minAmount: string | null;
  estApr: string;
  payout: string;
}
const earnProviders: EarnProvider[] = [
  {
    provider: 'Fast Pool',
    minAmount: null,
    estApr: '5%',
    payout: 'STX',
  },
  {
    provider: 'PlanBetter',
    minAmount: '200 STX',
    estApr: '10%',
    payout: 'STX',
  },
  {
    provider: 'Restake',
    minAmount: '100 STX',
    estApr: '11%',
    payout: 'STX',
  },
  {
    provider: 'Xverse Pool',
    minAmount: '100 STX',
    estApr: '10%',
    payout: 'BTC',
  },
  {
    provider: 'Stacking DAO',
    minAmount: '100 STX',
    estApr: '16%',
    payout: 'STX',
  },
  {
    provider: 'Xverse',
    minAmount: null,
    estApr: '10%',
    payout: 'STX',
  },
];

export function EarnProviderTable(props: HTMLStyledProps<'div'>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<EarnProvider>[]>(
    () => [
      {
        accessorKey: 'provider',
        cell: info => <styled.span>{info.getValue() as string}</styled.span>,
        header: () => <styled.span>Provider</styled.span>,
        meta: { align: 'left' },
        size: 12,
      },
      {
        accessorKey: 'minAmount',
        cell: info => <styled.span>{info.getValue() as string}</styled.span>,
        header: () => <styled.span>Minimum Amount</styled.span>,
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false,
        meta: { align: 'right' },
        size: 14,
        maxSize: 14,
      },
      {
        accessorKey: 'estApr',
        cell: info => <styled.span mr="space.08">{info.getValue() as string}</styled.span>,
        header: () => <styled.span mr="space.08">Est. APR</styled.span>,
        meta: { align: 'right' },
        size: 20,
        maxSize: 20,
      },
      {
        accessorKey: 'payout',
        cell: info => (
          <Flex ml="space.07" justifyContent="space-between" alignItems="baseline">
            {info.getValue() as string}
            <Button size="sm" ml="space.04">
              Start pooling
            </Button>
          </Flex>
        ),
        header: () => <styled.span ml="space.07">Payout</styled.span>,
        meta: { align: 'left' },
        size: 35,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: earnProviders,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    defaultColumn: { size: 0 },
  });

  return (
    <styled.div border="default" {...props} borderRadius="sm">
      <styled.table
        borderCollapse="separate"
        overflow="hidden"
        w="100%"
        px="space.05"
        pos="relative"
      >
        <styled.thead height="40px" className={theadBorderBottom}>
          {table.getHeaderGroups().map(headerGroup => (
            <styled.tr key={headerGroup.id} borderBottom="default">
              {headerGroup.headers.map(header => (
                <styled.th
                  key={header.id}
                  colSpan={header.colSpan}
                  textStyle="label.03"
                  color="ink.text-subdued"
                  style={{ width: `${header.getSize()}%` }}
                  align={(header.column.columnDef.meta as any)?.align}
                >
                  {header.isPlaceholder ? null : (
                    <styled.span
                      userSelect="none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </styled.span>
                  )}
                </styled.th>
              ))}
            </styled.tr>
          ))}
        </styled.thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <styled.tr key={row.id} textStyle="label.03" color="ink.text-subdued" height="56px">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} align={(cell.column.columnDef.meta as any)?.align}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </styled.tr>
          ))}
        </tbody>
      </styled.table>
    </styled.div>
  );
}
