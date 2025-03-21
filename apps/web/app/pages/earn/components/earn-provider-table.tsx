import { useMemo, useState } from 'react';

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { css } from 'leather-styles/css';
import { Flex, type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { BitcoinIcon } from '~/components/icons/bitcoin-icon';
import { StacksIcon } from '~/components/icons/stacks-icon';
import { SortableHeader, theadBorderBottom } from '~/components/table';

import { Button, Flag } from '@leather.io/ui';

const offsetMinAmountColumm = css({
  transform: [null, null, 'translateX(-40%)'],
});

const offsetEstAprColumm = css({
  transform: [null, null, 'translateX(-50%)'],
});

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
        cell: info => (
          <Flag img={<DummyIcon />}>
            <styled.span color="ink.text-primary">{info.getValue() as string}</styled.span>
          </Flag>
        ),
        header: () => <SortableHeader>Provider</SortableHeader>,
        meta: { align: 'left' },
        size: 12,
      },
      {
        accessorKey: 'minAmount',
        cell: info => (
          <styled.div className={offsetMinAmountColumm}>
            {info.getValue() === null ? '—' : (info.getValue() as string)}
          </styled.div>
        ),
        header: () => (
          <SortableHeader className={offsetMinAmountColumm}>Minimum Amount</SortableHeader>
        ),
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false,
        meta: { align: 'right' },
        size: 14,
        maxSize: 14,
      },
      {
        accessorKey: 'estApr',
        cell: info => (
          <styled.div className={offsetEstAprColumm}>{info.getValue() as string}</styled.div>
        ),
        header: () => <SortableHeader className={offsetEstAprColumm}>Est. APR</SortableHeader>,
        meta: { align: 'right' },
      },
      {
        accessorKey: 'payout',
        header: () => <SortableHeader>Payout</SortableHeader>,
        cell: info => (
          <Flex justifyContent="space-between" alignItems="center">
            <Flag
              spacing="space.02"
              img={
                <>
                  {info.getValue() === 'STX' && <StacksIcon />}
                  {info.getValue() === 'BTC' && <BitcoinIcon />}
                </>
              }
            >
              {info.getValue() as string}
            </Flag>

            <Button size="sm" ml="space.04" minW="fit-content">
              Start earning
            </Button>
          </Flex>
        ),
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
