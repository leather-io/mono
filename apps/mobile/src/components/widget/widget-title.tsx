import { Box, ChevronRightIcon, Text } from '@leather.io/ui/native';

interface WidgetTitleProps {
  title: string;
  balance?: React.ReactNode;
}

export function WidgetTitle({ title, balance }: WidgetTitleProps) {
  return (
    <>
      <Text variant="label01">{title}</Text>
      <ChevronRightIcon variant="small" color="ink.text-subdued" />
      {balance && (
        <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
          {balance}
        </Box>
      )}
    </>
  );
}
