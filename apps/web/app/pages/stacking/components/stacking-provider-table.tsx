import { ReactElement, useEffect, useMemo, useState } from 'react';
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
import { LearnHoverCard } from '~/components/learn-hover-card';
import { ForceRowHeight, Table, rowPadding, theadBorderBottom } from '~/components/table';
import { EM_DASH } from '~/constants/constants';
import { learnArticles } from '~/content/learn-content';
import { stackingLabels } from '~/content/stacking-content';
import {
  LiquidStackingPool,
  StackingPool,
  liquidStackingProvidersList,
  stackingPoolList,
} from '~/data/data';
import { getProtocolSlugByProviderId } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { providerIdToSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { StartEarningButton } from '~/pages/stacking/components/start-earning-button';
import { useProtocolFee } from '~/queries/protocols/use-protocol-fee';
import { useStackingTrackerPool } from '~/queries/stacking-tracker/pools';
import { useStackingTrackerProtocol } from '~/queries/stacking-tracker/protocols';
import { openExternalLink } from '~/utils/external-links';
import { useViewportMinWidth } from '~/utils/hooks/use-media-query';
import {
  toHumanReadableMicroStx,
  toHumanReadablePercent,
  toHumanReadableShortStx,
} from '~/utils/unit-convert';

import { Button, ExternalLinkIcon, Flag, SkeletonLoader, useOnMount } from '@leather.io/ui';
import { isNumber, isUndefined } from '@leather.io/utils';

const providerSlugMap = {
  fastPool: 'fast-pool',
  fastPoolV2: 'fast-pool-v2',
  planbetter: 'planbetter',
  restake: 'restake',
  xversePool: 'xverse-pool',
  stackingDao: 'stacking-dao',
} as const;

export function StackingProviderTable(props: HTMLStyledProps<'div'>): ReactElement {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isMounted, setIsMounted] = useState(false);
  const isLargeViewport = useViewportMinWidth('md');

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
          <LearnHoverCard
            article={learnArticles.stackingProviders}
            label={stackingLabels.provider}
            textStyle="label.03"
          />
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
        id: 'payout',
        accessorKey: 'payout',
        header: () => (
          <styled.div textAlign="left" whiteSpace="nowrap">
            <LearnHoverCard
              article={learnArticles.stackingRewardsTokens}
              label={stackingLabels.rewardsToken}
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
            return <styled.div>{(info.getValue() as string) || EM_DASH}</styled.div>;
          }
          return (
            <styled.div>{toHumanReadableShortStx(data.lastCycle.pool.stacked_amount)}</styled.div>
          );
        },
        header: () => (
          <styled.div maxW="fit-content" whiteSpace="nowrap" textAlign="right">
            <LearnHoverCard
              article={learnArticles.totalLockedValueTvl}
              label={learnArticles.totalLockedValueTvl?.title || ''}
              textStyle="label.03"
            />
          </styled.div>
        ),
        meta: { align: 'right' },
        size: 15,
        maxSize: 15,
      },
      {
        id: 'minAmount',
        accessorKey: 'minimumDelegationAmount',
        cell: info => {
          const minAmount = (info.row.original as any).minAmount;
          if (minAmount) {
            return (
              <styled.div textAlign="right" color="black">
                {minAmount}
              </styled.div>
            );
          }

          const value = info.getValue();
          return (
            <styled.div>{isNumber(value) ? toHumanReadableMicroStx(value) : EM_DASH}</styled.div>
          );
        },
        header: () => (
          <styled.div maxW="fit-content" whiteSpace="nowrap" textAlign="right">
            <LearnHoverCard
              article={learnArticles.stackingMinimumCommitment}
              label={stackingLabels.minimumCommitment}
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
            return <styled.div>{EM_DASH}</styled.div>;
          }

          return <styled.div>{toHumanReadablePercent(data.entity.apr)}</styled.div>;
        },
        header: () => (
          <styled.div whiteSpace="nowrap" textAlign="right">
            <LearnHoverCard
              article={learnArticles.historicalYield}
              label={stackingLabels.historicalYield}
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
            return <styled.div>{EM_DASH}</styled.div>;
          }

          return <styled.div>{toHumanReadablePercent(data.entity.fee * 100)}</styled.div>;
        },
        header: () => (
          <styled.div textAlign="right" whiteSpace="nowrap">
            <LearnHoverCard
              article={learnArticles.stackingPoolFees}
              label={stackingLabels.fee}
              textStyle="label.03"
            />
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
  const activeSortKeys = table.getState().sorting.map(s => s.id);

  return (
    <Table.Root width="100%" overflowX="auto" {...props}>
      <Table.Table>
        <Table.Head className={theadBorderBottom}>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <Table.Row key={headerGroup.id} className={rowPadding}>
              {headerGroup.headers.map((header: any) => (
                <Table.Header
                  key={header.id}
                  colSpan={header.colSpan}
                  px="space.04"
                  style={{
                    width: `${header.getSize()}%`,
                  }}
                  fontWeight={activeSortKeys.includes(header.id) ? 'bold' : 'normal'}
                  textAlign={header.column.columnDef.meta?.align ?? 'left'}
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

interface LiquidStackingProviderTableProps extends HTMLStyledProps<'div'> {
  providers?: LiquidStackingPool[];
  linksOutToProvider?: boolean;
}

export function LiquidStackingProviderTable({
  providers = liquidStackingProvidersList,
  linksOutToProvider = false,
  ...props
}: LiquidStackingProviderTableProps): ReactElement {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isMounted, setIsMounted] = useState(false);
  const isLargeViewport = useViewportMinWidth('md');

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
          <LearnHoverCard
            article={learnArticles.stackingProviders}
            label={stackingLabels.provider}
            textStyle="label.03"
          />
        </ForceRowHeight>
      ),
      meta: { align: 'left' },
      size: 40,
      maxSize: 40,
    }),
    []
  );

  const largeViewportColumns = useMemo<ColumnDef<LiquidStackingPool>[]>(
    () => [
      {
        id: 'payout',
        accessorKey: 'payout',
        header: () => (
          <styled.div textAlign="left" whiteSpace="nowrap">
            <LearnHoverCard
              article={learnArticles.stackingRewardsTokens}
              label={stackingLabels.rewardsToken}
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
            <LearnHoverCard
              article={learnArticles.totalLockedValueTvl}
              label={learnArticles.totalLockedValueTvl?.title || ''}
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
        meta: { align: 'right' },
        size: 15,
        maxSize: 15,
      },
      {
        accessorKey: 'estApr',
        id: 'estApr',
        header: () => (
          <styled.div whiteSpace="nowrap" textAlign="right">
            <LearnHoverCard
              article={learnArticles.historicalYield}
              label={stackingLabels.historicalYield}
              textStyle="label.03"
            />
          </styled.div>
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
          <LearnHoverCard
            article={learnArticles.stackingPoolFees}
            label={stackingLabels.fee}
            textStyle="label.03"
          />
        ),
        cell: info => {
          const slug = getProtocolSlugByProviderId(info.row.original.providerId);
          if (!slug) {
            return <styled.div>{info.getValue() as string}</styled.div>;
          }

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const protocolFeeQuery = useProtocolFee(slug);

          if (protocolFeeQuery?.isLoading) {
            return <SkeletonLoader isLoading w={40} h={16} />;
          }

          if (protocolFeeQuery?.isError || isUndefined(protocolFeeQuery?.data)) {
            return <styled.div>{info.getValue() as string}</styled.div>;
          }

          return (
            <styled.div>
              {toHumanReadablePercent(protocolFeeQuery?.data?.multipliedBy(100) || 0)}
            </styled.div>
          );
        },
        meta: { align: 'right' },
        size: 15,
        maxSize: 15,
      },
    ],
    []
  );

  const trailingColumn = useMemo<ColumnDef<LiquidStackingPool>>(
    () => ({
      id: 'actions',
      accessorKey: 'actions',
      header: () => null,
      cell: info =>
        linksOutToProvider ? (
          <Button
            size="sm"
            whiteSpace="nowrap"
            minW="fit-content"
            iconEnd={ExternalLinkIcon}
            onClick={() => openExternalLink(info.row.original.url)}
            data-testid={`liquid-start-earning-${info.row.original.slug}`}
          >
            Start earning
          </Button>
        ) : (
          <Link
            to={`/stacking/liquid/${info.row.original.slug}`}
            style={{ minWidth: 'fit-content' }}
          >
            <Button size="sm" whiteSpace="nowrap" minW="fit-content">
              Start earning
            </Button>
          </Link>
        ),
      meta: { align: 'right' },
    }),
    [linksOutToProvider]
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
    data: providers,
    debugTable: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <Table.Root width="100%" overflowX="auto" {...props}>
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
                  textAlign={(header.column.columnDef.meta as any)?.align ?? 'left'}
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
