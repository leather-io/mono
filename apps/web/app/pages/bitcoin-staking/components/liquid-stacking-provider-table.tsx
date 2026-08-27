import { ReactElement, useEffect, useMemo, useState } from 'react';

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
import { bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { learnArticles } from '~/content/learn-content';
import { LiquidStackingPool } from '~/data/data';
import { getProtocolSlugByProviderId } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { useStackingTrackerProtocol } from '~/queries/stacking-tracker/protocols';
import { openExternalLink } from '~/utils/external-links';
import { useViewportMinWidth } from '~/utils/hooks/use-media-query';
import { toHumanReadablePercent, toHumanReadableShortStx } from '~/utils/unit-convert';

import { Button, ExternalLinkIcon, Flag, SkeletonLoader } from '@leather.io/ui';
import { isUndefined } from '@leather.io/utils';

interface LiquidStackingProviderTableProps extends HTMLStyledProps<'div'> {
  providers: LiquidStackingPool[];
}

export function LiquidStackingProviderTable({
  providers,
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
            label={bitcoinStakingLabels.provider}
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
              label={bitcoinStakingLabels.rewardsToken}
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
              label={bitcoinStakingLabels.historicalYield}
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
            label={bitcoinStakingLabels.fee}
            textStyle="label.03"
          />
        ),
        cell: info => <styled.div>{info.getValue() as string}</styled.div>,
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
      cell: info => (
        <Button
          size="sm"
          whiteSpace="nowrap"
          minW="fit-content"
          iconEnd={ExternalLinkIcon}
          onClick={() => openExternalLink(info.row.original.url)}
          data-testid={`liquid-start-earning-${info.row.original.slug}`}
        >
          {bitcoinStakingLabels.startEarning}
        </Button>
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
