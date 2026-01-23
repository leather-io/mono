import { ReactNode } from 'react';

import { Box, Stack } from 'leather-styles/jsx';

interface CategorySectionProps {
  title: string;
  children: ReactNode;
}

export function CategorySection({ title, children }: CategorySectionProps) {
  return (
    <Stack gap="space.03" py="space.04" borderBottom="default">
      <Box fontSize="sm" fontWeight="medium" color="ink.text-subdued">
        {title}
      </Box>
      <Stack gap="space.02">{children}</Stack>
    </Stack>
  );
}
