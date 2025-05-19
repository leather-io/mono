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
import { type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { BasicHoverCard } from '~/components/basic-hover-card';
import { ChainLogoIcon } from '~/components/icons/chain-logo';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { InfoLabel } from '~/components/info-label';
import {
  ForceRowHeight,
  SortableHeader,
  Table,
  rowPadding,
  theadBorderBottom,
} from '~/components/table';
import { content } from '~/data/content';
import {
  LiquidStackingPool,
  StackingPool,
  liquidStackingProvidersList,
  stackingPoolList,
} from '~/data/data';
import { useViewportMinWidth } from '~/helpers/use-media-query';
import { StartEarningButton } from '~/pages/stacking/components/start-earning-button';

import { Button, Flag } from '@leather.io/ui';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';

const providerSlugMap = {
  fastPool: 'fast-pool',
  planbetter: 'plan-better',
  restake: 'restake',
  'xverse-pool': 'xverse-pool',
  stackingDao: 'stacking-dao',
} as const;

export function StackingProviderTable(props: HTMLStyledProps<'div'>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const isLargeViewport = useViewportMinWidth('md');

  const leadingColumn = useMemo<ColumnDef<StackingPool>>(
    () => ({
      accessorKey: 'name',
      cell: (info: any) => (
        <Flag
          img={<ProviderIcon providerId={info.row.original.providerId} />}
          color="ink.text-primary"
        >
          {info.getValue() as string}
        </Flag>
      ),
      header: () => (
        <ForceRowHeight>
          <PostLabelHoverCard postKey="stacking-providers" label="Provider" textStyle="label.03" />
        </ForceRowHeight>
      ),
      meta: { align: 'left' },
      maxSize: 40,
      size: 40,
    }),
    []
  );

  const extendedColumns = useMemo<ColumnDef<StackingPool>[]>(
    () => [
      {
        accessorKey: 'payout',
        header: () => (
          <styled.div textAlign="left" whiteSpace="nowrap">
            <PostLabelHoverCard postKey="stacking-rewards-tokens" label="Rewards token" textStyle="label.03" />
          </styled.div>
        ),
        cell: (info: any) => (
          <Flag
            display={['none', 'none', 'flex']}
            spacing="space.02"
            img={<ChainLogoIcon symbol={info.getValue() as string} />}
          >
            {info.getValue() as string}
          </Flag>
        ),
        meta: { align: 'left' },
        maxSize: 12,
      },
      {
        accessorKey: 'minAmount',
        cell: (info: any) => (
          <styled.div maxW="fit-content" textAlign="right" color="black">
            {info.getValue() === null ? '—' : (info.getValue() as string)}
          </styled.div>
        ),
        header: () => (
          <styled.div maxW="fit-content" whiteSpace="nowrap" textAlign="right">
            <PostLabelHoverCard postKey="stacking-minimum-commitment" label="Minimum commitment" textStyle="label.03" />
          </styled.div>
        ),
        meta: { align: 'right' },
        maxSize: 12,
      },
      {
        accessorKey: 'estApr',
        cell: (info: any) => <styled.div textAlign="right" color="black">{info.getValue() as string}</styled.div>,
        header: () => (
          <styled.div whiteSpace="nowrap" textAlign="right">
            <PostLabelHoverCard postKey="historical-yield" label="Historical yield" textStyle="label.03" />
          </styled.div>
        ),
        meta: { align: 'right' },
        maxSize: 12,
      },
      {
        accessorKey: 'fee',
        cell: (info: any) => <styled.div textAlign="right" color="black">{info.getValue() as string}</styled.div>,
        header: () => (
          <styled.div textAlign="right" whiteSpace="nowrap">
            <PostLabelHoverCard postKey="stacking-pool-fees" label="Fee" textStyle="label.03" />
          </styled.div>
        ),
        meta: { align: 'right' },
        maxSize: 12,
      },
    ],
    []
  );

  const trailingColumn = useMemo<ColumnDef<StackingPool>[]>(
    () => [
      {
        accessorKey: 'actions',
        header: () => null,
        cell: (info: any) => (
          <StartEarningButton
            slug={providerSlugMap[info.row.original.providerId as keyof typeof providerSlugMap]}
            poolAddresses={info.row.original.poolAddress}
          />
        ),
        meta: { align: 'right' },
        maxSize: 12,
      },
    ],
    []
  );

  const table = useReactTable({
    columns: [leadingColumn, ...(isLargeViewport ? extendedColumns : []), ...trailingColumn],
    data: stackingPoolList,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    defaultColumn: { size: 0 },
  });

  return (
    <Table.Root {...props}>
      <Table.Table>
        <Table.Head className={theadBorderBottom}>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <Table.Row key={headerGroup.id} className={rowPadding}>
              {headerGroup.headers.map((header: any) => (
                <Table.Header
                  key={header.id}
                  colSpan={header.colSpan}
                  px="space.04"
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
        <Table.Body>
          {table.getRowModel().rows.map((row: any) => (
            <Table.Row key={row.id} height="64px" className={rowPadding}>
              {row.getVisibleCells().map((cell: any) => (
                <styled.td
                  style={{ width: cell.column.getSize() + '%', textAlign: (cell.column.columnDef.meta as any)?.align === 'right' ? 'right' : 'left' }}
                  px="space.04"
                  key={cell.id}
                  align={(cell.column.columnDef.meta as any)?.align}
                  color="black"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </styled.td>
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

  const leadingColumn = useMemo<ColumnDef<LiquidStackingPool>>(
    () => ({
      accessorKey: 'name',
      cell: info => (
        <Flag
          img={<ProviderIcon providerId={info.row.original.providerId} />}
          color="ink.text-primary"
          w="100%"
        >
          {info.getValue() as string}
        </Flag>
      ),
      header: () => (
        <ForceRowHeight>
          <PostLabelHoverCard postKey="stacking-providers" label="Provider" textStyle="label.03" />
        </ForceRowHeight>
      ),
      meta: { align: 'left' },
      size: 40,
      maxSize: 40,
    }),
    []
  );

  const extendedColumns = useMemo<ColumnDef<LiquidStackingPool>[]>(
    () => [
      {
        accessorKey: 'payout',
        header: () => (
          <styled.div textAlign="left" whiteSpace="nowrap">
            <PostLabelHoverCard postKey="stacking-rewards-tokens" label="Rewards token" textStyle="label.03" />
          </styled.div>
        ),
        cell: info => (
          <Flag
            display={['none', 'none', 'flex']}
            spacing="space.02"
            img={<ChainLogoIcon symbol={info.getValue() as string} />}
          >
            {info.getValue() as string}
          </Flag>
        ),
        meta: { align: 'left' },
        size: 15,
        maxSize: 15,
      },
      {
        accessorKey: 'estApr',
        cell: info => <styled.div color="black">{info.getValue() as string}</styled.div>,
        header: () => (
          <PostLabelHoverCard postKey="historical-yield" label="Historical yield" textStyle="label.03" />
        ),
        meta: { align: 'right' },
        size: 15,
        maxSize: 15,
      },
      {
        accessorKey: 'fee',
        cell: info => <styled.div color="black">{info.getValue() as string}</styled.div>,
        header: () => (
          <PostLabelHoverCard postKey="stacking-pool-fees" label="Fee" textStyle="label.03" />
        ),
        meta: { align: 'right' },
        size: 15,
        maxSize: 15,
      },
    ],
    []
  );

  const trailingColumn = useMemo<ColumnDef<LiquidStackingPool>[]>(
    () => [
      {
      accessorKey: 'actions',
      header: () => null,
      cell: info => (
        <Link to={`/liquid-stacking/${info.row.original.slug}`} style={{ minWidth: 'fit-content' }}>
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
    columns: [leadingColumn, ...(useViewportMinWidth('md') ? extendedColumns : []), ...trailingColumn],
    data: liquidStackingProvidersList,
    debugTable: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <Table.Root {...props}>
      <Table.Table>
        <Table.Head className={theadBorderBottom}>
          {table.getHeaderGroups().map(headerGroup => (
            <Table.Row key={headerGroup.id} className={rowPadding}>
              {headerGroup.headers.map(header => (
                <Table.Header
                  px="space.04"
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
        <Table.Body>
          {table.getRowModel().rows.map(row => (
            <Table.Row key={row.id} height="64px" className={rowPadding}>
              {row.getVisibleCells().map(cell => (
                <styled.td
                  style={{ width: cell.column.getSize() + '%', textAlign: (cell.column.columnDef.meta as any)?.align === 'right' ? 'right' : 'left' }}
                  px="space.04"
                  key={cell.id}
                  align={(cell.column.columnDef.meta as any)?.align}
                  color="black"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </styled.td>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
