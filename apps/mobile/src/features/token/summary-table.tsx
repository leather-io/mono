import { Box, HasChildren, Text } from '@leather.io/ui/native';

interface SummaryTableRootProps extends HasChildren {
  title: string;
}

export function SummaryTableRoot({ title, children }: SummaryTableRootProps) {
  return (
    <Box>
      <SummaryTableHeader title={title} />
      <Box>{children}</Box>
    </Box>
  );
}

function SummaryTableHeader({ title }: { title: string }) {
  return (
    <Box>
      <Text variant="label03" px="5" py="2">
        {title}
      </Text>
    </Box>
  );
}

function SummaryTableLabel({ label }: { label: string }) {
  return (
    <Box flex={1}>
      <Text variant="label02" color="ink.text-subdued">
        {label}
      </Text>
    </Box>
  );
}
function SummaryTableValue({ value }: { value: string }) {
  return (
    <Box flex={1} alignItems="flex-end">
      <Text variant="label02">{value}</Text>
    </Box>
  );
}

interface SummaryTableItem {
  label: string;
  value: string;
}

export function SummaryTableItem({ label, value }: SummaryTableItem) {
  return (
    <Box flexDirection="row" px="5" py="2">
      <SummaryTableLabel label={label} />
      <SummaryTableValue value={value} />
    </Box>
  );
}

export const SummaryTable = {
  Root: SummaryTableRoot,
  Header: SummaryTableHeader,
  Item: SummaryTableItem,
};
