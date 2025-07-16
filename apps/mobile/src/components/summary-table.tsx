import { ReactNode } from 'react';

import { Box, HasChildren, Text } from '@leather.io/ui/native';

export function SummaryTableRoot({ children }: HasChildren) {
  return <Box>{children}</Box>;
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
    <Box flexDirection="row" py="2">
      <SummaryTableLabel>{label}</SummaryTableLabel>
      <SummaryTableValue>{value}</SummaryTableValue>
    </Box>
  );
}

export const SummaryTable = {
  Root: SummaryTableRoot,
  Item: SummaryTableItem,
  Value: SummaryTableValue,
  Label: SummaryTableLabel,
};
