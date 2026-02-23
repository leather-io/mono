import { ReactNode } from 'react';

import { Box, HasChildren, Text } from '@leather.io/ui/native';

export function SummaryTableRoot({ children }: HasChildren) {
  return <Box>{children}</Box>;
}

function SummaryTableLabel({ children }: HasChildren) {
  return (
    <Text variant="label02" color="ink.text-subdued">
      {children}
    </Text>
  );
}

function SummaryTableValue({ children }: HasChildren) {
  return (
    <Box flex={1} maxWidth="100%" alignItems="flex-end">
      <Text variant="body02" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '100%' }}>
        {children}
      </Text>
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
