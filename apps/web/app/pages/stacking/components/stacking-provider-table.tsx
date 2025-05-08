import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import {
  ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { css } from 'leather-styles/css';
import { type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { BitcoinIcon } from '~/components/icons/bitcoin-icon';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { StacksIcon } from '~/components/icons/stacks-icon';
import { SortableHeader, Table, rowPadding, theadBorderBottom } from '~/components/table';
import {
  LiquidStackingPool,
  StackingPool,
  liquidStackingProvidersList,
  stackingPoolList,
} from '~/data/data';
import { StartEarningButton } from '~/pages/stacking/components/start-earning-button';

import { Button, Flag } from '@leather.io/ui';

const offsetMinAmountColumn = css({
  transform: [null, null, 'translateX(-15%)'],
  maxWidth: '120px',
});

const offsetEstAprColumn = css({
  transform: [null, 'translateX(-40%)', 'translateX(-70%)'],
  maxWidth: '120px',
});

const tableBodyRowActiveStyles = css({
  _hover: {
    '& > tr div': {
      color: 'ink.text-subdued',
    },
  },
});

const tableRowActiveStyles = css({
  _hover: {
    '& div': {
      color: 'ink.text-primary !important',
    },
  },
});

const providerSlugMap = {
  fastPool: 'fast-pool',
  planbetter: 'plan-better',
  restake: 'restake',
  xverse: 'xverse',
  stackingDao: 'stacking-dao',
} as const;

export function EarnProviderTable(props: HTMLStyledProps<'div'>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<StackingPool>[]>(
    () => [
      {
        accessorKey: 'name',
        cell: info => (
          <Flag
            img={<ProviderIcon providerId={info.row.original.providerId} />}
            color="ink.text-primary"
          >
            {info.getValue() as string}
          </Flag>
        ),
        header: () => <SortableHeader>Provider</SortableHeader>,
        meta: { align: 'left' },
        size: 14,
      },
      {
        accessorKey: 'minAmount',
        cell: info => (
          <styled.div display={['none', 'none', 'block']} className={offsetMinAmountColumn}>
            {info.getValue() === null ? '—' : (info.getValue() as string)}
          </styled.div>
        ),
        header: () => (
          <SortableHeader display={['none', 'none', 'block']} className={offsetMinAmountColumn}>
            Minimum Amount
          </SortableHeader>
        ),
        sortUndefined: 'last',
        sortDescFirst: false,
        meta: { align: 'right' },
        size: 14,
        maxSize: 14,
      },
      {
        accessorKey: 'estApr',
        cell: info => (
          <styled.div display={['none', 'none', 'block']} className={offsetEstAprColumn}>
            {info.getValue() as string}
          </styled.div>
        ),
        header: () => (
          <SortableHeader display={['none', 'none', 'block']} className={offsetEstAprColumn}>
            Est. APR
          </SortableHeader>
        ),
        meta: { align: 'right' },
      },
      {
        accessorKey: 'payout',
        cell: info => (
          <Flag
            display={['none', 'none', 'flex']}
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
        ),
        header: () => <SortableHeader display={['none', 'none', 'block']}>Payout</SortableHeader>,
        meta: { align: 'left' },
      },
      {
        accessorKey: 'actions',
        cell: info => (
          <StartEarningButton
            slug={providerSlugMap[info.row.original.providerId as keyof typeof providerSlugMap]}
            poolAddresses={info.row.original.poolAddress}
          />
        ),
        header: () => null,
        meta: { align: 'right' },
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: stackingPoolList,
    debugTable: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    defaultColumn: { size: 0 },
  });

  return (
    <Table.Root {...props}>
      <Table.Table>
        <Table.Head height="40px" className={theadBorderBottom}>
          {table.getHeaderGroups().map(headerGroup => (
            <Table.Row key={headerGroup.id} className={rowPadding}>
              {headerGroup.headers.map(header => (
                <Table.Header
                  key={header.id}
                  colSpan={header.colSpan}
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
                </Table.Header>
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body className={tableBodyRowActiveStyles}>
          {table.getRowModel().rows.map(row => (
            <Table.Row
              key={row.id}
              height="56px"
              className={rowPadding + ' ' + tableRowActiveStyles}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} align={(cell.column.columnDef.meta as any)?.align}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}

export function LiquidStackingProviderTable(props: HTMLStyledProps<'div'>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<LiquidStackingPool>[]>(
    () => [
      {
        accessorKey: 'name',
        cell: info => (
          <Flag
            img={<ProviderIcon providerId={info.row.original.providerId} />}
            color="ink.text-primary"
          >
            {info.getValue() as string}
          </Flag>
        ),
        header: () => <SortableHeader>Provider</SortableHeader>,
        meta: { align: 'left' },
        size: 12,
      },
      {
        accessorKey: 'estApr',
        cell: info => (
          <styled.div display={['none', 'none', 'block']} className={offsetEstAprColumn}>
            {info.getValue() as string}
          </styled.div>
        ),
        header: () => (
          <SortableHeader display={['none', 'none', 'block']} className={offsetEstAprColumn}>
            Est. APR
          </SortableHeader>
        ),
        meta: { align: 'right' },
      },
      {
        accessorKey: 'payout',
        header: () => (
          <SortableHeader display={['none', 'none', 'block']}>Liquid token</SortableHeader>
        ),
        cell: info => (
          <Flag display={['none', 'none', 'flex']} spacing="space.02">
            {info.getValue() as string}
          </Flag>
        ),
        meta: { align: 'left' },
      },
      {
        accessorKey: 'actions',
        header: () => null,
        cell: info => (
          <Link
            to={`/liquid-stacking/${info.row.original.slug}`}
            style={{ minWidth: 'fit-content' }}
          >
            <Button size="xs" whiteSpace="nowrap" minW="fit-content">
              Start earning
            </Button>
          </Link>
        ),
        meta: { align: 'right' },
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: liquidStackingProvidersList,
    debugTable: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    defaultColumn: { size: 0 },
  });

  return (
    <Table.Root {...props}>
      <Table.Table>
        <Table.Head height="40px" className={theadBorderBottom}>
          {table.getHeaderGroups().map(headerGroup => (
            <Table.Row key={headerGroup.id} className={rowPadding}>
              {headerGroup.headers.map(header => (
                <Table.Header
                  key={header.id}
                  colSpan={header.colSpan}
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
                </Table.Header>
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body className={tableBodyRowActiveStyles}>
          {table.getRowModel().rows.map(row => (
            <Table.Row
              key={row.id}
              height="56px"
              className={rowPadding + ' ' + tableRowActiveStyles}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} align={(cell.column.columnDef.meta as any)?.align}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
