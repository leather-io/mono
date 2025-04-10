import { ReactElement, useMemo, useState } from 'react';
import { Link } from 'react-router';

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
import { ImgFillLoader } from '~/components/img-loader';
import { SortableHeader, Table, rowPadding, theadBorderBottom } from '~/components/table';
import { PoolSlug } from '~/features/stacking/utils/types-preset-pools';
import { ProtocolSlug } from '~/features/stacking/utils/types-preset-protocols';

import { Button, Flag } from '@leather.io/ui';

const offsetMinAmountColumm = css({
  transform: [null, null, 'translateX(-15%)'],
  maxWidth: '120px',
});

const offsetEstAprColumm = css({
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

interface EarnProvider {
  provider: string;
  minAmount: string | null;
  estApr: string;
  payout: string;
  icon: ReactElement;
  slug: PoolSlug;
}
const earnProviders: EarnProvider[] = [
  {
    provider: 'Fast Pool',
    icon: <ImgFillLoader src="icons/fastpool.webp" width="24" fill="black" />,
    minAmount: null,
    estApr: '5%',
    payout: 'STX',
    slug: 'fast-pool',
  },
  {
    provider: 'PlanBetter',
    icon: <ImgFillLoader src="icons/planbetter.webp" width="24" fill="black" />,
    minAmount: '200 STX',
    estApr: '10%',
    payout: 'STX',
    slug: 'plan-better',
  },
  {
    provider: 'Restake',
    icon: <ImgFillLoader src="icons/restake.webp" width="24" fill="#124044" />,
    minAmount: '100 STX',
    estApr: '11%',
    payout: 'STX',
    slug: 'restake',
  },
  {
    provider: 'Xverse Pool',
    icon: <ImgFillLoader src="icons/xverse.webp" width="24" fill="black" />,
    minAmount: '100 STX',
    estApr: '10%',
    payout: 'BTC',
    slug: 'xverse',
  },
  {
    provider: 'Stacking DAO',
    icon: <ImgFillLoader src="icons/stacking-dao.webp" width="24" fill="#1C3830" />,
    minAmount: '100 STX',
    estApr: '16%',
    payout: 'STX',
    slug: 'stacking-dao',
  },
];

export function EarnProviderTable(props: HTMLStyledProps<'div'>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<EarnProvider>[]>(
    () => [
      {
        accessorKey: 'provider',
        cell: info => (
          <Flag img={info.row.original.icon} color="ink.text-primary">
            {info.getValue() as string}
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
        sortUndefined: 'last',
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

            <Link
              to={`/stacking/pooled-stacking/${info.row.original.slug}`}
              style={{ minWidth: 'fit-content' }}
            >
              <Button size="xs" ml="space.04" minW="fit-content">
                Start earning
              </Button>
            </Link>
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

interface LiquidStackingProvider {
  provider: string;
  estApr: string;
  payout: string;
  icon: ReactElement;
  slug: ProtocolSlug;
}
const liquidStackingProviders: LiquidStackingProvider[] = [
  {
    provider: 'StackingDAO',
    estApr: '5%',
    payout: 'stSTX',
    icon: <ImgFillLoader src="icons/stacking-dao.webp" width="24" fill="black" />,
    slug: 'stacking-dao',
  },
  {
    provider: 'LISA',
    estApr: '10%',
    payout: 'LiSTX',
    icon: <ImgFillLoader src="icons/lisa.webp" width="24" fill="#FB9DF1" />,
    slug: 'lisa',
  },
];

export function LiquidStackingProviderTable(props: HTMLStyledProps<'div'>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<LiquidStackingProvider>[]>(
    () => [
      {
        accessorKey: 'provider',
        cell: info => (
          <Flag img={info.row.original.icon} color="ink.text-primary">
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
          <styled.div className={offsetEstAprColumm}>{info.getValue() as string}</styled.div>
        ),
        header: () => <SortableHeader className={offsetEstAprColumm}>Est. APR</SortableHeader>,
        meta: { align: 'right' },
      },
      {
        accessorKey: 'payout',
        header: () => <SortableHeader>Liquid token</SortableHeader>,
        cell: info => (
          <Flex justifyContent="space-between" alignItems="center">
            <Flag
              spacing="space.02"
              img={
                <>
                  {info.getValue() === 'LiSTX' && <DummyIcon />}
                  {info.getValue() === 'stSTX' && <DummyIcon />}
                </>
              }
            >
              {info.getValue() as string}
            </Flag>

            <Link
              to={`/stacking/liquid-stacking/${info.row.original.slug}`}
              style={{ minWidth: 'fit-content' }}
            >
              <Button size="xs" ml="space.04" minW="fit-content">
                Start earning
              </Button>
            </Link>
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
    data: liquidStackingProviders,
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
