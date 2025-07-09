import { ReactNode } from 'react';

import { Box, HasChildren, Text } from '@leather.io/ui/native';

interface SummaryTableRootProps extends HasChildren {
  title: string;
}

export function SummaryTableRoot({ title, children }: SummaryTableRootProps) {
  return (
    <Box>
      <SummaryTableHeader>{title}</SummaryTableHeader>
      <Box>{children}</Box>
    </Box>
  );
}

function SummaryTableHeader({ children }: HasChildren) {
  return (
    <Box>
      <Text variant="label03" px="5" py="2">
        {children}
      </Text>
    </Box>
  );
}

function SummaryTableLabel({ children }: HasChildren) {
  return (
    <Box flex={1}>
      <Text variant="label02" color="ink.text-subdued">
        {children}
      </Text>
    </Box>
  );
}

function SummaryTableValue({ children }: HasChildren) {
  return (
    <Box flex={1} alignItems="flex-end">
      <Text variant="label02">{children}</Text>
    </Box>
  );
}

interface SummaryTableItem {
  label: string;
  value: ReactNode;
}

export function SummaryTableItem({ label, value }: SummaryTableItem) {
  return (
    <Box flexDirection="row" px="5" py="2">
      <SummaryTableLabel>{label}</SummaryTableLabel>
      <SummaryTableValue>{value}</SummaryTableValue>
    </Box>
  );
}

export const SummaryTable = {
  Root: SummaryTableRoot,
  Header: SummaryTableHeader,
  Item: SummaryTableItem,
};
