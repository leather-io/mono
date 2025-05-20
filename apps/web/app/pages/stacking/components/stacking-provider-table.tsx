import { useEffect, useMemo, useState } from 'react';
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
import { ChainLogoIcon } from '~/components/icons/chain-logo';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { ForceRowHeight, Table, rowPadding, theadBorderBottom } from '~/components/table';
import { content } from '~/data/content';
import {
  LiquidStackingPool,
  StackingPool,
  liquidStackingProvidersList,
  stackingPoolList,
} from '~/data/data';
import { getProtocolSlugByProviderId } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { providerIdToSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useViewportMinWidth } from '~/helpers/use-media-query';
import { StartEarningButton } from '~/pages/stacking/components/start-earning-button';
import { useDAOFee } from '~/queries/protocols/dao/fee';
import { useStackingTrackerPool } from '~/queries/stacking-tracker/pools';
import { useStackingTrackerProtocol } from '~/queries/stacking-tracker/protocols';
import { getPosts } from '~/utils/post-utils';
import { toHumanReadablePercent, toHumanReadableShortStx } from '~/utils/unit-convert';

import { Button, Flag, SkeletonLoader, useOnMount } from '@leather.io/ui';
import { isUndefined } from '@leather.io/utils';

const providerSlugMap = {
  fastPool: 'fast-pool',
  fastPoolV2: 'fast-pool-v2',
  planbetter: 'planbetter',
  restake: 'restake',
  xversePool: 'xverse-pool',
  stackingDao: 'stacking-dao',
} as const;

export function StackingProviderTable(props: HTMLStyledProps<'div'>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isMounted, setIsMounted] = useState(false);
  const isLargeViewport = useViewportMinWidth('md');
  const posts = getPosts();

  useOnMount(() => {
    setIsMounted(true);
  });

  const leadingColumn = useMemo<ColumnDef<StackingPool>>(
    () => ({
      id: 'name',
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
          <PostLabelHoverCard
            post={posts.stackingProviders}
            label={content.labels.provider}
            textStyle="label.03"
          />
        </ForceRowHeight>
      ),
      meta: { align: 'left' },
      maxSize: 40,
      size: 40,
    }),
    [posts.stackingProviders]
  );

  const extendedColumns = useMemo<ColumnDef<StackingPool>[]>(
    () => [
      {
        id: 'payout',
        accessorKey: 'payout',
        header: () => (
          <styled.div textAlign="left" whiteSpace="nowrap">
            <PostLabelHoverCard
              post={posts.stackingRewardsTokens}
              label={content.labels.rewardsToken}
              textStyle="label.03"
            />
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
        id: 'tvl',
        accessorKey: 'tvl',
        cell: info => {
          const slug = providerIdToSlug(info.row.original.providerId);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { isLoading, isError, data } = useStackingTrackerPool(slug);
          if (isLoading) {
            return <SkeletonLoader isLoading w={40} h={16} />;
          }
          if (isError || isUndefined(data?.lastCycle?.pool.stacked_amount)) {
            return <styled.div>{(info.getValue() as string) || '-'}</styled.div>;
          }
          return (
            <styled.div>{toHumanReadableShortStx(data.lastCycle.pool.stacked_amount)}</styled.div>
          );
        },
        header: () => (
          <styled.div maxW="fit-content" whiteSpace="nowrap" textAlign="right">
            <PostLabelHoverCard
              post={posts.totalLockedValueTvl}
              label={posts.totalLockedValueTvl?.title || ''}
              textStyle="label.03"
            />
          </styled.div>
        ),
        meta: { align: 'left' },
        size: 15,
        maxSize: 15,
      },
      {
        id: 'minAmount',
        accessorKey: 'minAmount',
        cell: (info: any) => (
          <styled.div maxW="fit-content" textAlign="right" color="black">
            {info.getValue() === null ? '—' : (info.getValue() as string)}
          </styled.div>
        ),
        header: () => (
          <styled.div maxW="fit-content" whiteSpace="nowrap" textAlign="right">
            <PostLabelHoverCard
              post={posts.stackingMinimumCommitment}
              label={content.labels.minimumCommitment}
              textStyle="label.03"
            />
          </styled.div>
        ),
        meta: { align: 'right' },
        maxSize: 12,
      },
      {
        id: 'estApr',
        accessorKey: 'estApr',
        cell: info => {
          const slug = providerIdToSlug(info.row.original.providerId);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { data, isLoading, isError } = useStackingTrackerPool(slug);

          if (isLoading) {
            return <SkeletonLoader isLoading w={40} h={16} />;
          }

          if (isError || !data?.entity.apr) {
            return <styled.div>{info.getValue() as string}</styled.div>;
          }

          return <styled.div>{toHumanReadablePercent(data.entity.apr)}</styled.div>;
        },
        header: () => (
          <styled.div whiteSpace="nowrap" textAlign="right">
            <PostLabelHoverCard
              post={posts.historicalYield}
              label={content.labels.historicalYield}
              textStyle="label.03"
            />
          </styled.div>
        ),
        meta: { align: 'right' },
        maxSize: 12,
      },
      {
        id: 'fee',
        accessorKey: 'fee',
        cell: info => {
          const slug = providerIdToSlug(info.row.original.providerId);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { data, isLoading, isError } = useStackingTrackerPool(slug);

          if (isLoading) {
            return <SkeletonLoader isLoading w={40} h={16} />;
          }

          if (isError || isUndefined(data?.entity.fee)) {
            return <styled.div>{info.getValue() as string}</styled.div>;
          }

          return <styled.div>{toHumanReadablePercent(data.entity.fee * 100)}</styled.div>;
        },
        header: () => (
          <styled.div textAlign="right" whiteSpace="nowrap">
            <PostLabelHoverCard
              post={posts.stackingPoolFees}
              label={content.labels.fee}
              textStyle="label.03"
            />
          </styled.div>
        ),
        meta: { align: 'right' },
        maxSize: 12,
      },
    ],
    [
      posts.stackingRewardsTokens,
      posts.stackingPoolFees,
      posts.historicalYield,
      posts.totalLockedValueTvl,
      posts.stackingMinimumCommitment,
    ]
  );

  const trailingColumn = useMemo<ColumnDef<StackingPool>[]>(
    () => [
      {
        id: 'actions',
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
    columns: [
      leadingColumn,
      ...(isMounted && isLargeViewport ? extendedColumns : []),
      ...trailingColumn,
    ],
    data: stackingPoolList as StackingPool[],
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
                  align={header.column.columnDef.meta?.align}
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
                  style={{
                    width: cell.column.getSize() + '%',
                    textAlign: cell.column.columnDef.meta?.align === 'right' ? 'right' : 'left',
                  }}
                  px="space.04"
                  key={cell.id}
                  align={cell.column.columnDef.meta?.align}
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
  const [isMounted, setIsMounted] = useState(false);
  const isLargeViewport = useViewportMinWidth('md');
  const posts = getPosts();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const leadingColumn = useMemo<ColumnDef<LiquidStackingPool>>(
    () => ({
      id: 'name',
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
          <PostLabelHoverCard
            post={posts.stackingProviders}
            label={content.labels.provider}
            textStyle="label.03"
          />
        </ForceRowHeight>
      ),
      meta: { align: 'left' },
      size: 40,
      maxSize: 40,
    }),
    [posts.stackingProviders]
  );

  const largeViewportColumns = useMemo<ColumnDef<LiquidStackingPool>[]>(
    () => [
      {
        id: 'payout',
        accessorKey: 'payout',
        header: () => (
          <styled.div textAlign="left" whiteSpace="nowrap">
            <PostLabelHoverCard
              post={posts.stackingRewardsTokens}
              label={content.labels.rewardsToken}
              textStyle="label.03"
            />
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
        accessorKey: 'tvl',
        id: 'tvl',
        header: () => (
          <styled.div maxW="fit-content" whiteSpace="nowrap" textAlign="right">
            <PostLabelHoverCard
              post={posts.totalLockedValueTvl}
              label={posts.totalLockedValueTvl?.title || ''}
              textStyle="label.03"
            />
          </styled.div>
        ),
        cell: info => {
          const slug = getProtocolSlugByProviderId(info.row.original.providerId);

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { isLoading, isError, data } = useStackingTrackerProtocol(slug);

          if (isLoading) {
            return <SkeletonLoader isLoading w={40} h={16} />;
          }

          if (isError || isUndefined(data?.lastCycle?.token.stacked_amount)) {
            return <styled.div>{info.getValue() as string}</styled.div>;
          }

          return (
            <styled.div>{toHumanReadableShortStx(data.lastCycle.token.stacked_amount)}</styled.div>
          );
        },
        meta: { align: 'left' },
        size: 15,
        maxSize: 15,
      },
      {
        accessorKey: 'estApr',
        id: 'estApr',
        header: () => (
          <PostLabelHoverCard
            post={posts.historicalYield}
            label={content.labels.historicalYield}
            textStyle="label.03"
          />
        ),
        cell: info => {
          const slug = getProtocolSlugByProviderId(info.row.original.providerId);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { data, isLoading, isError } = useStackingTrackerProtocol(slug);

          if (isLoading) {
            return <SkeletonLoader isLoading w={40} h={16} />;
          }

          if (isError || !data?.entity.apr) {
            return <styled.div color="black">{info.getValue() as string}</styled.div>;
          }

          return <styled.div>{toHumanReadablePercent(data.entity.apr)}</styled.div>;
        },
        meta: { align: 'right' },
        size: 15,
        maxSize: 15,
      },
      {
        id: 'fee',
        accessorKey: 'fee',
        header: () => (
          <PostLabelHoverCard
            post={posts.stackingPoolFees}
            label={content.labels.fee}
            textStyle="label.03"
          />
        ),
        cell: info => {
          const slug = getProtocolSlugByProviderId(info.row.original.providerId);
          if (slug !== 'stacking-dao') {
            return <styled.div>{info.getValue() as string}</styled.div>;
          }

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { isLoading, isError, data: fee } = useDAOFee();

          if (isLoading) {
            return <SkeletonLoader isLoading w={40} h={16} />;
          }

          if (isError || isUndefined(fee)) {
            return <styled.div>{info.getValue() as string}</styled.div>;
          }

          return <styled.div>{toHumanReadablePercent(fee.multipliedBy(100))}</styled.div>;
        },
        meta: { align: 'right' },
        size: 15,
        maxSize: 15,
      },
    ],
    [
      posts.stackingRewardsTokens,
      posts.stackingPoolFees,
      posts.historicalYield,
      posts.totalLockedValueTvl,
    ]
  );

  const trailingColumn = useMemo<ColumnDef<LiquidStackingPool>>(
    () => ({
      id: 'actions',
      accessorKey: 'actions',
      header: () => null,
      cell: info => (
        <Link to={`/stacking/liquid/${info.row.original.slug}`} style={{ minWidth: 'fit-content' }}>
          <Button size="xs" whiteSpace="nowrap" minW="fit-content">
            Start earning
          </Button>
        </Link>
      ),
      meta: { align: 'right' },
    }),
    []
  );

  const columns = useMemo(() => {
    const cols: ColumnDef<LiquidStackingPool>[] = [leadingColumn];

    if (isMounted && isLargeViewport) {
      cols.push(...largeViewportColumns);
    }

    cols.push(trailingColumn);

    return cols;
  }, [leadingColumn, largeViewportColumns, trailingColumn, isMounted, isLargeViewport]);

  const table = useReactTable({
    columns,
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
                  style={{
                    width: cell.column.getSize() + '%',
                    textAlign:
                      (cell.column.columnDef.meta as any)?.align === 'right' ? 'right' : 'left',
                  }}
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
