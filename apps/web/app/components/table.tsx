/* eslint-disable react/display-name */
import { forwardRef } from 'react';

import { css } from 'leather-styles/css';
import { HTMLStyledProps, styled } from 'leather-styles/jsx';

export const theadBorderBottom = css({
  _after: {
    content: '""',
    display: 'block',
    pos: 'absolute',
    width: '100%',
    left: 0,
    height: '1px',
    bg: 'ink.border-default',
  },
});

export function SortableHeader(props: HTMLStyledProps<'div'>) {
  return <styled.div _hover={{ textDecoration: 'underline' }} {...props} />;
}

export const TableContainer = forwardRef<HTMLDivElement, HTMLStyledProps<'div'>>((props, ref) => (
  <styled.div border="default" borderRadius="sm" ref={ref} {...props} />
));

export const StyledTable = forwardRef<HTMLTableElement, HTMLStyledProps<'table'>>((props, ref) => (
  <styled.table
    borderCollapse="separate"
    overflow="hidden"
    w="100%"
    px="space.05"
    pos="relative"
    ref={ref}
    {...props}
  />
));

export const TableHead = forwardRef<HTMLTableSectionElement, HTMLStyledProps<'thead'>>(
  (props, ref) => <styled.thead height="40px" className={theadBorderBottom} ref={ref} {...props} />
);

export const TableHeader = forwardRef<HTMLTableCellElement, HTMLStyledProps<'th'>>((props, ref) => (
  <styled.th textStyle="label.03" color="ink.text-subdued" ref={ref} {...props} />
));

export const TableRow = forwardRef<HTMLTableRowElement, HTMLStyledProps<'tr'>>((props, ref) => (
  <styled.tr textStyle="label.03" color="ink.text-subdued" ref={ref} {...props} />
));

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLStyledProps<'tbody'>>(
  (props, ref) => <styled.tbody ref={ref} {...props} />
);

export const Table = {
  Root: TableContainer,
  Table: StyledTable,
  Head: TableHead,
  Header: TableHeader,
  Row: TableRow,
  Body: TableBody,
};
