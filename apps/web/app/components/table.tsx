/* eslint-disable react/display-name */
import { forwardRef } from 'react';

import { css } from 'leather-styles/css';
import { Flex, FlexProps, HTMLStyledProps, styled } from 'leather-styles/jsx';

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

export const rowPadding = css({
  '& td:first-child': { pl: 'space.05' },
  '& td:last-child': { pr: 'space.05' },
  '& th:first-child': { pl: 'space.05' },
  '& th:last-child': { pr: 'space.05' },
});

export function SortableHeader({ children, ...props }: HTMLStyledProps<'div'>) {
  return (
    <styled.div {...props}>
      <styled.span zIndex={99} _hover={{ textDecoration: 'underline' }}>
        {children}
      </styled.span>
    </styled.div>
  );
}

export const TableRoot = forwardRef<HTMLDivElement, HTMLStyledProps<'div'>>((props, ref) => (
  <styled.div border="default" borderRadius="sm" ref={ref} {...props} />
));

export const StyledTable = forwardRef<HTMLTableElement, HTMLStyledProps<'table'>>((props, ref) => (
  <styled.table
    borderCollapse="separate"
    borderSpacing={0}
    overflow="hidden"
    w="100%"
    pos="relative"
    ref={ref}
    {...props}
  />
));

export const TableHead = forwardRef<HTMLTableSectionElement, HTMLStyledProps<'thead'>>(
  (props, ref) => (
    <styled.thead height="40px" className={theadBorderBottom} mx="space.05" ref={ref} {...props} />
  )
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
  Root: TableRoot,
  Table: StyledTable,
  Head: TableHead,
  Header: TableHeader,
  Row: TableRow,
  Body: TableBody,
};

export function ForceRowHeight(props: FlexProps) {
  return <Flex alignItems="center" height="40px" {...props} />;
}
