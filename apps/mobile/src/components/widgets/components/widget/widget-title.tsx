import { useTheme } from '@shopify/restyle';

import { Box, ChevronRightIcon, Text, Theme } from '@leather.io/ui/native';

import { FiatBalance } from '../balance/fiat-balance';

interface WidgetTitleProps {
  title: string;
  totalBalance?: string;
}

export function WidgetTitle({ title, totalBalance }: WidgetTitleProps) {
  const theme = useTheme<Theme>();
  return (
    <>
      <Text variant="label01">{title}</Text>
      <ChevronRightIcon variant="small" color={theme.colors['ink.text-subdued']} />
      {totalBalance && (
        <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
          <FiatBalance balance={totalBalance} color="ink.text-subdued" />
        </Box>
      )}
    </>
  );
}
